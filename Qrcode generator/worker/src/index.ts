import { fromHono } from "chanfana";
import { Hono } from "hono";
import QRCode from 'qrcode';

const app = new Hono<{ Bindings: Env }>();
const openapi = fromHono(app, { docs_url: "/" });

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, ""); 

    // --- CORS HEADERS (Essential for Option 1) ---
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- 1. THE REDIRECTION PATH (High Speed) ---
    const redirectToken = path.slice(1);
    if (redirectToken && !redirectToken.includes('/') && request.method === "GET" && !path.startsWith("/api") && !path.startsWith("/v1")) {
      const targetUrl = await env.REDIRECT_KV.get(redirectToken);
      if (targetUrl) {
        // Log scan asynchronously
        ctx.waitUntil((async () => {
          const statsKey = `stats:${redirectToken}`;
          const currentStatsStr = await env.REDIRECT_KV.get(statsKey);
          let stats = currentStatsStr ? JSON.parse(currentStatsStr) : { clicks: 0 };
          stats.clicks += 1;
          await env.REDIRECT_KV.put(statsKey, JSON.stringify(stats));
        })());
        return Response.redirect(targetUrl, 302);
      }
    }

    // --- 2. THE GENERATION API (Called by your Frontend) ---
    if (request.method === "POST" && path === "/v1/qrcode/url") {
      try {
        const { target_url } = await request.json() as any;
        const newToken = Math.random().toString(36).substring(2, 9);

        // Store the target
        await env.REDIRECT_KV.put(newToken, target_url);
        await env.REDIRECT_KV.put(`stats:${newToken}`, JSON.stringify({ clicks: 0 }));

        return new Response(JSON.stringify({ success: true, token: newToken }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response("Error", { status: 500, headers: corsHeaders });
      }
    }

    // --- 3. FALLBACK TO HONO/DOCS ---
    return app.fetch(request, env, ctx);
  },
};