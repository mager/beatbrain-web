# Podcast Ingestion System

BeatBrain's podcast ingestion pipeline fetches brain-focused podcasts from Spotify and stores them for browsing.

## Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  Cron/Scheduler │────▶│  ingest.py  │────▶│  Spotify API │
└─────────────────┘     └─────────────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PostgreSQL  │
                        │  (Podcasts)  │
                        └──────────────┘
```

## Features

- **Rate limiting**: 1.2s between requests (conservative, well under Spotify limits)
- **Exponential backoff**: Automatic retry on rate limit (429) errors
- **Deduplication**: Skips podcasts already in DB by Spotify ID
- **Dry-run mode**: Test without writing to database
- **Incremental updates**: Process specific categories or all 100

## Usage

### First-time setup (populate all categories)

```bash
cd scripts
pip install -r requirements.txt

# Dry run first (recommended)
python ingest_podcasts.py --dry-run

# Full ingestion (100 categories × 10 podcasts = ~1000 podcasts)
python ingest_podcasts.py
```

### Update specific categories

```bash
# Refresh just these categories
python ingest_podcasts.py --categories "Stoicism" "Deep Work" "Biohacking"
```

### Scheduled updates (cron)

Run daily at 3 AM to refresh top categories:

```bash
# Add to crontab
crontab -e

# Add this line:
0 3 * * * cd /path/to/beatbrain-web/scripts && /usr/bin/python3 ingest_podcasts.py --categories "Neuroplasticity" "Stoicism" "Deep Work" "Behavioral Economics" "Biohacking" >> /var/log/beatbrain-podcasts.log 2>&1
```

Or use OpenClaw cron for cloud-native scheduling.

## Rate Limiting Strategy

Spotify's Client Credentials flow allows approximately 1 request/second. We use:

- **1.2s delay** between requests (conservative buffer)
- **Exponential backoff** on 429 errors (wait Retry-After header or 2^n seconds)
- **Max 3 retries** per request

This means a full ingestion (100 categories) takes ~2 minutes minimum, usually 3-4 minutes with retries/delays.

## Monitoring

The script outputs:
- Progress per category
- New vs duplicate counts
- API request count
- Duration
- Error summary

## Categories (100 Brain-Focused)

See `ingest_podcasts.py` → `BRAIN_CATEGORIES` array. Organized into:

1. Cognitive Science & Neuroscience
2. Philosophy & Stoicism
3. Productivity & Deep Work
4. Behavioral Economics
5. Biohacking & Optimization
6. Learning & Skill Acquisition
7. Mental Health & Wellness
8. Creativity & Innovation
9. Leadership & Communication
10. Future & Systems Thinking
