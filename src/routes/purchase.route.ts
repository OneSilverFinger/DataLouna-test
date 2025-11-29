import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { InsufficientFundsError, NotFoundError, purchaseProduct } from '../services/purchase.service';
import { PurchaseRequestDto, PurchaseResponseDto } from '../types/purchase';

const purchaseRequestSchema = z.object({
  userId: z.number().int().positive(),
  productId: z.number().int().positive(),
});

export default async function purchaseRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: PurchaseRequestDto;
    Reply: PurchaseResponseDto | { message: string };
  }>(
    '/purchase',
    {
      schema: {
        body: {
          type: 'object',
          required: ['userId', 'productId'],
          properties: {
            userId: { type: 'integer', minimum: 1 },
            productId: { type: 'integer', minimum: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['userId', 'productId', 'purchaseId', 'balance'],
            properties: {
              userId: { type: 'integer' },
              productId: { type: 'integer' },
              purchaseId: { type: 'integer' },
              balance: { type: 'number' },
            },
          },
          400: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            required: ['message'],
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = purchaseRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Invalid request body' });
      }

      try {
        const result = await purchaseProduct(parsed.data.userId, parsed.data.productId);
        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message });
        }

        if (error instanceof InsufficientFundsError) {
          return reply.code(400).send({ message: error.message });
        }

        request.log.error({ err: error }, 'Unexpected error during purchase');
        return reply.code(500).send({ message: 'Internal server error' });
      }
    }
  );
}
