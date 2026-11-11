# GiftRound

Free product giveaway site (Android + Windows browsers).

- Free signup / login
- Free entry (no payment)
- Public participant list for logged-in users
- 30-day countdown
- Random winner announced when the round ends

## Run locally

```bash
cd free-giveaway
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local data is stored in `data/store.json`.

## Deploy (GitHub + Vercel)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `AUTH_SECRET` — long random string (32+ chars)
   - `BLOB_READ_WRITE_TOKEN` — from a Vercel Blob store linked to the project
4. Deploy.

On Vercel, data is stored in **Vercel Blob** (not the local JSON file).

## Configure prize

Edit `data/store.json` locally (or the stored blob in production after first write):

- `giveaway.prizeName`
- `giveaway.prizeDescription`

Round dates are created automatically on first use (`startsAt` / `endsAt` = 30 days).

## Notes

- This is a free giveaway demo, not a paid lottery.
- Follow local laws for promotions and giveaways in your region.
