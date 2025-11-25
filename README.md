# Gravity Runner 🎮

A neon cyberpunk-styled endless runner game with gravity-flipping mechanics.

## 🎯 Features

- **Gravity Flip Mechanics**: Click, tap, or press spacebar to flip gravity
- **Dynamic Obstacles**: Ceiling, floor, and floating obstacles
- **Power-ups System**:
  - ⭐ **Coins**: +200 points, increases combo
  - 🛡️ **Shield**: Pass through one obstacle
- **Combo System**: Chain dodges for score multipliers (+10% per combo)
- **Speed-Based Scoring**: Score increases faster as game speed increases
- **Global Leaderboard**: Compete with players worldwide (Firebase)
- **Local Best Scores**: Track your personal top 10
- **Mobile Optimized**: Touch controls and responsive design

## 🎮 How to Play

- **Desktop**: Click or press Spacebar/Arrow Keys to flip gravity
- **Mobile**: Tap anywhere on the screen
- Collect coins (⭐) for points and combo
- Grab shields (🛡️) to survive one hit
- Avoid obstacles and survive as long as possible!

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📦 Deployment

This game is deployed on GitHub Pages using the `gh-pages` branch.

```bash
# Build and deploy
npm run build
git add -f dist
git commit -m "Update dist"
git subtree push --prefix dist origin gh-pages
```

## 🛠️ Tech Stack

- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5 Canvas** - For game rendering
- **Firebase Firestore** - Global leaderboard
- **Vite** - Build tool and dev server

## 🎨 Design

Neon cyberpunk aesthetic with:
- Vibrant cyan and pink colors
- Glow effects and shadows
- Smooth animations
- Responsive UI

---

Made with ❤️ using Vanilla JS
