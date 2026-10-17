# Catford Labs

Public homepage for Catford Labs — games and apps for the world’s markets.

The site uses the Catford Labs lockup and a palette drawn from the Play7 logo: teal, coral, lemon zest, cream, and ink.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## GitHub Pages

In GitHub: **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**. Custom domain is `www.catfordlabs.com` (see `CNAME`). Turn on **Enforce HTTPS** once the certificate is listed as ready.

Apex `catfordlabs.com` must use these GitHub Pages A records only:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Do not keep `85.199.111.153` — that address is not GitHub, so Let’s Encrypt cannot issue a certificate for the apex. `www` and `sentrycam` should CNAME to `sekou0-dev.github.io`.
