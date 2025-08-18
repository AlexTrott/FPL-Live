export interface Env {
  ENVIRONMENT?: string;
}

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const endpoint = url.pathname.replace('/api/', '');
    
    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'No endpoint specified' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    try {
      const fplUrl = `${FPL_BASE_URL}/${endpoint}${url.search}`;
      
      const response = await fetch(fplUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://fantasy.premierleague.com/',
        },
      });

      const data = await response.text();
      
      return new Response(data, {
        status: response.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': getCacheControl(endpoint),
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch from FPL API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};

function getCacheControl(endpoint: string): string {
  if (endpoint.includes('bootstrap-static')) {
    return 'public, max-age=900, s-maxage=900';
  }
  if (endpoint.includes('fixtures') || endpoint.includes('live')) {
    return 'public, max-age=120, s-maxage=120';
  }
  if (endpoint.includes('entry') || endpoint.includes('picks')) {
    return 'public, max-age=300, s-maxage=300';
  }
  return 'public, max-age=600, s-maxage=600';
}