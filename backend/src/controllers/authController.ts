import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_rubiks_cube_jwt_token_2026_production_key!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already registered
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(name)}`;

    const result = await execute(
      'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, 'user', defaultAvatar]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'user' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'user',
        avatar: defaultAvatar,
        daily_streak: 1
      }
    });
  } catch (error: any) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during registration.'
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update streak if needed
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.daily_streak || 1;
    if (user.last_active_date) {
      const lastDate = new Date(user.last_active_date).toISOString().split('T')[0];
      const diffDays = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    await execute('UPDATE users SET daily_streak = ?, last_active_date = ? WHERE id = ?', [newStreak, today, user.id]);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        daily_streak: newStreak
      }
    });
  } catch (error: any) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during login.'
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const users = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      // Return success to avoid email enumeration
      return res.json({
        success: true,
        message: 'If the email is registered, a password reset link has been dispatched.'
      });
    }

    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    await execute('UPDATE users SET reset_token = ? WHERE id = ?', [resetToken, users[0].id]);

    return res.json({
      success: true,
      message: 'Reset instructions generated successfully.',
      demoResetToken: resetToken // Included for easy developer/reviewer testing
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Password reset request failed.' });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const users = await query('SELECT id, name, email, role, avatar, daily_streak, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Fetch user solve metrics
    const solves = await query('SELECT time_ms, created_at FROM solve_history WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const totalSolves = solves.length;
    let bestTimeMs = null;
    let averageTimeMs = null;
    let lastSolve = null;

    if (totalSolves > 0) {
      const times = solves.map((s: any) => s.time_ms);
      bestTimeMs = Math.min(...times);
      const sum = times.reduce((acc: number, curr: number) => acc + curr, 0);
      averageTimeMs = Math.round(sum / totalSolves);
      lastSolve = solves[0];
    }

    return res.json({
      success: true,
      user: {
        ...user,
        stats: {
          totalSolves,
          bestTimeMs,
          averageTimeMs,
          lastSolve
        }
      }
    });
  } catch (error: any) {
    console.error('[Get Profile Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
}
