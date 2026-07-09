import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';

/**
 * Boots the connection loop to MongoDB Atlas via Mongoose.
 */
export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
    logger.info('DATABASE: Connected to MongoDB Atlas successfully.');
  } catch (error) {
    logger.error('DATABASE: Failed to connect to MongoDB Atlas:', error);
    process.exit(1);
  }
}
export default connectDatabase;
