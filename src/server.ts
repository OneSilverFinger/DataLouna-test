import 'dotenv/config';
import buildApp from './app';
import { ensureCacheConnection } from './services/cache.service';

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

async function start(): Promise<void> {
  const app = buildApp();

  try {
    await ensureCacheConnection();
    await app.listen({ port, host });
    app.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void start();
