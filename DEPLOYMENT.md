# FPL Live Deployment Guide

This guide walks you through deploying FPL Live to production using free cloud service tiers.

## Prerequisites

- GitHub account
- Cloudflare account (free)
- Vercel account (free)
- Upstash account (free, optional)

## Step 1: Deploy Cloudflare Worker Proxy

The Cloudflare Worker is essential for bypassing FPL API blocks from cloud providers.

### 1.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 1.2 Login to Cloudflare

```bash
wrangler auth login
```

### 1.3 Deploy the Worker

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

### 1.4 Note the Worker URL

After deployment, you'll see output like:
```
Published fpl-proxy (1.23s)
  https://fpl-proxy.your-subdomain.workers.dev
```

Save this URL for the next step.

## Step 2: Set Up Redis Cache (Optional)

Redis caching significantly improves performance and reduces API calls.

### 2.1 Create Upstash Account

1. Go to https://upstash.com
2. Sign up for free account
3. Create a new Redis database
4. Note the REST URL and Token

### 2.2 Configure Redis

From your Upstash dashboard, copy:
- REST URL (e.g., `https://abc-123.upstash.io`)
- REST Token (long string starting with `A...`)

## Step 3: Deploy Next.js App to Vercel

### 3.1 Option A: Deploy from GitHub

1. Push your code to GitHub repository
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see Step 4)
6. Deploy

### 3.2 Option B: Deploy with Vercel CLI

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

## Step 4: Environment Variables

Set these environment variables in your Vercel dashboard (Project Settings > Environment Variables):

### Required Variables

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_PROXY_URL` | Your Cloudflare Worker URL | `https://fpl-proxy.workers.dev` |

### Optional Variables (for Redis caching)

| Variable | Value | Example |
|----------|-------|---------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis URL | `https://abc-123.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token | `AY...` |

## Step 5: Test Deployment

1. Visit your Vercel app URL
2. Enter your FPL Manager ID
3. Verify live score and team display work
4. Test league functionality

## Step 6: Custom Domain (Optional)

### 6.1 Add Domain to Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

### 6.2 Update Worker URL (if needed)

If using a custom domain, you may want to proxy API calls through your domain instead of directly to the Cloudflare Worker.

## Troubleshooting

### Common Issues

#### 1. 403 Forbidden Errors

**Problem**: FPL API returns 403 errors
**Solution**: Ensure Cloudflare Worker is deployed and `NEXT_PUBLIC_PROXY_URL` is correct

#### 2. Slow Performance

**Problem**: App loads slowly
**Solutions**:
- Enable Redis caching with Upstash
- Check if you're hitting API rate limits
- Verify cache TTL settings

#### 3. League Data Not Loading

**Problem**: League tables show loading indefinitely
**Solutions**:
- Check manager ID is correct
- Verify manager is in the selected league
- Check browser console for API errors

#### 4. Auto-substitutions Not Working

**Problem**: Substitutions not showing correctly
**Solutions**:
- Ensure current gameweek has finished fixtures
- Check if players actually didn't play (0 minutes)
- Verify formation rules aren't being violated

### Monitoring

#### Check Cloudflare Worker Status

```bash
wrangler tail
```

#### Check Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Functions" tab
4. View real-time logs

#### Test API Endpoints

Test your Cloudflare Worker directly:

```bash
curl https://your-worker.workers.dev/api/bootstrap-static/
```

## Performance Optimization

### Cache Strategy

The app uses a multi-level caching strategy:

1. **Redis Cache** (if configured): 15 minutes for bootstrap data, 2 minutes for live data
2. **Session Storage**: Fallback when Redis unavailable
3. **React Query**: In-memory caching with automatic refetch

### Free Tier Limits

Monitor your usage to stay within free tiers:

- **Vercel**: 100GB bandwidth/month
- **Cloudflare Workers**: 100,000 requests/day
- **Upstash Redis**: 10,000 requests/day

### Scaling Considerations

If you exceed free tier limits:

1. **Cloudflare Workers**: $5/month for 10M requests
2. **Vercel Pro**: $20/month for 1TB bandwidth
3. **Upstash**: $0.20 per 100K requests

## Security

### Environment Variables

- Never commit `.env` files to git
- Use environment variables for all secrets
- Rotate Redis tokens periodically

### API Rate Limiting

The app respects FPL API rate limits through:
- Aggressive caching
- Request batching
- Exponential backoff on errors

## Maintenance

### Regular Tasks

1. **Monitor Usage**: Check service dashboards monthly
2. **Update Dependencies**: `npm update` monthly
3. **Test Functionality**: Verify during active gameweeks

### Seasonal Updates

Before each FPL season:
1. Test with new season data
2. Update player/team mappings if needed
3. Verify API endpoints still work

## Support

For deployment issues:
1. Check this guide first
2. Review error logs in Vercel/Cloudflare
3. Open GitHub issue with error details