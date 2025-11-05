import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/connection';

export async function getListings(req: AuthRequest, res: Response) {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      min_price,
      max_price,
      condition,
      prefecture,
      is_free,
    } = req.query;

    let sql = `
      SELECT l.*, c.name as category_name, c.slug as category_slug,
             u.username, u.avatar_url as seller_avatar,
             (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url, 'display_order', li.display_order) ORDER BY li.display_order)
              FROM listing_images li WHERE li.listing_id = l.id) as images
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      // Support both UUID and slug for category filter
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(category as string)) {
        sql += ` AND l.category_id = $${paramIndex++}`;
        params.push(category);
      } else {
        // Check if this is a parent category and include subcategories
        sql += ` AND (c.slug = $${paramIndex} OR c.id IN (
          SELECT id FROM categories 
          WHERE parent_id = (SELECT id FROM categories WHERE slug = $${paramIndex})
        ))`;
        params.push(category);
        paramIndex++;
      }
    }

    if (search) {
      sql += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (min_price !== undefined) {
      sql += ` AND l.price >= $${paramIndex++}`;
      params.push(min_price);
    }

    if (max_price !== undefined) {
      sql += ` AND l.price <= $${paramIndex++}`;
      params.push(max_price);
    }

    if (condition) {
      sql += ` AND l.condition = $${paramIndex++}`;
      params.push(condition);
    }

    if (prefecture) {
      sql += ` AND l.prefecture = $${paramIndex++}`;
      params.push(prefecture);
    }

    if (is_free) {
      sql += ` AND l.is_free = true`;
    }

    sql += ` ORDER BY l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, (Number(page) - 1) * Number(limit));

    const result = await query(sql, params);

    res.json({
      listings: result.rows,
      page: Number(page),
      limit: Number(limit),
      total: result.rowCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFeaturedListings(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug,
              (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url))
               FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.display_order LIMIT 1) as images
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.is_featured = true AND l.status = 'active'
       ORDER BY l.created_at DESC LIMIT 10`
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getListingById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug,
              u.username, u.avatar_url as seller_avatar, u.id as seller_id,
              (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url, 'display_order', li.display_order) ORDER BY li.display_order)
               FROM listing_images li WHERE li.listing_id = l.id) as images
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views
    await query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]);

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createListing(req: AuthRequest, res: Response) {
  try {
    const { 
      title, description, category_id, price, is_free, condition, location, city, prefecture,
      is_bulk_sale, bulk_items_description, price_per_item 
    } = req.body;

    const result = await query(
      `INSERT INTO listings (user_id, category_id, title, description, price, is_free, condition, location, city, prefecture, is_bulk_sale, bulk_items_description, price_per_item)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        req.user!.id, 
        category_id, 
        title, 
        description, 
        price || null, 
        is_free || false, 
        condition, 
        location, 
        city || null, 
        prefecture,
        is_bulk_sale || false,
        bulk_items_description || null,
        price_per_item || false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateListing(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates: any = {};
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    ['title', 'description', 'price', 'condition', 'location', 'prefecture', 'status'].forEach(field => {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        params.push(req.body[field]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id, req.user!.id);

    const result = await query(
      `UPDATE listings SET ${fields.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteListing(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM listings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function toggleFavorite(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user!.id, id]
    );

    if (existing.rows.length > 0) {
      await query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [req.user!.id, id]);
      res.json({ favorited: false });
    } else {
      await query('INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)', [req.user!.id, id]);
      res.json({ favorited: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserFavorites(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT l.*, c.name as category_name,
              (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url))
               FROM listing_images li WHERE li.listing_id = l.id LIMIT 1) as images
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       JOIN categories c ON l.category_id = c.id
       WHERE f.user_id = $1 AND l.status = 'active'
       ORDER BY f.created_at DESC`,
      [req.user!.id]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
