import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put(
  '/profile',
  authenticate,
  upload.single('avatar'),
  [
    body('full_name').optional().trim(),
    body('phone').optional().trim(),
    body('location').optional().trim(),
    validate,
  ],
  userController.updateProfile
);
router.get('/:id/listings', userController.getUserListings);

export default router;
