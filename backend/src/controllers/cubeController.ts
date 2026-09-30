import { Request, Response } from 'express';
import { solveCube, validateCubeState, generateScramble } from '../services/cubeSolver';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function solve(req: Request, res: Response) {
  try {
    const { scramble, cubeState, method } = req.body;

    if (!scramble && !cubeState) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a scramble string (e.g. "R U R\' U\'") or a 54-facelet cubeState.'
      });
    }

    const input = scramble || cubeState;
    const solution = solveCube(input, { method });

    if (!solution.isValid) {
      return res.status(422).json({
        success: false,
        message: solution.error || 'The cube state is invalid and cannot be solved.',
        details: solution
      });
    }

    return res.json({
      success: true,
      message: 'Solution generated successfully',
      data: solution
    });
  } catch (error: any) {
    console.error('[Solve Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to solve cube state.'
    });
  }
}

export async function validate(req: Request, res: Response) {
  try {
    const { cubeState } = req.body;

    if (!cubeState) {
      return res.status(400).json({
        success: false,
        message: 'cubeState is required for validation.'
      });
    }

    const result = validateCubeState(cubeState);

    return res.json({
      success: true,
      isValid: result.isValid,
      errors: result.errors,
      colorCounts: result.colorCounts
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Validation process encountered an error.'
    });
  }
}

export async function getRandomScramble(req: Request, res: Response) {
  try {
    const length = req.query.length ? parseInt(req.query.length as string, 10) : 20;
    const scramble = generateScramble(length);

    return res.json({
      success: true,
      scramble,
      movesCount: length
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate scramble'
    });
  }
}

export async function saveCubeState(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, cubeState, scramble, isSolved } = req.body;
    if (!title || !cubeState) {
      return res.status(400).json({ success: false, message: 'Title and cubeState are required.' });
    }

    const stateJson = typeof cubeState === 'string' ? cubeState : JSON.stringify(cubeState);

    const result = await execute(
      'INSERT INTO saved_cubes (user_id, title, cube_state, scramble, is_solved) VALUES (?, ?, ?, ?, ?)',
      [userId, title.trim(), stateJson, scramble || '', isSolved ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Cube state saved successfully',
      id: result.insertId
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to save cube state.' });
  }
}

export async function getSavedCubes(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const saved = await query('SELECT * FROM saved_cubes WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    return res.json({
      success: true,
      cubes: saved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve saved cubes.' });
  }
}
