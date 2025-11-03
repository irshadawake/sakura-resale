import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../database/connection';

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      'SELECT id, email, username, full_name, phone, location, avatar_url, is_verified, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { full_name, phone, location } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }

    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      params.push(location);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.user!.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, username, full_name, phone, location, avatar_url`,
      params
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserListings(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await query(
      `SELECT l.*, c.name as category_name,
              (SELECT json_agg(json_build_object('id', li.id, 'image_url', li.image_url))
               FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.display_order LIMIT 1) as images
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, (Number(page) - 1) * Number(limit)]
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
