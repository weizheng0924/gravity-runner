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
        // Randomly choose obstacle type: ceiling, floor, or middle
        const obstacleType = Math.random();
        const width = 30 + Math.random() * 30;
        const x = this.game.width;

        let y, height;

        if (obstacleType < 0.35) {
            // Ceiling obstacle
            height = 40 + Math.random() * 40;
            y = 50;
        } else if (obstacleType < 0.7) {
            // Floor obstacle
            height = 40 + Math.random() * 40;
            y = this.game.height - 50 - height;
        } else {
            // Middle floating obstacle
            height = 30 + Math.random() * 20;
            // Spawn in the middle third of the screen
            const middleStart = this.game.height * 0.35;
            const middleEnd = this.game.height * 0.65;
            y = middleStart + Math.random() * (middleEnd - middleStart - height);
        }

        this.obstacles.push({
            id: Date.now() + Math.random(), // Unique ID
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
