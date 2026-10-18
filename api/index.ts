import { createApp } from '../src/app';
import { buildContainer } from '../src/container';

let app: ReturnType<typeof createApp> | null = null;

function getApp(): ReturnType<typeof createApp> {
  if (!app) {
    const container = buildContainer();
    app = createApp(container);
  }
  return app;
}

export default function handler(req: any, res: any): void {
  getApp()(req, res);
}
