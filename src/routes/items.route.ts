import { FastifyInstance } from 'fastify';
import { fetchItemsWithMinPrices } from '../services/skinport.service';
import { ItemPrice } from '../types/items';

export default async function itemsRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: ItemPrice[] }>(
    '/items',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              required: ['marketHashName', 'minPriceTradable', 'minPriceNonTradable'],
              properties: {
                marketHashName: { type: 'string' },
                minPriceTradable: { type: 'number', nullable: true },
                minPriceNonTradable: { type: 'number', nullable: true },
              },
            },
          },
        },
      },
    },
    async () => {
      const items = await fetchItemsWithMinPrices();
      return items;
    }
  );
}
