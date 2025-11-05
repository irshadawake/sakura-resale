import { Request, Response } from 'express';
import { query } from '../database/connection';

export async function getCategories(req: Request, res: Response) {
  try {
    const { parent_only } = req.query;
    
    let sql;
    
    // If parent_only=true, include counts from subcategories
    if (parent_only === 'true') {
      sql = `SELECT c.*, 
              CASE 
                WHEN c.slug = 'free-giveaways' THEN 
                  (SELECT COUNT(*) FROM listings l WHERE l.is_free = true AND l.status = 'active')
                ELSE
                  (SELECT COUNT(*) 
                   FROM listings l 
                   WHERE (l.category_id = c.id 
                          OR l.category_id IN (SELECT id FROM categories WHERE parent_id = c.id))
                     AND l.status = 'active')
              END as items_count
       FROM categories c 
       WHERE c.is_active = true AND c.parent_id IS NULL
       ORDER BY c.display_order, c.name`;
    } else {
      sql = `SELECT c.*, 
              (SELECT COUNT(*) FROM listings l WHERE l.category_id = c.id AND l.status = 'active') as items_count
       FROM categories c 
       WHERE c.is_active = true
       ORDER BY c.display_order, c.name`;
    }
    
    const result = await query(sql);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSubcategories(req: Request, res: Response) {
  try {
    const { parent_slug } = req.params;
    
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM listings l WHERE l.category_id = c.id AND l.status = 'active') as items_count
       FROM categories c 
       WHERE c.parent_id = (SELECT id FROM categories WHERE slug = $1)
         AND c.is_active = true
       ORDER BY c.display_order, c.name`,
      [parent_slug]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCategoryBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCategoryListings(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const category = await query(
      'SELECT id, parent_id FROM categories WHERE slug = $1', 
      [slug]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryId = category.rows[0].id;
    const isParent = category.rows[0].parent_id === null;

    // If this is a parent category, include all subcategories
    // Otherwise, just get listings for this specific category
    const result = await query(
      `SELECT l.*, u.username, c.name as category_name,
              (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url))
               FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.display_order LIMIT 1) as images
       FROM listings l
       JOIN users u ON l.user_id = u.id
       JOIN categories c ON l.category_id = c.id
       WHERE ${isParent 
         ? '(l.category_id = $1 OR l.category_id IN (SELECT id FROM categories WHERE parent_id = $1))' 
         : 'l.category_id = $1'}
         AND l.status = 'active'
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [categoryId, limit, (Number(page) - 1) * Number(limit)]
    );

    res.json({
      listings: result.rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
