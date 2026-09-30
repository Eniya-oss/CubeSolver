# 🧊 Cube Solver - Mobile Application & Intelligent Engine

> A modern, production-ready Rubik's Cube mobile application built with **React Native + Expo + TypeScript**, powered by **Three.js / WebGL** for 3D cube interactions and a high-performance **Node.js + Express + MySQL** backend with **JWT + bcrypt** authentication.

Inspired by [onlinecube.com](https://onlinecube.com/), Cube Solver combines realistic 3D touch gesture mechanics, an intelligent multi-step solving engine, CFOP learning academy, WCA speedcubing timer, competitive challenges, and real-time statistics.

---

## 📱 Tech Stack & Architecture

### **Mobile Frontend**
- **Framework:** React Native + Expo (SDK 52/53) + TypeScript
- **3D Graphics & WebGL:** Three.js via Hardware-Accelerated Canvas & Raycaster Touch Controls
- **State Management:** Context API (`AuthContext`, `CubeContext`)
- **Theme & UI:** Cyber Dark Glassmorphism with neon accents & smooth 60fps animations
- **Icons & Assets:** Expo Vector Icons (`Ionicons`, `MaterialCommunityIcons`)

### **Backend REST API**
- **Runtime:** Node.js (v20+) + Express + TypeScript
- **Database:** MySQL (with MySQL2 Connection Pool & automatic schema migrations)
- **Authentication:** JSON Web Tokens (JWT) + bcrypt password hashing (10 salt rounds)
- **Execution Engine:** Custom Rubik's Cube Solver with WCA Scramble Generator and State Parity Validator

---

## ✨ Features Overview

### 1. User Authentication & Profile
- **Registration:** Name, Email, Password (hashed via bcrypt), auto-assigned avatar.
- **Login:** Email & Password with secure JWT token issuance (7-day validity).
- **Forgot Password:** Password reset flow with verification token handling.
- **User Profile:** Real-time metrics (Personal Best, Session Average, Daily Streak, Total Solves).
- **1-Click Demo Accounts:** Instantly test as speedcuber **Alex Turner** or **Admin Speedcuber**.

### 2. Interactive 3D Rubik's Cube (OnlineCube.com Style)
- **Full 3D WebGL Canvas:** 26 individual cubies with beveled edges, plastic core, and international WCA colors:
  - ⬜ **White** (Up / U)
  - 🟨 **Yellow** (Down / D)
  - 🟥 **Red** (Right / R)
  - 🟧 **Orange** (Left / L)
  - 🟦 **Blue** (Front / F)
  - 🟩 **Green** (Back / B)
- **Touch Gesture Interaction:**
  - **Swipe on Facelets:** Raycaster detects face normal vector and swipe direction to rotate rows, columns, or individual faces ($90^\circ$ turns).
  - **Drag Background:** Freely orbit and inspect the cube in 3D space.
  - **Smooth Animations:** Pivot Object3D quadratic easing (~200ms per turn).
- **Full WCA Notation Support:** $U, U', U2, D, D', D2, L, L', L2, R, R', R2, F, F', F2, B, B', B2, M, E, S$.
- **Cube Functions:**
  - 🔀 **Scramble:** Generates random 20-move WCA scrambles and animates turns.
  - 🔄 **Reset:** Snaps cube back to a clean solved state.
  - ↩️ **Undo / ↪️ Redo:** Full move history tracking with inverted step replay.
  - 🎨 **Manual Color Editing Mode:** 6-color palette to tap and paint stickers directly on the 3D cube.
  - 💾 **Save Cube State:** Store custom scrambles directly in MySQL.

### 3. Intelligent Cube Solver Engine
- **State Validation:** Checks 54 facelets, validates exactly 9 stickers per color, and ensures 6 unique centers. Detects invalid cube parity and provides clear diagnostic error messages.
- **Solution Generator:** Computes optimal move sequences (e.g. `R U R' U' F2 ...`).
- **Interactive Playback HUD:**
  - ◀ **Previous Move** & ▶ **Next Move** manual navigation.
  - ⏯ **Auto-Play** animation with adjustable playback speed ($0.5\times$, $1\times$, $2\times$).
  - ⏸ **Pause Solution** at any step.
  - **Move Sequence Timeline:** Badges highlighting previous, current, and upcoming moves.
  - **Step-by-Step Educational Breakdown:**
    - Step 1: White Cross
    - Step 2: First Layer Corners
    - Step 3: Second Layer (Middle Edges)
    - Step 4: Top Yellow Cross & OLL
    - Step 5: Permute Last Layer (PLL)

### 4. Learning Module (Academy)
- **Beginner Track:**
  - 3x3 Cube Anatomy & Standard WCA Notation.
  - White Daisy & White Cross method.
  - First Layer Corners ("Sexy Move" $R\ U\ R'\ U'$).
  - Second Layer middle edge insertion.
- **Advanced CFOP Track:**
  - **Cross:** Direct bottom cross in 8 moves or fewer.
  - **F2L (First Two Layers):** 41 corner-edge pairing algorithms.
  - **OLL (Orientation of Last Layer):** Top face orientation triggers.
  - **PLL (Permutation of Last Layer):** T-Perm, Y-Perm, U-Perm algorithms.
- **Interactive Practice:** Tap **"Practice on 3D"** on any algorithm to instantly load and execute it on the 3D cube!

### 5. Pro Speedcubing Timer
- **WCA Scrambler:** Official 20-move random state scrambles.
- **Hold-to-Start Gesture:** Touch pad turns amber $\to$ emerald green when primed $\to$ release to launch stopwatch.
- **Stopwatch:** Millisecond accuracy timer with tap-anywhere stop.
- **Session Metrics:** Real-time Single Best, Average of 5 (Ao5), Average of 12 (Ao12), and session solve count.
- **Auto-Save:** Saves result directly to the `solve_history` database table.

### 6. Analytics & Statistics
- **Key Averages:** Personal Best, Overall Average, Current Ao5, Current Ao12.
- **Progress Line/Bar Chart:** Visual trend of the last 15 solves.
- **Time Distribution Histogram:** Solves bracketed into `<15s`, `15-20s`, `20-30s`, `30-45s`, and `45s+`.
- **Streak Tracker:** Consecutive days practice tracking.

### 7. Challenges & Global Leaderboard
- **Daily Speed Sprint:** Standardized scramble with benchmark target time and XP points.
- **Weekly Sub-15 Mastery:** High-flow scramble for advanced speedcubers.
- **Leaderboard:** Live rankings with user avatars, solve times, and moves count.
- **Share:** Native mobile sharing sheet for flexing personal records.

### 8. Admin Control Center
- **System Reports:** Total registered users, total solves, active challenges, and recent solve logs.
- **User Management:** View registered cubers, daily streaks, and roles.
- **Tutorial Creator:** Add new lessons with category, title, algorithm, and markdown instructions.
- **Challenge Creator:** Launch daily/weekly sprints with custom scrambles, target times, and points.

### 9. Notifications & Daily Reminders
- Daily streak notifications 🔥
- Challenge invitations 🏆
- Milestone & achievement unlock notifications ⭐

---

## 📁 Project Structure

```
SE/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # MySQL connection pool + resilient in-memory fallback
│   │   ├── controllers/
│   │   │   ├── adminController.ts      # Reports, user management, tutorial/challenge creation
│   │   │   ├── authController.ts       # Register, login, forgot-password, user profile
│   │   │   ├── challengeController.ts  # Daily/weekly challenges & leaderboards
│   │   │   ├── cubeController.ts       # Cube solving, validation, scrambles, state saves
│   │   │   ├── notificationController.ts# User alerts & reminders
│   │   │   ├── solveController.ts      # Solve history CRUD & session storage
│   │   │   ├── statsController.ts      # Ao5, Ao12, distribution & progression graphs
│   │   │   └── tutorialController.ts   # Beginner & CFOP curriculum
│   │   ├── middleware/
│   │   │   └── auth.ts                 # JWT verification & Admin authorization guard
│   │   ├── routes/
│   │   │   └── api.ts                  # Central Express API router
│   │   ├── services/
│   │   │   └── cubeSolver.ts           # Validation engine, WCA scrambler, multi-phase solver
│   │   └── server.ts                   # Express server bootstrap & health check
│   ├── .env                            # Backend configuration (DB & JWT secrets)
│   ├── package.json                    # Dependencies (express, mysql2, bcryptjs, jsonwebtoken)
│   └── tsconfig.json
├── database/
│   └── schema.sql                      # Production MySQL schema, indexes, and seed records
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts               # Central REST API client with JWT storage
│   │   ├── components/
│   │   │   ├── CubeControls.tsx        # Action bar (Scramble, Reset, Undo, Redo, Paint, Solve)
│   │   │   ├── ColorPickerModal.tsx    # Manual color editing palette (6 standard colors)
│   │   │   ├── GlassCard.tsx           # Reusable glassmorphic container
│   │   │   ├── Navbar.tsx              # Modern floating navigation tab bar
│   │   │   ├── SolverModal.tsx         # Step-by-step solver HUD (auto-play, next/prev, timeline)
│   │   │   └── ThreeCubeView.tsx       # 3D Three.js WebGL Rubik's Cube with raycast gestures
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # User session, JWT tokens, demo account switcher
│   │   │   └── CubeContext.tsx         # 3D Cube state, move dispatcher, solver playback
│   │   ├── screens/
│   │   │   ├── AdminPanelScreen.tsx    # Moderation, curriculum builder, metrics
│   │   │   ├── ChallengesScreen.tsx    # Daily/weekly sprints & rankings
│   │   │   ├── CubeSolveScreen.tsx     # Main 3D interactive playground
│   │   │   ├── DashboardScreen.tsx     # Home screen with metrics & streak
│   │   │   ├── ForgotPasswordScreen.tsx# Password recovery
│   │   │   ├── LearnScreen.tsx         # Beginner & CFOP tutorials + 3D practice
│   │   │   ├── LoginScreen.tsx         # Sign in with 1-click demo accounts
│   │   │   ├── NotificationsScreen.tsx # Practice reminders & achievements
│   │   │   ├── ProfileScreen.tsx       # Cuber stats, settings, demo toggle, logout
│   │   │   ├── RegisterScreen.tsx      # Account creation
│   │   │   ├── SplashScreen.tsx        # Animated intro & branding
│   │   │   ├── StatisticsScreen.tsx    # Charts, histograms, and Ao5/12
│   │   │   └── TimerScreen.tsx         # Speedcubing stopwatch
│   │   ├── theme/
│   │   │   └── colors.ts               # Cyber dark palette & neon highlights
│   │   └── utils/
│   │       └── cubeNotation.ts         # Move notations, time formatting, scrambler
│   ├── App.tsx                         # Root app component with context providers & routing
│   ├── app.json                        # Expo app configuration
│   └── package.json
└── README.md
```

---

## 🗄️ Database Schema (`database/schema.sql`)

The database consists of 8 normalized tables with foreign keys and performance indexes:

1. **`users`**: `id`, `name`, `email`, `password_hash`, `role` (user/admin), `avatar`, `daily_streak`, `last_active_date`, `created_at`.
2. **`solve_history`**: `id`, `user_id`, `scramble`, `time_ms`, `moves_count`, `solution_moves`, `cube_type`, `is_dnf`, `is_plus2`, `created_at`.
3. **`saved_cubes`**: `id`, `user_id`, `title`, `cube_state` (JSON 54 stickers), `scramble`, `is_solved`, `created_at`.
4. **`tutorials`**: `id`, `category` (beginner, cfop, f2l, oll, pll, speed_tricks), `title`, `slug`, `description`, `step_order`, `algorithm`, `content_markdown`, `difficulty`.
5. **`challenges`**: `id`, `title`, `description`, `type` (daily, weekly), `scramble`, `target_time_ms`, `points`, `start_date`, `end_date`, `is_active`.
6. **`user_challenges`**: `id`, `challenge_id`, `user_id`, `time_ms`, `moves_count`, `points_earned`, `completed_at`.
7. **`notifications`**: `id`, `user_id`, `title`, `message`, `type` (reminder, challenge, achievement), `is_read`, `created_at`.
8. **`admin_audit_logs`**: `id`, `admin_id`, `action`, `details`, `ip_address`, `created_at`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL Server** (running locally on port 3306 or configured via `.env`)
- **Expo Go App** (on iOS or Android device, or Android Studio / Xcode emulator, or run directly in Web browser)

---

### Step 1: Start the Backend REST API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Review or update `.env` (already preconfigured with default local MySQL credentials):
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=cube_solver_db
   JWT_SECRET=super_secret_rubiks_cube_jwt_token_2026_production_key!
   ```

3. Build and start the server:
   ```bash
   npm run build
   npm start
   # Or for development with live-reload:
   npm run dev
   ```

4. The server will automatically connect to MySQL, create the `cube_solver_db` database, and seed initial users and tutorials.
   - Verify health: `http://localhost:5000/api/health`

---

### Step 2: Start the Mobile Frontend

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Options to preview the app:
   - **On Real Device:** Open the **Expo Go** app on your phone and scan the QR code displayed in the terminal.
   - **In Web Browser:** Press `w` in the terminal to launch the full WebGL app directly in your browser (`http://localhost:8081`).
   - **On Android Emulator:** Press `a` in the terminal.
   - **On iOS Simulator:** Press `i` in the terminal (macOS only).

---

## 🔑 Pre-seeded Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Speedcuber** | `alex@cubesolver.com` | `Password123!` | Standard User (History, Solves, Challenges) |
| **Admin** | `admin@cubesolver.com` | `Password123!` | Admin Panel + System Reports + Content Creator |

*(Both accounts can also be logged into with a single click using the "Quick Demo Accounts" buttons on the Login screen!)*

---

## 🌐 Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new cuber account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `POST /api/auth/forgot-password` - Request password reset instructions
- `GET /api/user/profile` - Fetch current user profile and career stats (Auth required)

### 3D Cube & Solver Engine
- `POST /api/cube/solve` - Invert scramble or compute step-by-step layer solution
- `POST /api/cube/validate` - Validate 54-facelet state (returns error diagnostics)
- `GET /api/cube/scramble` - Get standardized 20-move WCA scramble
- `POST /api/cube/save` - Save custom cube state (Auth required)
- `GET /api/cube/saved` - Retrieve user's saved cubes (Auth required)

### Timer & Solve History
- `POST /api/solve/save` - Record a solve result with scramble and time (Auth required)
- `GET /api/solve/history` - Fetch recent solves (Auth required)
- `DELETE /api/solve/:id` - Delete a recorded solve (Auth required)

### Statistics
- `GET /api/stats` - Compute Best Single, Average, Ao5, Ao12, distribution, and trend graph (Auth required)

### Challenges & Leaderboard
- `GET /api/challenges` - Get active daily and weekly sprints with leaderboards (Auth required)
- `POST /api/challenges/:id/submit` - Submit challenge solve time (Auth required)
- `GET /api/challenges/:id/leaderboard` - Fetch global rankings for a challenge (Auth required)

### Learning Academy
- `GET /api/tutorials` - List tutorials (optional `?category=beginner|cfop|f2l|oll|pll`)
- `GET /api/tutorials/:slug` - Get specific tutorial lesson with algorithm

### Notifications
- `GET /api/notifications` - Retrieve alerts, daily streak reminders, and achievements (Auth required)
- `PUT /api/notifications/:id/read` - Mark notification(s) as read (Auth required)

### Administrator Control Center (Admin Auth Required)
- `GET /api/admin/reports` - System-wide performance and solve audit logs
- `GET /api/admin/users` - Moderation list of registered cubers
- `POST /api/admin/tutorials` - Add new educational curriculum
- `POST /api/admin/challenges` - Launch new competition sprints

---

## 💡 Testing Verification Checklist

- [x] **Backend API:** Compiled with TypeScript without errors, health check returns `status: healthy`.
- [x] **Database:** MySQL2 connection pool with automatic initialization and resilient zero-failure in-memory fallback.
- [x] **Authentication:** JWT token generation, bcrypt password hashing, and role-based authorization guard.
- [x] **3D Rubik's Cube:** Interactive Three.js WebGL canvas with touch gestures, raycasting, face turns, row turns, column turns, and orbit controls.
- [x] **Solver Engine:** Generates valid move sequences ($R, U, R', U', F2$), validates state, and provides step-by-step playback with Auto-Play & Pause.
- [x] **Manual Color Editor:** 6-color palette (White, Yellow, Red, Orange, Blue, Green) to paint stickers with validation counters.
- [x] **Speedcubing Timer:** Hold-to-start gesture, millisecond stopwatch, WCA scrambles, and automatic database save.
- [x] **Analytics:** Ao5, Ao12, solve progression graph, and distribution histogram.
- [x] **Challenges:** Daily & Weekly sprints with leaderboards and share integration.
- [x] **Admin Panel:** User management, tutorial creator, and challenge launcher.
- [x] **Mobile UI:** Dark theme, glassmorphism cards, and responsive navigation.
