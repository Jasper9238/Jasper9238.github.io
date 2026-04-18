export interface Env {
  REDIRECT_KV: KVNamespace;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext // This defines the missing context for background tasks
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Handle CORS Preflight (Important for browser security)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. THE REDIRECTOR (High-Speed GET)
    // Matches any path that isn't empty or the API
    if (request.method === "GET" && path !== "/" && !path.startsWith("/api/")) {
      const token = path.substring(1);
      const data = await env.REDIRECT_KV.get(token);

      if (data) {
        const record = JSON.parse(data);
        
        // Use ctx.waitUntil to update stats AFTER the user is redirected
        // This is how you keep redirects under 50ms
        ctx.waitUntil((async () => {
          record.clicks = (record.clicks || 0) + 1;
          await env.REDIRECT_KV.put(token, JSON.stringify(record));
        })());

        return Response.redirect(record.targetUrl, 302);
      }
      return new Response("QR Code not found", { status: 404 });
    }

    // 3. THE GENERATOR (High-Speed POST)
    if (request.method === "POST" && path === "/api/generate") {
      try {
        const { targetUrl, username } = await request.json() as { targetUrl: string, username: string };
        
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: "No URL provided" }), { status: 400 });
        }

        const token = Math.random().toString(36).substring(2, 8);
        const finalTarget = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

        const newRecord = {
          targetUrl: finalTarget,
          username: username || 'anonymous',
          clicks: 0,
          createdAt: Date.now()
        };

        await env.REDIRECT_KV.put(token, JSON.stringify(newRecord));

        return new Response(JSON.stringify({ 
          success: true, 
          token: token,
          shortUrl: `${url.origin}/${token}`
        }), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
      }
    }

    return new Response("QR Redirector API is online", { status: 200 });
  },
};