
CREATE DATABASE IF NOT EXISTS cube_solver_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cube_solver_db;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    preferred_theme VARCHAR(20) DEFAULT 'dark',
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    daily_streak INT DEFAULT 0,
    last_active_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. SOLVE HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solve_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scramble VARCHAR(500) NOT NULL,
    time_ms INT NOT NULL COMMENT 'Solve time in milliseconds',
    moves_count INT DEFAULT 0,
    solution_moves TEXT NULL,
    cube_type VARCHAR(20) DEFAULT '3x3',
    is_dnf TINYINT(1) DEFAULT 0 COMMENT 'Did Not Finish',
    is_plus2 TINYINT(1) DEFAULT 0 COMMENT '+2 second penalty applied',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_solve_user_id (user_id),
    INDEX idx_solve_time (time_ms),
    INDEX idx_solve_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. SAVED CUBE STATES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_cubes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    cube_state JSON NOT NULL COMMENT 'JSON array or string of 54 facelet colors',
    scramble VARCHAR(500) NULL,
    is_solved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_saved_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TUTORIALS / LEARNING MODULE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutorials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('beginner', 'cfop', 'f2l', 'oll', 'pll', 'speed_tricks') NOT NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    step_order INT DEFAULT 1,
    algorithm VARCHAR(255) NULL,
    illustration_url VARCHAR(255) NULL,
    video_url VARCHAR(255) NULL,
    content_markdown LONGTEXT NOT NULL,
    difficulty ENUM('easy', 'intermediate', 'advanced') DEFAULT 'easy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tutorial_category (category),
    INDEX idx_tutorial_order (step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. CHALLENGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('daily', 'weekly', 'special') NOT NULL,
    scramble VARCHAR(500) NOT NULL,
    target_time_ms INT NULL COMMENT 'Target benchmark time in ms',
    points INT DEFAULT 100,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_challenge_active (is_active),
    INDEX idx_challenge_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. USER CHALLENGE PARTICIPATION & LEADERBOARD
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    time_ms INT NOT NULL,
    moves_count INT DEFAULT 0,
    solution_moves TEXT NULL,
    points_earned INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_challenge (challenge_id, user_id),
    INDEX idx_user_challenge_time (time_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('reminder', 'challenge', 'achievement', 'system') DEFAULT 'system',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. SYSTEM STATS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA
-- Default Admin & Demo User, Tutorials, and Challenges
-- ============================================================================

-- Password for demo users is 'Password123!' (bcrypt hash below)
-- $2a$10$wTqKxM8G75kFpYd8d38j7eZkX16B3O0m7uXvO14Z3Pqv8Ocm4a3mG
INSERT INTO users (id, name, email, password_hash, role, daily_streak, last_active_date) VALUES
(1, 'Admin Speedcuber', 'admin@cubesolver.com', '$2a$10$3Q7uKuvSjGhAMvkLU1W7zusiB2rMmgZIpR2Bt.37JYBYGfpy5IE4y', 'admin', 15, CURDATE()),
(2, 'Alex Turner', 'alex@cubesolver.com', '$2a$10$3Q7uKuvSjGhAMvkLU1W7zusiB2rMmgZIpR2Bt.37JYBYGfpy5IE4y', 'user', 7, CURDATE())
ON DUPLICATE KEY UPDATE id=id;

-- Sample Solve History for user 2 (Alex)
INSERT INTO solve_history (user_id, scramble, time_ms, moves_count, solution_moves, cube_type, created_at) VALUES
(2, "R' U' F R2 U' B2 D' F2 U B2 R2 D2 F' L' D2 B' R B2 U' F'", 18450, 48, "D R' F R D2 U R U' R' U2 R U R' U F R U R' U' F' U2 R U2 R' U' R U' R'", '3x3', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, "D2 F2 R2 B2 U2 L2 D F2 D' B2 U F R B' D' R2 B F2 U' L", 16210, 44, "F R U R' U' F' U R U R' U R U2 R' U2 R U R' U' R' F R2 U' R' U' R U R' F'", '3x3', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, "U B2 D2 F2 L2 B2 U' L2 D B2 R2 B' L D2 R2 B2 D F' R' U2", 14820, 42, "R U R' U' R' F R2 U' R' U' R U R' F' U R U2 R' U' R U' R'", '3x3', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, "F2 R2 U2 B2 D' F2 D' B2 L2 U2 F' D2 L B' F2 U' R F' D' R", 15940, 45, "F R U' R' U' R U R' F' R U R' U R U2 R'", '3x3', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, "B2 U2 R2 D2 F2 L2 F2 U' B2 D' R2 F R2 B' L U B2 R' D' F2", 13250, 39, "R U R' U' R' F R F' U2 R U2 R' U' R U R' U' R U' R'", '3x3', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, "L2 D2 B2 R2 D' F2 D B2 R2 U' L2 B' D' R' F D2 L2 U B' L2", 12480, 38, "U R U' R' U' F' U F R U R' U' R' F R F'", '3x3', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Sample Tutorials
INSERT INTO tutorials (category, title, slug, description, step_order, algorithm, difficulty, content_markdown) VALUES
('beginner', '1. Cube Anatomy & Standard Notation', 'cube-basics-notation', 'Learn the faces, centers, edges, corners, and international WCA notation (R, L, U, D, F, B).', 1, 'R U R'' U''', 'easy',
'# The Anatomy of the 3x3 Rubik''s Cube\n\nThe Rubik''s Cube consists of **6 faces**, each with a distinct color:\n- **White** is opposite **Yellow**\n- **Green** is opposite **Blue**\n- **Red** is opposite **Orange**\n\n### Piece Types:\n1. **Centers (6)**: Fixed in position and determine the color of each face.\n2. **Edges (12)**: Have 2 colors each.\n3. **Corners (8)**: Have 3 colors each.\n\n### International Notation:\n- **R** = Right face clockwise 90°\n- **R''** = Right face counter-clockwise 90°\n- **R2** = Right face 180°\n- Same logic applies to **L** (Left), **U** (Up), **D** (Down), **F** (Front), and **B** (Back).'),

('beginner', '2. The White Daisy & White Cross', 'white-cross', 'First foundational step: place 4 white edges around the yellow center, then align them to form the white cross.', 2, 'F2 U R2', 'easy',
'# Step 1: Solving the White Cross\n\n1. Find the 4 white edge pieces.\n2. Move them to surround the yellow center, creating a "Daisy".\n3. Look at the second color of each white edge piece.\n4. Rotate the top layer until the non-white sticker matches its center color.\n5. Turn that face 180° (F2, R2, etc.) to bring it down to the white center!'),

('beginner', '3. First Layer Corners', 'first-layer-corners', 'Insert all 4 white corner pieces into their correct spots to complete the entire first layer.', 3, 'R U R'' U''', 'easy',
'# Step 2: First Layer Corners\n\nUse the universal 4-move "Sexy Move":\n`R U R'' U''`\n\nPosition a corner with White directly above where it belongs, then repeat `R U R'' U''` until the white sticker points downwards and colors match!'),

('beginner', '4. Second Layer (F2L Beginner)', 'second-layer-edges', 'Insert the 4 middle layer edge pieces into place without disturbing the solved white layer.', 4, 'U R U'' R'' U'' F'' U F', 'intermediate',
'# Step 3: Solving the Middle Layer\n\nIdentify an edge on the top layer without yellow. Align it with its matching center.\n- To move edge to the Right: `U R U'' R'' U'' F'' U F`\n- To move edge to the Left: `U'' L'' U L U F U'' F''`'),

('cfop', 'CFOP: Cross Mastery', 'cfop-cross', 'Advanced cross techniques: solve cross on bottom directly in 8 moves or fewer.', 1, 'D R'' F R D2', 'intermediate',
'# Advanced Cross Solving\n\nSpeedcubers solve the cross directly on the bottom face (White on bottom).\n- Inspect the cube during the 15-second inspection.\n- Plan the complete cross solution before executing the first move.\n- Average optimal cross is 6-7 moves!'),

('f2l', 'Basic F2L: Corner & Edge Pairing', 'f2l-basics', 'First Two Layers (F2L) pairs corner and edge pieces in the top layer and inserts them together.', 1, 'U (R U'' R'') U'' (F'' U F)', 'intermediate',
'# First Two Layers (F2L)\n\nInstead of solving corners and then edges separately, F2L pairs them up in the top layer and slots them into their correct position in a single sequence.'),

('oll', 'OLL 21: Cross Case (H shape)', 'oll-21-h', 'Orient all last layer yellow stickers to face up.', 1, 'R U2 R'' U'' R U R'' U'' R U'' R''', 'advanced',
'# OLL 21 (H Case)\n\nAll 4 yellow corners are pointing outwards. Execute:\n`R U2 R'' U'' R U R'' U'' R U'' R''`'),

('pll', 'PLL: T-Permutation', 'pll-t-perm', 'Swap adjacent corners and adjacent edges to finish the cube.', 1, 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 'advanced',
'# The Classic T-Perm\n\nSwaps two corners on the right and two opposite edges.\n`R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''`')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Challenges
INSERT INTO challenges (id, title, description, type, scramble, target_time_ms, points, start_date, end_date, is_active) VALUES
(1, 'Daily Speed Sprint', 'Solve this standardized scramble as quickly as possible. Best time wins 150 XP!', 'daily', "R U' R2 U' B2 D' F2 U B2 R2 D2 F' L' D2 B' R B2 U' F' L2", 20000, 150, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1),
(2, 'Weekly Sub-15 Mastery', 'Test your CFOP skills on this high-flow scramble. Target: Under 15.00 seconds!', 'weekly', "F2 R2 U2 B2 D' F2 D' B2 L2 U2 F' D2 L B' F2 U' R F' D' R2 B", 15000, 500, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 1)
ON DUPLICATE KEY UPDATE id=id;

-- User challenge entry for leaderboard
INSERT INTO user_challenges (challenge_id, user_id, time_ms, moves_count, solution_moves, points_earned) VALUES
(1, 2, 13850, 41, "D R' F R D2 U R U' R' U2 R U R' U F R U R' U' F' U2 R U2 R' U' R U' R'", 150)
ON DUPLICATE KEY UPDATE id=id;

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Daily Streak Active! 🔥', 'You are on a 7-day streak! Complete a solve today to keep your streak going.', 'reminder', 0),
(2, 'New Daily Challenge Available', 'Today''s sprint is live: can you beat the 20.00 second target?', 'challenge', 0),
(2, 'Achievement Unlocked 🏆', 'Sub-15 Silver: You achieved a solve time under 15 seconds!', 'achievement', 1);
