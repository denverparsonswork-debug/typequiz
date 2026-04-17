# PKMN LABS: Competitive Training Suite

A high-performance training ground for aspiring Pokémon Champions. Master type matchups, ability synergies, and move interactions across all 9 generations.

## 🚀 Current Status
- **Active Feature:** MongoDB Integration & Categorized Leaderboard (Complete)
- **Last Updated:** April 17, 2026
- **Build Status:** Passing (v0.2.0)

---

## 🛠 Feature Roadmap

### ✅ Completed
- [x] **Type Matchup Quiz:** Core engine with difficulty levels (Easy, Dual, Hard).
- [x] **Move Mastery:** Pokémon sprite-based identification of super-effective moves.
- [x] **Ability Oracle:** Matching ability descriptions to names.
- [x] **Ability Synergy:** Identifying legal abilities for specific Pokémon.
- [x] **Gen Selector:** Full support for mechanics from Gens 1 through 9.
- [x] **Resources Hub:** Dynamic type chart and community links.
- [x] **UI Polish:** SVG life counters, mobile responsiveness, and dark-mode aesthetic.
- [x] **User Authentication:** Secure JWT-based signup/login system with password hashing.
- [x] **Global Leaderboard:** Categorized rankings by game type, mode, and generation.
- [x] **Database Persistence:** MongoDB integration for cross-session score tracking.

### 🚧 In Progress (Next Session)
- [ ] **Custom Drills:** Select specific types or generations to focus on.

### 📅 Planned Features
- [ ] **Challenge Mode:** Weekly rotating gauntlets with special rules.
- [ ] **Sound Suite:** Retro-inspired SFX and ambient battle music.
- [ ] **Pokedex Integration:** View detailed stats for Pokémon encountered in quizzes.

---

## 📋 Session Log

### 2026-04-17 (Session 2)
- Implemented Full-Stack architecture with Node.js/Express and MongoDB.
- Built a secure Authentication system (Sign In / Sign Up) with security warnings.
- Created a categorized, multi-tiered Leaderboard with Generation-specific filtering.
- Integrated "Retroactive Saving" - prompting users to register to save high scores.
- Fixed heart icon rendering issues and streak reset bugs in all game modes.
- Added dynamic Type Chart reference to the Resources tab.

### 2026-04-17 (Session 1)
- Finalized Gen Selector implementation across all modules.
- Initialized README-based project tracking system.

---

## 🔧 Development

### 1. Prerequisite
Ensure **MongoDB** is running locally on `mongodb://localhost:27017`.

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```

### 4. Build for Production
```bash
# Root directory
npm run build
# Server directory
cd server
npm run build
```
