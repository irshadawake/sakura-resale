import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validate';
import * as listingController from '../controllers/listing.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Get all listings (with filtering, pagination, search)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().trim(),
    query('search').optional().trim(),
    query('min_price').optional().isFloat({ min: 0 }).toFloat(),
    query('max_price').optional().isFloat({ min: 0 }).toFloat(),
    query('condition').optional().isIn(['Like New', 'Good', 'Fair', 'Poor']),
    query('prefecture').optional().trim(),
    query('is_free').optional().isBoolean().toBoolean(),
    validate,
  ],
  optionalAuth,
  listingController.getListings
);

// Get featured listings
router.get('/featured', listingController.getFeaturedListings);

// Get single listing
router.get('/:id', optionalAuth, listingController.getListingById);

// Create listing (authenticated)
router.post(
  '/',
  authenticate,
  upload.array('images', 10),
  [
    body('title').trim().isLength({ min: 5, max: 255 }),
    body('description').trim().isLength({ min: 20 }),
    body('category_id').isUUID(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('is_free').optional().isBoolean().toBoolean(),
    body('condition').isIn(['Like New', 'Good', 'Fair', 'Poor']),
    body('location').trim().notEmpty(),
    body('city').optional().trim(),
    body('prefecture').trim().notEmpty(),
    validate,
  ],
  listingController.createListing
);

// Update listing
router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  [
    body('title').optional().trim().isLength({ min: 5, max: 255 }),
    body('description').optional().trim().isLength({ min: 20 }),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('condition').optional().isIn(['Like New', 'Good', 'Fair', 'Poor']),
    body('location').optional().trim(),
    body('prefecture').optional().trim(),
    body('status').optional().isIn(['active', 'sold', 'inactive']),
    validate,
  ],
  listingController.updateListing
);

// Delete listing
router.delete('/:id', authenticate, listingController.deleteListing);

// Favorite/unfavorite listing
router.post('/:id/favorite', authenticate, listingController.toggleFavorite);

// Get user's favorites
router.get('/user/favorites', authenticate, listingController.getUserFavorites);

export default router;
