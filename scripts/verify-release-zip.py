import hashlib
from html.parser import HTMLParser
import json
import posixpath
import re
import stat
import sys
from urllib.parse import unquote, urlsplit
import zipfile


def fail(message):
    raise ValueError(message)


def check_references(request, expected):
    texts = request['texts']
    manifest = json.loads(texts['manifest.json'])
    candidates = request['referenceCandidates']
    pending = []
    seen = set()

    def add(name):
        if not isinstance(name, str) or not name or '\\' in name or re.search(r'[\x00-\x1f\x7f]', name):
            fail(f'不正な参照パス: {name!r}')
        name = name.removeprefix('/')
        if not name or any(part in ('', '.', '..') for part in name.split('/')):
            fail(f'不正な参照パス: {name!r}')
        if name not in expected or expected[name]['size'] == 0:
            fail(f'参照ファイル不足: {name}')
        if name not in seen:
            seen.add(name)
            if name.lower().endswith(('.html', '.css')):
                pending.append(name)

    def local_ref(base, value):
        if not value or value.startswith(('__REPLACE_FONT_BASE__', '#', '//')):
            return
        parsed = urlsplit(value)
        if parsed.scheme or not parsed.path:
            return
        resource = unquote(parsed.path)
        if '\\' in resource:
            fail(f'不正な参照パス: {value!r}')
        if resource.startswith('/'):
            name = posixpath.normpath(resource).lstrip('/')
        else:
            name = posixpath.normpath(posixpath.join(posixpath.dirname(base), resource))
        if name == '..' or name.startswith('../'):
            fail(f'参照パスが範囲外: {value!r}')
        add(name)

    def icon_map(value):
        if isinstance(value, str):
            add(value)
        elif isinstance(value, dict):
            for icon in value.values():
                add(icon)
        elif value is not None:
            fail('manifest icon の形式が不正')

    icon_map(manifest.get('icons'))
    for key in ('action', 'browser_action', 'page_action'):
        action = manifest.get(key)
        if action is not None:
            if not isinstance(action, dict):
                fail(f'manifest {key} の形式が不正')
            icon_map(action.get('default_icon'))
            if action.get('default_popup'):
                add(action['default_popup'])
    background = manifest.get('background', {})
    if not isinstance(background, dict):
        fail('manifest background の形式が不正')
    if background.get('service_worker'):
        add(background['service_worker'])
    if background.get('page'):
        add(background['page'])
    for item in background.get('scripts', []):
        add(item)
    for content in manifest.get('content_scripts', []):
        for key in ('js', 'css'):
            for item in content.get(key, []):
                add(item)
    for field in ('options_page', 'devtools_page'):
        if manifest.get(field):
            add(manifest[field])
    for field in ('options_ui', 'side_panel', 'sidebar_action'):
        section = manifest.get(field)
        if isinstance(section, dict):
            for key in ('page', 'default_path', 'default_panel'):
                if section.get(key):
                    add(section[key])
            icon_map(section.get('default_icon'))
    for item in manifest.get('chrome_url_overrides', {}).values():
        add(item)
    for group in manifest.get('web_accessible_resources', []):
        for resource in group['resources']:
            if not isinstance(resource, str) or not resource:
                fail(f'不正な公開リソース: {resource!r}')
            if '*' not in resource:
                add(resource)
                continue
            if resource.startswith('/') or '\\' in resource or any(part in ('', '.', '..') for part in resource.split('/')) or re.search(r'[\x00-\x1f\x7f?#]', resource):
                fail(f'不正な公開リソース: {resource!r}')
            pattern = re.compile('^' + re.escape(resource).replace(r'\*', '.*') + '$')
            matches = [name for name in candidates if pattern.fullmatch(name)]
            if not matches:
                fail(f'公開リソースに一致する実ファイルなし: {resource}')
            for name in matches:
                add(name)

    class HTMLRefs(HTMLParser):
        def __init__(self, base):
            super().__init__(convert_charrefs=True)
            self.base = base

        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if tag in ('script', 'img', 'source') and attrs.get('src'):
                local_ref(self.base, attrs['src'])
            elif tag == 'link' and attrs.get('href'):
                local_ref(self.base, attrs['href'])

    url_pattern = re.compile(r'''url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)''', re.I)
    import_pattern = re.compile(r'''@import\s+(?:"([^"]*)"|'([^']*)')''', re.I)
    while pending:
        name = pending.pop()
        content = texts.get(name)
        if content is None:
            fail(f'参照ファイルを読めません: {name}')
        if name.lower().endswith('.html'):
            parser = HTMLRefs(name)
            parser.feed(content)
            parser.close()
        else:
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.S)
            for pattern in (url_pattern, import_pattern):
                for match in pattern.finditer(content):
                    local_ref(name, next(value for value in match.groups() if value is not None))


def verify(request):
    expected = {entry['name']: entry for entry in request['files']}
    check_references(request, expected)
    names = set()
    with zipfile.ZipFile(request['archive']) as archive:
        for entry in archive.infolist():
            name = entry.orig_filename
            if (name != entry.filename or not name or name.startswith('/') or '\\' in name
                    or re.search(r'[\x00-\x1f\x7f]', name)
                    or re.match(r'^[a-zA-Z]:', name) or '//' in name
                    or any(part in ('.', '..') for part in name.split('/'))):
                fail(f'危険な ZIP パス: {name!r}')
            if name in names:
                fail(f'重複 ZIP パス: {name}')
            names.add(name)
            if stat.S_ISLNK(entry.external_attr >> 16):
                fail(f'ZIP 内リンク禁止: {name}')
            if entry.is_dir():
                if not any(filename.startswith(name) for filename in expected):
                    fail(f'予期しないディレクトリ: {name}')
                if entry.file_size != 0:
                    fail(f'ディレクトリの内容が不正: {name}')
                with archive.open(entry) as contents:
                    if contents.read(1):
                        fail(f'ディレクトリの内容が不正: {name}')
                continue
            if name not in expected:
                fail(f'予期しない ZIP ファイル: {name}')
            wanted = expected.pop(name)
            if entry.file_size != wanted['size']:
                fail(f'サイズが不一致: {name}')
            digest = hashlib.sha256()
            with archive.open(entry) as contents:
                while chunk := contents.read(1024 * 1024):
                    digest.update(chunk)
            if digest.hexdigest() != wanted['sha256']:
                fail(f'内容が不一致: {name}')
    if expected:
        fail(f'ZIP 内の必須ファイル不足: {", ".join(expected)}')


try:
    verify(json.loads(sys.stdin.buffer.read().decode('utf-8')))
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)
