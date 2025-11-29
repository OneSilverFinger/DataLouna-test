import Fastify from 'fastify';
import cors from '@fastify/cors';
import itemsRoute from './routes/items.route';
import purchaseRoute from './routes/purchase.route';
import { disconnectCache } from './services/cache.service';

const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true,
  });

  app.register(itemsRoute);
  app.register(purchaseRoute);

  app.addHook('onClose', async () => {
    await disconnectCache();
  });

  return app;
};

export default buildApp;
