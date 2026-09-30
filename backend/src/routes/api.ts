import { Router } from 'express';
import { register, login, forgotPassword, getProfile } from '../controllers/authController';
import { solve, validate, getRandomScramble, saveCubeState, getSavedCubes } from '../controllers/cubeController';
import { saveSolve, getSolveHistory, deleteSolve } from '../controllers/solveController';
import { getStats } from '../controllers/statsController';
import { getChallenges, submitChallenge, getChallengeLeaderboard } from '../controllers/challengeController';
import { getTutorials, getTutorialBySlug } from '../controllers/tutorialController';
import { getAdminReports, getAllUsers, createTutorial, createChallenge } from '../controllers/adminController';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// ================= AUTH ROUTES =================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);

// ================= USER PROFILE =================
router.get('/user/profile', authenticateToken, getProfile);

// ================= CUBE ENGINE ROUTES =================
router.post('/cube/solve', solve);
router.post('/cube/validate', validate);
router.get('/cube/scramble', getRandomScramble);
router.post('/cube/save', authenticateToken, saveCubeState);
router.get('/cube/saved', authenticateToken, getSavedCubes);

// ================= SOLVE HISTORY & TIMER =================
router.post('/solve/save', authenticateToken, saveSolve);
router.get('/solve/history', authenticateToken, getSolveHistory);
router.delete('/solve/:id', authenticateToken, deleteSolve);

// ================= STATISTICS =================
router.get('/stats', authenticateToken, getStats);

// ================= CHALLENGES & LEADERBOARD =================
router.get('/challenges', authenticateToken, getChallenges);
router.post('/challenges/:id/submit', authenticateToken, submitChallenge);
router.get('/challenges/:id/leaderboard', authenticateToken, getChallengeLeaderboard);

// ================= TUTORIALS / LEARNING MODULE =================
router.get('/tutorials', getTutorials);
router.get('/tutorials/:slug', getTutorialBySlug);

// ================= NOTIFICATIONS =================
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markAsRead);

// ================= ADMIN PANEL ROUTES =================
router.get('/admin/reports', authenticateToken, requireAdmin, getAdminReports);
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.post('/admin/tutorials', authenticateToken, requireAdmin, createTutorial);
router.post('/admin/challenges', authenticateToken, requireAdmin, createChallenge);

export default router;
