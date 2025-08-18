# FPL API Cloudflare Worker Proxy

This Cloudflare Worker acts as a proxy to bypass CORS (Cross-Origin Resource Sharing) restrictions when accessing the Fantasy Premier League (FPL) API from browser-based applications.

## The Problem

The official Fantasy Premier League API (`https://fantasy.premierleague.com/api`) does not include CORS headers in its responses. This means browser-based applications cannot directly fetch data from the FPL API due to the browser's same-origin policy security restrictions.

## How This Worker Solves It

### 1. **Server-Side Requests**
Cloudflare Workers run on Cloudflare's edge network, not in the browser. This means they're not subject to CORS restrictions and can make requests to any API endpoint.

### 2. **Request Proxying**
The worker:
- Receives requests from your browser application at the worker endpoint
- Forwards these requests to the actual FPL API
- Fetches the response from FPL's servers
- Returns the data to your application with proper CORS headers added

### 3. **CORS Headers Injection**
The worker adds the following CORS headers to every response:
- `Access-Control-Allow-Origin: *` - Allows requests from any origin
- `Access-Control-Allow-Methods: GET, POST, OPTIONS` - Specifies allowed HTTP methods
- `Access-Control-Allow-Headers: Content-Type` - Allows Content-Type header in requests
- `Access-Control-Max-Age: 86400` - Caches preflight requests for 24 hours

### 4. **Additional Benefits**

#### Request Masquerading
The worker adds browser-like headers to requests sent to the FPL API:
- User-Agent string mimics a real browser
- Includes Accept and Accept-Language headers
- Sets the Referer to the official FPL website

This helps avoid potential blocking of automated requests.

#### Smart Caching
The worker implements intelligent caching strategies based on the endpoint:
- Static data (bootstrap): 15 minutes cache
- Live/fixture data: 2 minutes cache  
- User entries/picks: 5 minutes cache
- Default: 10 minutes cache

This reduces load on the FPL API and improves response times.

## Architecture Flow

```
Browser App → Cloudflare Worker → FPL API
     ↑              ↓                ↓
     ←─────── (with CORS) ←──────────
```

1. Your browser app makes a request to the Cloudflare Worker URL
2. The worker receives the request and strips the `/api/` prefix
3. It constructs the full FPL API URL with the remaining path
4. Makes a server-side request to the FPL API (no CORS restrictions)
5. Receives the response from FPL
6. Adds CORS headers to make it browser-friendly
7. Returns the modified response to your browser app

## Usage

Deploy this worker to your Cloudflare account and use the worker URL as your API base instead of directly calling the FPL API:

```javascript
// Instead of:
fetch('https://fantasy.premierleague.com/api/bootstrap-static/')

// Use:
fetch('https://your-worker.workers.dev/api/bootstrap-static/')
```

The worker transparently handles the CORS issue while maintaining the same API structure and responses.