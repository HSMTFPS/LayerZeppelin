# Changelog — LayerZeppelin.pt

## [2026-04-28] Security Audit + Merge + Cleanup

### Security Fixes
- Fix cookie consent ID bug (`pref-preferncia` → `pref-preferencias`)
- Fix HTTPS redirect: moved inline script to `HTTPSRedirect.init()` module in script.js
- Fix `ConsoleMessage` undefined object
- Fix theme storage key inconsistency (`lz_theme`)
- Fix manifest.json description (outdated)
- Update CSP headers: added GoatCounter (`gc.zgo.at`) and GitHub API (`api.github.com`)
- Update CSP: added `'unsafe-inline'` to style-src for dynamic theme toggle
- Add `upgrade-insecure-requests` meta tag (replacing inline script)
- Remove inline HTTPS redirect scripts from cookies.html, privacy.html, terms.html
- Add `SecurityProtection` module (anti-copy, anti-right-click, anti-devtools shortcuts)

### Merge from "por saber" version
- Add RockYou top passwords to Matrix background animation
- Add Mr Robot panel with shell commands and Evil Corp references
- Add expanded console easter egg messages (Hardware Arsenal, Konami hint)
- Add `user-select: none` CSS anti-copy
- Add CNCS certification placeholder
- Add CTFtime, PentesterLab, PortSwigger Academy platforms

### Content Changes
- Remove skills: Nikto, Gobuster/Dirb, Hashcat, Ubuntu/Server
- Remove from Tools Arsenal: Gobuster, Nikto, Hashcat, Ubuntu Server
- Lower all skill percentages to more realistic levels
- Filter GitHub repos to only show `LayerZeppelin` repo
- Add Cyber Home Lab cert (then removed per request)

### Infrastructure
- Reformat style.css from minified to readable with section comments
- Add detailed comments to script.js (13 modules documented)
- Add security audit comments to index.html
- Update .gitignore (node_modules, dns-config-amen.csv, images/images/)
- Create backups/ directory and CHANGELOG.md
- Remove dns-config-amen.csv from tracking (sensitive DNS data)

### Files Changed
- script.js: +401 lines (comments, SecurityProtection, HTTPSRedirect, RockYou words, Mr Robot shell)
- style.css: reformatted from minified to readable, added anti-copy, Mr Robot styles
- index.html: added CNCS cert, CTFs, removed skills, lowered percentages, removed inline scripts
- _headers: updated CSP for GoatCounter + GitHub API
- .gitignore: added node_modules, dns-config, images/images/
- manifest.json: fixed description
- cookies.html, privacy.html, terms.html: replaced inline HTTPS script with meta tag