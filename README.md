<p align="center">
  <pre>
   __                             _       ____  ___   ___   ___ 
  / _|  ___    ___   __ _    ___ | |     |_  / |_ _| / __| / __|
 | (_| / _ \  / -_) / _` |  / -_)| |__    / /   | |  \__ \ \__ \
  \__/ \___/  \___| \__,_|  \___||____|  /___| |___| |___/ |___/
  </pre>
</p>

# LayerZeppelin.pt

> Cybersecurity Portfolio by Hermínio Teles

## About

Professional cybersecurity portfolio website featuring terminal aesthetics, Matrix background animation, and modern dark theme design.

## Security Features

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **HTTP Security Headers** - HSTS, X-Frame-Options, X-Content-Type-Options
- **No external scripts** - All JavaScript is self-hosted
- **GDPR Compliant** - Cookie consent banner, privacy policy, terms of use
- **Semantic HTML** - Proper accessibility with ARIA labels
- **Responsive Design** - Mobile-friendly with hamburger menu

## Pages

- `index.html` - Main portfolio page
- `privacy.html` - Privacy Policy (GDPR compliant)
- `terms.html` - Terms of Use
- `cookies.html` - Cookie Policy

## Files

```
index.html          # Main page
style.css           # Styles (minified-ready)
script.js           # JavaScript (external, minified-ready)
privacy.html        # Privacy policy
terms.html          # Terms of use
cookies.html        # Cookie policy
_headers            # HTTP security headers (Netlify/Cloudflare)
robots.txt          # Search engine directives
sitemap.xml         # Site map for SEO
manifest.json       # PWA manifest
favicon.png         # Favicon (512x512)
favicon.svg         # SVG favicon
images/             # Logo, profile, project images
LICENSE             # MIT License
```

## Deployment

Deploy to any static hosting:

```bash
# Cloudflare Pages
git push origin main

# Netlify
git push origin main

# GitHub Pages
git push origin main
```

### HTTP Security Headers

The `_headers` file configures:

- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

## Legal

- **Privacy Policy**: GDPR compliant (PT)
- **Terms of Use**: Including acceptable use policy (PT)
- **Cookie Policy**: Explains cookie usage and consent (PT)
- **Cookie Consent Banner**: GDPR/CCPA compliant

## Technologies

- HTML5 (Semantic)
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- No frameworks or dependencies

## Contact

- **Email**: contact@layerzeppelin.pt
- **GitHub**: [github.com/HSMTFPS](https://github.com/HSMTFPS)
- **LinkedIn**: [linkedin.com/in/hermínio-teles](https://www.linkedin.com/in/hermínio-teles-6826b8358/)

## License

MIT License - Copyright (c) 2026 Hermínio Teles. See [LICENSE](LICENSE).

---

<p align="center">
  <strong>LayerZeppelin.pt</strong> - Cybersecurity Portfolio
</p>