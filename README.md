# FPL Live

A real-time Fantasy Premier League tracking application that provides live scores, team visualization, and league standings.

## Features

- **Live Score Tracking**: Real-time points calculation with auto-refresh
- **Team Pitch Visualization**: Interactive football pitch showing your starting XI and bench
- **Auto-Substitution Algorithm**: Formation-aware automatic substitutions for non-playing players
- **League Management**: Live league tables with rank changes
- **Performance Mode**: Optimized for large leagues (50+ members)
- **Cost-Effective**: Runs entirely on free cloud service tiers

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Proxy**: Cloudflare Workers (bypasses FPL API blocks)
- **Caching**: Upstash Redis (optional, falls back to session storage)
- **Deployment**: Vercel

## Quick Start

### 1. Deploy Cloudflare Worker Proxy

```bash
cd cloudflare-worker
npm install
npx wrangler deploy
```

Copy the deployed worker URL for the next step.

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/fpl-live)

Or manually:

```bash
npm install
npm run build
vercel deploy
```

### 3. Environment Variables

Set these in your Vercel dashboard:

```env
NEXT_PUBLIC_PROXY_URL=https://your-worker-name.workers.dev
UPSTASH_REDIS_REST_URL=your-redis-url (optional)
UPSTASH_REDIS_REST_TOKEN=your-redis-token (optional)
```

### 4. Find Your Manager ID

1. Go to https://fantasy.premierleague.com
2. Navigate to your team
3. Copy the number from the URL (e.g., `1234567`)

## Architecture

```
User Browser
    ↓
Next.js App (Vercel)
    ↓
Cloudflare Worker Proxy
    ↓
FPL API (fantasy.premierleague.com)
    ↓
Redis Cache (Upstash)
```

## Core Features

### Live Score Calculation

- Accurate real-time points calculation
- Bonus points projection for ongoing matches
- Captain/Vice-captain multiplier handling
- Transfer cost deduction

### Auto-Substitution Algorithm

- Respects FPL formation rules (min 3 DEF, 2 MID, 1 FWD)
- Bench order priority
- Goalkeeper substitution handling
- Toggle on/off functionality

### Performance Optimization

- Multi-level caching strategy
- Performance mode for large leagues
- Session storage fallback
- Efficient API batching

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy Cloudflare Worker
cd cloudflare-worker
npx wrangler dev
```

## Cost Breakdown (Free Tiers)

- **Vercel**: 100GB bandwidth/month
- **Cloudflare Workers**: 100,000 requests/day
- **Upstash Redis**: 10,000 requests/day
- **Total Monthly Cost**: $0

## API Endpoints

The Cloudflare Worker proxy supports all FPL API endpoints:

- `/api/bootstrap-static/` - General game data
- `/api/entry/{id}/` - Manager information
- `/api/entry/{id}/event/{gw}/picks/` - Team picks
- `/api/event/{gw}/live/` - Live player data
- `/api/fixtures/` - Fixture information
- `/api/leagues-classic/{id}/standings/` - League standings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is not affiliated with Fantasy Premier League or the Premier League. It uses publicly available APIs for educational purposes.