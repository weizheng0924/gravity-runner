import { Player } from './Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { Input } from './Input.js';
import { FirebaseLeaderboard } from './FirebaseLeaderboard.js';
import { CollectibleManager } from './CollectibleManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.player = new Player(this);
        this.obstacleManager = new ObstacleManager(this);
        this.collectibleManager = new CollectibleManager(this);
        this.input = new Input(this);

        this.score = 0;
        this.speed = 5;
        this.combo = 0;
        this.shield = 0;
        this.lastObstacleCount = 0;
        this.isRunning = false;
        this.isGameOver = false;
        this.lastTime = 0;
        this.comboDisplayTime = 0;
        this.invincibilityTime = 0; // Invincibility after shield use
        this.collidedObstacles = new Set(); // Track obstacles we've collided with
        this.gameStartTime = 0; // Track when game started
        this.gameDuration = 0; // Track total game time

        this.ui = {
            score: document.getElementById('score'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score'),
            rankMessage: document.getElementById('rank-message'),
            nameInputContainer: document.getElementById('name-input-container'),
            playerNameInput: document.getElementById('player-name'),
            saveScoreBtn: document.getElementById('save-score-btn'),
            leaderboardList: document.getElementById('leaderboard-list'),
            globalLeaderboardList: document.getElementById('global-leaderboard-list'),
            firebaseStatus: document.getElementById('firebase-status'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
        };

        this.currentScore = 0;
        this.scoreSaved = false;

        this.leaderboard = new FirebaseLeaderboard();
        this.setupTabs();

        this.bindEvents();

        // Handle resize
        window.addEventListener('resize', () => {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
            this.player.onResize();
        });

        // Handle mobile orientation change specifically
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.width = this.canvas.width = window.innerWidth;
                this.height = this.canvas.height = window.innerHeight;
                this.player.onResize();
            }, 100);
        });

    }

    bindEvents() {
        const preventSpace = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                // If game is running, trigger flip instead
                if (this.isRunning) {
                    this.player.flipGravity();
                }
            }
        };

        this.ui.startBtn.addEventListener('keydown', preventSpace);
        this.ui.restartBtn.addEventListener('keydown', preventSpace);

        this.ui.startBtn.addEventListener('click', (e) => {
            this.startGame();
            this.ui.startBtn.blur();
            // Ensure focus goes to body/window
            window.focus();
        });

        this.ui.restartBtn.addEventListener('click', (e) => {
            this.resetGame();
            this.ui.restartBtn.blur();
            window.focus();
        });

        // Save score button
        this.ui.saveScoreBtn.addEventListener('click', () => this.saveScore());

        // Enter key in name input
        this.ui.playerNameInput.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') {
                this.saveScore();
            }
        });
    }

    async saveScore() {
        if (this.scoreSaved) return;

        const playerName = this.ui.playerNameInput.value.trim() || 'Anonymous';
        this.scoreSaved = true;

        // Save score with name and game duration
        const rank = await this.leaderboard.addScore(this.currentScore, playerName, this.gameDuration);

        // Display rank message
        if (rank > 0) {
            this.ui.rankMessage.textContent = `🏆 Rank #${rank}!`;
        } else {
            this.ui.rankMessage.textContent = '';
        }

        // Hide name input, show leaderboard
        this.ui.nameInputContainer.classList.add('hidden');
        this.displayLeaderboard(this.currentScore);
    }


    startGame() {
        this.isRunning = true;
        this.isGameOver = false;
        this.score = 0;
        this.speed = 5;
        this.combo = 0;
        this.shield = 0;
        this.lastObstacleCount = 0;
        this.comboDisplayTime = 0;
        this.invincibilityTime = 0;
        this.collidedObstacles.clear();
        this.gameStartTime = Date.now(); // Record start time
        this.gameDuration = 0;
        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.lastTime = performance.now();
        this.player.reset();
        this.obstacleManager.reset();
        this.collectibleManager.reset();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    resetGame() {
        this.startGame();
    }

    async gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.gameDuration = Math.floor((Date.now() - this.gameStartTime) / 1000); // Duration in seconds
        this.currentScore = Math.floor(this.score);
        this.scoreSaved = false;
        this.ui.finalScore.textContent = `Score: ${this.currentScore}`;

        // Show name input and hide leaderboard initially
        this.ui.nameInputContainer.classList.remove('hidden');
        this.ui.playerNameInput.value = '';
        this.ui.playerNameInput.focus();

        this.ui.gameOverScreen.classList.remove('hidden');
    }

    displayLeaderboard(currentScore) {
        const scores = this.leaderboard.getLocalScores();
        this.ui.leaderboardList.innerHTML = '';

        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            if (entry.score === currentScore) {
                li.classList.add('current');
            }

            const info = document.createElement('div');
            info.className = 'score-info';

            const rank = document.createElement('span');
            rank.textContent = `#${index + 1}`;

            const name = document.createElement('span');
            name.textContent = entry.name || 'Anonymous';
            name.className = 'player-name';

            const score = document.createElement('span');
            score.textContent = entry.score;

            info.appendChild(rank);
            info.appendChild(name);
            li.appendChild(info);
            li.appendChild(score);
            this.ui.leaderboardList.appendChild(li);
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                btn.classList.add('active');
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');

                // Load global leaderboard when switching to global tab
                if (btn.dataset.tab === 'global') {
                    this.loadGlobalLeaderboard();
                }
            });
        });
    }

    async loadGlobalLeaderboard() {
        this.ui.firebaseStatus.textContent = 'Loading...';

        try {
            const scores = await this.leaderboard.getGlobalScores();
            this.displayGlobalLeaderboard(scores);

            if (this.leaderboard.isFirebaseAvailable()) {
                this.ui.firebaseStatus.textContent = '🌍 Global leaderboard (cached 5 min)';
            } else {
                this.ui.firebaseStatus.textContent = '⚠️ Firebase unavailable, showing local scores';
            }
        } catch (error) {
            this.ui.firebaseStatus.textContent = '❌ Failed to load global scores';
        }
    }

    displayGlobalLeaderboard(scores) {
        this.ui.globalLeaderboardList.innerHTML = '';

        if (scores.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No scores yet. Be the first!';
            li.style.justifyContent = 'center';
            this.ui.globalLeaderboardList.appendChild(li);
            return;
        }

        scores.forEach((entry, index) => {
            const li = document.createElement('li');

            const info = document.createElement('div');
            info.className = 'score-info';

            const rank = document.createElement('span');
            rank.textContent = `#${index + 1}`;

            const name = document.createElement('span');
            name.textContent = entry.name || 'Anonymous';
            name.className = 'player-name';

            const score = document.createElement('span');
            score.textContent = entry.score;

            info.appendChild(rank);
            info.appendChild(name);
            li.appendChild(info);
            li.appendChild(score);
            this.ui.globalLeaderboardList.appendChild(li);
        });
    }


    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(deltaTime) {
        // Increase speed over time (reduced from 0.001 to 0.0007 for longer games)
        this.speed += 0.0007 * deltaTime;

        // Speed-based scoring: score increases faster as speed increases
        // Base score rate * speed multiplier
        const speedMultiplier = this.speed / 5; // Initial speed is 5, so starts at 1x
        const comboMultiplier = 1 + (this.combo * 0.1); // +10% per combo
        this.score += (speedMultiplier * comboMultiplier * deltaTime) / 10;

        this.ui.score.textContent = `Score: ${Math.floor(this.score)}`;

        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime);
        this.collectibleManager.update(deltaTime);

        // Check collectible collection
        const collected = this.collectibleManager.checkCollection(this.player);
        if (collected === 'coin') {
            this.score += 200; // Increased from 50 to 200
            this.combo++;
            this.comboDisplayTime = 1000; // Show combo for 1 second
        } else if (collected === 'shield' && this.shield < 1) {
            this.shield = 1;
        }

        // Track combo from dodging obstacles
        const currentObstacleCount = this.obstacleManager.obstacles.length;
        if (currentObstacleCount < this.lastObstacleCount) {
            // An obstacle went off-screen (dodged)
            this.combo++;
            this.comboDisplayTime = 1000;
        }
        this.lastObstacleCount = currentObstacleCount;

        // Decrease combo display time
        if (this.comboDisplayTime > 0) {
            this.comboDisplayTime -= deltaTime;
        }

        // Decrease invincibility time
        if (this.invincibilityTime > 0) {
            this.invincibilityTime -= deltaTime;
        }

        // Check collisions
        const collidedObstacle = this.obstacleManager.checkCollision(this.player);
        if (collidedObstacle) {
            // If we haven't collided with this specific obstacle before
            if (!this.collidedObstacles.has(collidedObstacle.id)) {
                this.collidedObstacles.add(collidedObstacle.id);

                if (this.shield > 0) {
                    // Use shield - can pass through
                    this.shield = 0;
                    this.combo = 0; // Reset combo on hit
                } else {
                    // No shield - game over
                    this.gameOver();
                }
            }
            // If we've already collided with this obstacle and have shield, just pass through
        }

        // Clean up old obstacle IDs from the set
        const currentObstacleIds = new Set(this.obstacleManager.obstacles.map(o => o.id));
        for (const id of this.collidedObstacles) {
            if (!currentObstacleIds.has(id)) {
                this.collidedObstacles.delete(id);
            }
        }
    }


    draw() {
        // Clear screen with trail effect
        this.ctx.fillStyle = 'rgba(10, 10, 18, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw floor and ceiling lines
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 50);
        this.ctx.lineTo(this.width, 50);
        this.ctx.moveTo(0, this.height - 50);
        this.ctx.lineTo(this.width, this.height - 50);
        this.ctx.stroke();

        this.collectibleManager.draw(this.ctx);
        this.player.draw(this.ctx);
        this.obstacleManager.draw(this.ctx);

        // Draw shield indicator
        if (this.shield > 0) {
            this.ctx.save();
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.size / 2,
                this.player.y + this.player.size / 2,
                this.player.size,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw combo display
        if (this.combo > 1 && this.comboDisplayTime > 0) {
            this.ctx.save();
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#FFD700';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`COMBO x${this.combo}!`, this.width / 2, 100);
            this.ctx.restore();
        }
    }
}
