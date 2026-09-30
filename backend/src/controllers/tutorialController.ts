import { Request, Response } from 'express';
import { query, execute } from '../config/db';

export async function getTutorials(req: Request, res: Response) {
  try {
    const category = req.query.category as string;
    let tutorials;

    if (category) {
      tutorials = await query('SELECT * FROM tutorials WHERE category = ? ORDER BY step_order ASC', [category]);
    } else {
      tutorials = await query('SELECT * FROM tutorials ORDER BY category ASC, step_order ASC');
    }

    return res.json({
      success: true,
      tutorials
    });
  } catch (error: any) {
    console.error('[Get Tutorials Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tutorials.' });
  }
}

export async function getTutorialBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const tutorials = await query('SELECT * FROM tutorials WHERE slug = ? OR id = ?', [slug, slug]);

    if (tutorials.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutorial not found.' });
    }

    return res.json({
      success: true,
      tutorial: tutorials[0]
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tutorial.' });
  }
}
