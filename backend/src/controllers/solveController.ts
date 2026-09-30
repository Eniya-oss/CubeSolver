import { Response } from 'express';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function saveSolve(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { scramble, time_ms, moves_count, solution_moves, cube_type, is_dnf, is_plus2, notes } = req.body;

    if (!scramble || time_ms === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Scramble and time_ms are required.'
      });
    }

    const result = await execute(
      `INSERT INTO solve_history (user_id, scramble, time_ms, moves_count, solution_moves, cube_type, is_dnf, is_plus2, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        scramble,
        time_ms,
        moves_count || 0,
        solution_moves || '',
        cube_type || '3x3',
        is_dnf ? 1 : 0,
        is_plus2 ? 1 : 0,
        notes || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Solve recorded successfully!',
      solveId: result.insertId
    });
  } catch (error: any) {
    console.error('[Save Solve Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to record solve.' });
  }
}

export async function getSolveHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 50);
    const solves = await query(
      'SELECT * FROM solve_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return res.json({
      success: true,
      total: solves.length,
      solves
    });
  } catch (error: any) {
    console.error('[Get History Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
}

export async function deleteSolve(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const solveId = req.params.id;

    await execute('DELETE FROM solve_history WHERE id = ? AND user_id = ?', [solveId, userId]);

    return res.json({
      success: true,
      message: 'Solve deleted successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete solve.' });
  }
}
