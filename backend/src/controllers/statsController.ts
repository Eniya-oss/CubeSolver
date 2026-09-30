import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * Calculates WCA-standard trimmed average of N (e.g. Ao5 drops best and worst, averages 3)
 */
function calculateAoN(times: number[], n: number): number | null {
  if (times.length < n) return null;
  const slice = times.slice(0, n);
  const sorted = [...slice].sort((a, b) => a - b);
  // drop min and max
  const trimmed = sorted.slice(1, sorted.length - 1);
  const sum = trimmed.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / trimmed.length);
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const solves = await query(
      'SELECT id, time_ms, moves_count, created_at FROM solve_history WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const userRows = await query('SELECT daily_streak FROM users WHERE id = ?', [userId]);
    const dailyStreak = userRows.length > 0 ? userRows[0].daily_streak : 1;

    const totalSolves = solves.length;

    if (totalSolves === 0) {
      return res.json({
        success: true,
        stats: {
          totalSolves: 0,
          bestTimeMs: null,
          averageTimeMs: null,
          ao5: null,
          ao12: null,
          dailyStreak,
          lastSolve: null,
          recentSolves: [],
          distribution: {
            sub15: 0,
            sub20: 0,
            sub30: 0,
            sub45: 0,
            above45: 0
          }
        }
      });
    }

    const times = solves.map((s: any) => s.time_ms);
    const bestTimeMs = Math.min(...times);
    const sum = times.reduce((acc: number, curr: number) => acc + curr, 0);
    const averageTimeMs = Math.round(sum / totalSolves);

    const ao5 = calculateAoN(times, 5);
    const ao12 = calculateAoN(times, 12);

    // Distribution
    const distribution = {
      sub15: times.filter(t => t < 15000).length,
      sub20: times.filter(t => t >= 15000 && t < 20000).length,
      sub30: times.filter(t => t >= 20000 && t < 30000).length,
      sub45: times.filter(t => t >= 30000 && t < 45000).length,
      above45: times.filter(t => t >= 45000).length
    };

    // Last 15 solves for line graph
    const recentSolves = solves.slice(0, 15).reverse().map((s: any, idx: number) => ({
      index: idx + 1,
      id: s.id,
      timeMs: s.time_ms,
      timeSec: Number((s.time_ms / 1000).toFixed(2)),
      movesCount: s.moves_count,
      date: s.created_at
    }));

    return res.json({
      success: true,
      stats: {
        totalSolves,
        bestTimeMs,
        averageTimeMs,
        ao5,
        ao12,
        dailyStreak,
        lastSolve: solves[0],
        recentSolves,
        distribution
      }
    });
  } catch (error: any) {
    console.error('[Get Stats Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate statistics.' });
  }
}
