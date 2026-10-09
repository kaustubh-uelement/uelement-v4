# UElement website

Next.js 16 (App Router, TypeScript), exported as a static site. 85 pages, generated from two data files.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to /out
npm start        # serves /out locally
```

Upload the contents of `out/` to any static host (Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, or your current server). No Node server is needed.

## Where things live

| To change | Edit |
|---|---|
| Company facts, phone, email, address, CIN, navigation menus | `lib/site.ts` |
| Products, platforms, industries, services, founders, beliefs, FAQs, stories, partner programmes, resource and support pages | `lib/content.ts` |
| Form fields | `lib/forms.ts` |
| Colours, materials (paper, glass, metal), type scale | `app/globals.css` (tokens at the top) |
| Home page | `app/page.tsx` |
| Gold ring hero | `components/HeroRing.tsx` |
| Logo | `components/ui.tsx` → `Logo` (replace the placeholder mark with the official logo) |

## Forms

Forms work without a backend: they open the visitor's email app with the message written out to `contact@uelement.co`.
To receive submissions directly, set `formEndpoint` in `lib/site.ts` to a form service URL (Formspree, Basin, Web3Forms or your own API).

## Before launch

- Fill the `[PLACEHOLDERS]` on Customer Success Stories, Research, CSR and Industry Recognition, or hide those items. They render as dashed boxes so they are easy to spot.
- Review the Privacy and Terms drafts with legal counsel.
- Confirm partner programme terms (`programmes` in `lib/content.ts`) and partner listings.
- Replace the placeholder logo mark with the official logo.
- Set up redirects from old URLs (see the Redirects tab in the sitemap workbook).
