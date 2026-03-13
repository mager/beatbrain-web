# Beatbrain Web

## Development

```
npm run dev
```

Set up `mager/occipital` locally on port 8080.


## Migrate

```
npx prisma migrate dev
```

## Podcast Ingestion

BeatBrain includes a Python pipeline to populate 100 brain-focused podcast categories from Spotify.

### Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `SPOTIPY_CLIENT_ID` and `SPOTIPY_CLIENT_SECRET` — from [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

2. Install Python dependencies:
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

3. Run the migration (if you haven't already):
   ```bash
   npx prisma migrate dev --name add_podcasts
   ```

### Run Ingestion

```bash
cd scripts
python ingest_podcasts.py
```

The script will:
- Search 100 brain-focused categories (Neuroplasticity, Stoicism, Deep Work, etc.)
- Pull top 5 podcasts per category from Spotify
- Skip duplicates (checks existing `spotifyId`)
- Report stats: new shows added per category, total count, errors

Categories cover: Cognitive Science, Philosophy, Productivity, Behavioral Economics, Biohacking, Learning, Mental Health, Creativity, Leadership, and Systems Thinking.

