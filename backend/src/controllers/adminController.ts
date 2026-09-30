import { Response } from 'express';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getAdminReports(req: AuthRequest, res: Response) {
  try {
    const usersCount = (await query('SELECT COUNT(*) as count FROM users'))[0]?.count || 0;
    const solvesCount = (await query('SELECT COUNT(*) as count FROM solve_history'))[0]?.count || 0;
    const challengesCount = (await query('SELECT COUNT(*) as count FROM challenges'))[0]?.count || 0;
    const tutorialsCount = (await query('SELECT COUNT(*) as count FROM tutorials'))[0]?.count || 0;

    const recentSolves = await query(
      `SELECT s.id, s.time_ms, s.scramble, s.created_at, u.name as user_name, u.email
       FROM solve_history s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC
       LIMIT 10`
    );

    const fastestSolvers = await query(
      `SELECT u.id, u.name, u.email, u.avatar, MIN(s.time_ms) as best_time_ms, COUNT(s.id) as total_solves
       FROM users u
       JOIN solve_history s ON u.id = s.user_id
       GROUP BY u.id, u.name, u.email, u.avatar
       ORDER BY best_time_ms ASC
       LIMIT 10`
    );

    return res.json({
      success: true,
      metrics: {
        totalUsers: usersCount,
        totalSolves: solvesCount,
        totalChallenges: challengesCount,
        totalTutorials: tutorialsCount
      },
      recentSolves,
      fastestSolvers
    });
  } catch (error: any) {
    console.error('[Admin Reports Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await query('SELECT id, name, email, role, daily_streak, created_at FROM users ORDER BY id DESC');
    return res.json({ success: true, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to list users.' });
  }
}

export async function createTutorial(req: AuthRequest, res: Response) {
  try {
    const { category, title, slug, description, step_order, algorithm, difficulty, content_markdown } = req.body;
    if (!category || !title || !description || !content_markdown) {
      return res.status(400).json({ success: false, message: 'Missing required tutorial fields.' });
    }

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await execute(
      `INSERT INTO tutorials (category, title, slug, description, step_order, algorithm, difficulty, content_markdown)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category, title, finalSlug, description, step_order || 1, algorithm || '', difficulty || 'easy', content_markdown]
    );

    return res.status(201).json({
      success: true,
      message: 'Tutorial created successfully',
      tutorialId: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create tutorial.' });
  }
}

export async function createChallenge(req: AuthRequest, res: Response) {
  try {
    const { title, description, type, scramble, target_time_ms, points, start_date, end_date } = req.body;
    if (!title || !description || !scramble) {
      return res.status(400).json({ success: false, message: 'Title, description, and scramble are required.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const result = await execute(
      `INSERT INTO challenges (title, description, type, scramble, target_time_ms, points, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        description,
        type || 'daily',
        scramble,
        target_time_ms || 20000,
        points || 100,
        start_date || today,
        end_date || nextWeek
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challengeId: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create challenge.' });
  }
}
