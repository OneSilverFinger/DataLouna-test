import type postgres from 'postgres';

export type DbSql = postgres.Sql<{}>;

export interface UserRow {
  id: number;
  balance: string;
}

export interface ProductRow {
  id: number;
  name: string;
  price: string;
}

export interface PurchaseRow {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
}

export async function getUserById(db: DbSql, userId: number): Promise<UserRow | null> {
  const rows = await db<UserRow[]>`
    SELECT id, balance
    FROM users
    WHERE id = ${userId}
  `;

  return rows[0] ?? null;
}

export async function getProductById(db: DbSql, productId: number): Promise<ProductRow | null> {
  const rows = await db<ProductRow[]>`
    SELECT id, name, price
    FROM products
    WHERE id = ${productId}
  `;

  return rows[0] ?? null;
}

export async function updateUserBalance(
  db: DbSql,
  userId: number,
  amountToSubtract: number
): Promise<UserRow | null> {
  const rows = await db<UserRow[]>`
    UPDATE users
    SET balance = balance - ${amountToSubtract}
    WHERE id = ${userId} AND balance >= ${amountToSubtract}
    RETURNING id, balance
  `;

  return rows[0] ?? null;
}

export async function insertPurchase(
  db: DbSql,
  userId: number,
  productId: number
): Promise<PurchaseRow> {
  const rows = await db<PurchaseRow[]>`
    INSERT INTO purchases (user_id, product_id)
    VALUES (${userId}, ${productId})
    RETURNING id, user_id, product_id, created_at
  `;

  if (!rows[0]) {
    throw new Error('Failed to create purchase record');
  }

  return rows[0];
}
