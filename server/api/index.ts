import mongoose from 'mongoose';
import app from '../src/app';
import connectDB from '../src/config/db';

// Cache the connection across serverless invocations
if (mongoose.connection.readyState === 0) {
  connectDB();
}

export default app;
