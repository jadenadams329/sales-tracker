import dotenv from 'dotenv';
import path from 'path';
import { beforeAll, afterAll, beforeEach } from 'vitest';


// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Now import models after setting environment variables
import { sequelize } from '../db/models';

beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();

  // Create all tables defined in your models
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});
