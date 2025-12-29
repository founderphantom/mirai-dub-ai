interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);

    // For HTML responses, fix the script tags to use type="module"
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Add type="module" to script tags that use defer (Expo's entry scripts)
      html = html.replace(
        /<script src="(.*?)" defer><\/script>/g,
        '<script type="module" src="$1"></script>'
      );

      return new Response(html, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          "content-type": "text/html; charset=utf-8",
        },
      });
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
