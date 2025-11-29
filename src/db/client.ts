import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(databaseUrl, {
  max: 10,
});

export default sql;
