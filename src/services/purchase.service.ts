import sql from '../db/client';
import {
  getProductById,
  getUserById,
  insertPurchase,
  updateUserBalance,
  type DbSql,
} from '../db/queries';
import { PurchaseResponseDto } from '../types/purchase';

export class NotFoundError extends Error {}
export class InsufficientFundsError extends Error {}

function parseNumeric(value: string, context: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Failed to parse numeric value for ${context}`);
  }

  return parsed;
}

export async function purchaseProduct(
  userId: number,
  productId: number
): Promise<PurchaseResponseDto> {
  return sql.begin(async (tx: DbSql) => {
    const user = await getUserById(tx, userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const product = await getProductById(tx, productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const productPrice = parseNumeric(product.price, 'product price');

    const updatedUser = await updateUserBalance(tx, user.id, productPrice);
    if (!updatedUser) {
      throw new InsufficientFundsError('Insufficient funds');
    }

    const purchase = await insertPurchase(tx, user.id, product.id);

    const updatedBalance = parseNumeric(updatedUser.balance, 'updated user balance');

    const result: PurchaseResponseDto = {
      userId: user.id,
      productId: product.id,
      purchaseId: purchase.id,
      balance: updatedBalance,
    };

    return result;
  });
}
