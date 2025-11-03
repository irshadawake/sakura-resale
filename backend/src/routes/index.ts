import { Express, Router } from 'express';
import authRoutes from './auth.routes';
import listingRoutes from './listing.routes';
import categoryRoutes from './category.routes';
import userRoutes from './user.routes';

const API_PREFIX = '/api/v1';

export function setupRoutes(app: Express): void {
  const router = Router();

  // Mount routes
  router.use('/auth', authRoutes);
  router.use('/listings', listingRoutes);
  router.use('/categories', categoryRoutes);
  router.use('/users', userRoutes);

  // Mount API router
  app.use(API_PREFIX, router);
}
