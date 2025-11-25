export class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1500;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
    }

    update(deltaTime) {
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawn();
            // Decrease interval as speed increases, but cap it
            this.spawnInterval = Math.max(500, 1500 - this.game.speed * 50);
            this.spawnTimer = this.spawnInterval;
        }

        // Move obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.game.speed;

            // Remove off-screen
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawn() {
        // Difficulty scaling: 0 to 1 based on speed
        // Speed starts at 5, max reasonable speed around 15-20?
        const difficulty = Math.min(1, (this.game.speed - 5) / 10);

        // Check if score is above 30,000 for dual obstacles
        const highScore = this.game.score >= 30000;

        // 30% chance of dual obstacles when score > 30,000
        if (highScore && Math.random() < 0.3) {
            this.spawnDualObstacles();
            return;
        }

        const rand = Math.random();

        // Pattern selection based on difficulty
        if (rand < 0.6 - (difficulty * 0.3)) {
            this.spawnSingle();
        } else if (rand < 0.8 - (difficulty * 0.1)) {
            this.spawnLong();
        } else if (rand < 0.9) {
            this.spawnDoubleFlip();
        } else {
            this.spawnBarrage();
        }
    }

    spawnDualObstacles() {
        // Spawn two obstacles on different levels (ceiling+middle, floor+middle, or ceiling+floor)
        const pattern = Math.random();
        const x = this.game.width;
        const width = 40 + Math.random() * 30;

        if (pattern < 0.33) {
            // Ceiling + Middle
            this.createObstacle(x, width, 0.1);  // Ceiling
            this.createObstacle(x, width, 0.7);  // Middle
        } else if (pattern < 0.66) {
            // Floor + Middle
            this.createObstacle(x, width, 0.4);  // Floor
            this.createObstacle(x, width, 0.7);  // Middle
        } else {
            // Ceiling + Floor (hardest)
            this.createObstacle(x, width, 0.1);  // Ceiling
            this.createObstacle(x, width, 0.4);  // Floor
        }
    }

    spawnSingle() {
        const obstacleType = Math.random();
        // Scale width by speed to maintain challenge at higher speeds
        const baseWidth = 30 + Math.random() * 30;
        const width = baseWidth * (1 + (this.game.speed - 5) * 0.05);
        const x = this.game.width;
        this.createObstacle(x, width, obstacleType);
    }

    spawnLong() {
        // A very wide obstacle that forces the player to stay on one side
        const obstacleType = Math.random() < 0.5 ? 0 : 0.5; // Floor or Ceiling only
        const baseWidth = 200 + Math.random() * 200; // Long!
        const width = baseWidth * (1 + (this.game.speed - 5) * 0.05);
        const x = this.game.width;
        this.createObstacle(x, width, obstacleType);
    }

    spawnDoubleFlip() {
        // Two obstacles on opposite sides, forcing a flip
        const firstType = Math.random() < 0.5 ? 0 : 0.5; // Floor or Ceiling
        const secondType = firstType === 0 ? 0.5 : 0; // Opposite

        const width = 40 + Math.random() * 20;
        const x = this.game.width;
        const gap = 150 + Math.random() * 100; // Gap between them

        this.createObstacle(x, width, firstType);
        this.createObstacle(x + width + gap, width, secondType);
    }

    spawnBarrage() {
        // A series of small obstacles on the same side
        const type = Math.random() < 0.5 ? 0 : 0.5;
        const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 obstacles
        const width = 30;
        const gap = 100; // Small gap

        for (let i = 0; i < count; i++) {
            this.createObstacle(this.game.width + i * (width + gap), width, type);
        }
    }

    createObstacle(x, width, typeValue) {
        let y, height;

        if (typeValue < 0.25) {
            // Ceiling obstacle (25%)
            height = 40 + Math.random() * 40;
            y = 50;
        } else if (typeValue < 0.5) {
            // Floor obstacle (25%)
            height = 40 + Math.random() * 40;
            y = this.game.height - 50 - height;
        } else {
            // Middle floating obstacle (50%) - with varied shapes
            const shapeType = Math.random();
            const middleStart = this.game.height * 0.35;
            const middleEnd = this.game.height * 0.65;

            if (shapeType < 0.5) {
                // Square/Rectangle (50% of middle obstacles)
                height = 30 + Math.random() * 30;
                y = middleStart + Math.random() * (middleEnd - middleStart - height);
            } else if (shapeType < 0.75) {
                // Tall thin obstacle (25% of middle obstacles)
                height = 60 + Math.random() * 40;
                y = middleStart + Math.random() * (middleEnd - middleStart - height);
            } else {
                // Small compact obstacle (25% of middle obstacles)
                height = 20 + Math.random() * 15;
                y = middleStart + Math.random() * (middleEnd - middleStart - height);
            }
        }

        this.obstacles.push({
            id: Date.now() + Math.random(),
            x,
            y,
            width,
            height,
            color: '#00ff00'
        });
    }


    checkCollision(player) {
        for (const obs of this.obstacles) {
            if (
                player.x < obs.x + obs.width &&
                player.x + player.size > obs.x &&
                player.y < obs.y + obs.height &&
                player.y + player.size > obs.y
            ) {
                return obs; // Return the obstacle object
            }
        }
        return null;
    }

    draw(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';

        for (const obs of this.obstacles) {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        ctx.shadowBlur = 0;
    }
}
