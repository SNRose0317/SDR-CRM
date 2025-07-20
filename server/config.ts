import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

// Export configuration
export const config = {
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
};