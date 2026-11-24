# Overview (English)

This extension automatically replaces hard-to-read fonts on websites with user-selected fonts. Available for **Chrome** and **Firefox**.
Choose from **10 fonts** (7 body + 3 monospace). Settings persist across sessions.
It targets only hard-to-read fonts to improve legibility while preserving the original site design.
Characters are replaced only within the glyph coverage of the selected font; uncovered scripts (e.g., Arabic, Thai) fall back to the site's original font via CSS cascade.

## Install

| Edition | Chrome | Firefox |
|---|---|---|
| **Default** (font selector) | [Chrome Web Store](https://chromewebstore.google.com/detail/faghcoiecciapdokelomjgeknadokgeg) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselect/) |
| **Noto Sans JP fixed** | [Chrome Web Store](https://chromewebstore.google.com/detail/ipfbjlmjgfobhnncbggaaiknhdgkcdfe) | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/replacefontselectnotosans/) |

> Requires Firefox desktop 140+ or Firefox Android 142+.

## Usage

Open the popup from the browser's extensions menu. In the default edition, select body and monospace fonts and the body weight. The fixed edition uses Noto Sans JP + UDEV Gothic JPDOC with Regular body weight and has no font selector. Settings save automatically; reload the page after changing settings or toggling the extension.

Browser settings pages, pages where extensions cannot run, and some editing/design services are excluded. If fonts do not change, check that the extension is enabled and reload the page.

## Features

- 🔘 **On/Off Toggle**: Enable or disable replacement from the popup.
- ⚡ **Fast & Lightweight**: Minimal impact on page load.
- 🔄 **Fully Automatic**: Works without configuration. Some editors and design tools are excluded to preserve editing and icons.
- 📦 **Modern Web Support**: Supports open and closed **Shadow DOM** elements.
- 🎯 **Preserve Intent**: Replaces fonts by type to maintain the intended layout.
- 🛠️ **Broad Coverage**: Covers everything from OS standard fonts to popular web fonts.
- 💬 **Contact Support**: Send inquiries to Kagayoi Support from the popup. Firefox requires permission for personally identifying and authentication information at installation or update, and requests separate permission for personal communications before sending.
- 🚫 **Exclusion List**: Specify sites or page URLs to leave unreplaced in the popup's **Exclusions** tab.

## Fonts and Replacement Logic

General fonts are replaced with the selected body font, and monospace fonts with the selected monospace font. See [Fonts and Replacement Logic](section-01.md) for the font list and weights.
