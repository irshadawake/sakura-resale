import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:parent_slug/subcategories', categoryController.getSubcategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:slug/listings', categoryController.getCategoryListings);

export default router;
