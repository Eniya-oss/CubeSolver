import { Response } from 'express';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getChallenges(req: AuthRequest, res: Response) {
  try {
    const challenges = await query('SELECT * FROM challenges WHERE is_active = 1 ORDER BY created_at DESC');

    // Attach leaderboard top 3 for each
    const enriched = await Promise.all(
      challenges.map(async (c: any) => {
        const leaderboards = await query(
          `SELECT uc.id, uc.time_ms, uc.moves_count, uc.points_earned, uc.completed_at, u.name, u.avatar
           FROM user_challenges uc
           JOIN users u ON uc.user_id = u.id
           WHERE uc.challenge_id = ?
           ORDER BY uc.time_ms ASC
           LIMIT 5`,
          [c.id]
        );

        let userSolved = false;
        if (req.user?.id) {
          const check = await query(
            'SELECT id, time_ms FROM user_challenges WHERE challenge_id = ? AND user_id = ?',
            [c.id, req.user.id]
          );
          userSolved = check.length > 0;
        }

        return {
          ...c,
          leaderboard: leaderboards,
          userSolved
        };
      })
    );

    return res.json({
      success: true,
      challenges: enriched
    });
  } catch (error: any) {
    console.error('[Get Challenges Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch challenges.' });
  }
}

export async function submitChallenge(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const challengeId = req.params.id;
    const { time_ms, moves_count } = req.body;

    if (!time_ms) {
      return res.status(400).json({ success: false, message: 'time_ms is required.' });
    }

    const challenges = await query('SELECT * FROM challenges WHERE id = ?', [challengeId]);
    if (challenges.length === 0) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const challenge = challenges[0];
    const points = challenge.points || 100;

    await execute(
      `INSERT INTO user_challenges (challenge_id, user_id, time_ms, moves_count, points_earned)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE time_ms = LEAST(time_ms, VALUES(time_ms)), moves_count = VALUES(moves_count)`,
      [challengeId, userId, time_ms, moves_count || 0, points]
    );

    return res.json({
      success: true,
      message: 'Challenge submitted successfully!',
      pointsEarned: points
    });
  } catch (error: any) {
    console.error('[Submit Challenge Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to submit challenge.' });
  }
}

export async function getChallengeLeaderboard(req: AuthRequest, res: Response) {
  try {
    const challengeId = req.params.id;

    const rankings = await query(
      `SELECT uc.id, uc.time_ms, uc.moves_count, uc.points_earned, uc.completed_at, u.name, u.avatar
       FROM user_challenges uc
       JOIN users u ON uc.user_id = u.id
       WHERE uc.challenge_id = ?
       ORDER BY uc.time_ms ASC
       LIMIT 50`,
      [challengeId]
    );

    return res.json({
      success: true,
      rankings
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.' });
  }
}
