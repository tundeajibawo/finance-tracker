export default {
  async fetch(req: Request, env: any): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname.replace(/^\/api/, '') || '/', 'https://api.everynaira.ng');
      target.search = url.search;
      return fetch(new Request(target, req));
    }
    return env.ASSETS.fetch(req);
  },
};
