import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === 'production',
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'rice_mill.db'),
  corsOrigins: process.env.CORS_ORIGIN || '*'
};
