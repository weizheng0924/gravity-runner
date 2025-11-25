export class CollectibleManager {
    constructor(game) {
        this.game = game;
        this.collectibles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 1000; // Reduced from 2000 to 1000 (spawn twice as often)
    }

    reset() {
        this.collectibles = [];
        this.spawnTimer = 0;
    }

    update(deltaTime) {
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawn();
            this.spawnTimer = this.spawnInterval;
        }

        // Move collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.x -= this.game.speed;

            // Remove off-screen
            if (item.x + item.size < 0) {
                this.collectibles.splice(i, 1);
            }
        }
    }

    spawn() {
        const rand = Math.random();

        if (rand < 0.5) {
            this.spawnSingle();
        } else if (rand < 0.8) {
            this.spawnLine();
        } else {
            this.spawnV();
        }
    }

    spawnSingle() {
        const x = this.game.width;
        const size = 30;
        const type = Math.random() < 0.8 ? 'coin' : 'shield';

        // Random Y position in the middle area
        const middleStart = this.game.height * 0.3;
        const middleEnd = this.game.height * 0.7;
        const y = middleStart + Math.random() * (middleEnd - middleStart - size);

        this.createCollectible(x, y, size, type);
    }

    spawnLine() {
        const count = 3 + Math.floor(Math.random() * 3); // 3-5 coins
        const x = this.game.width;
        const size = 30;
        const type = 'coin'; // Lines are usually coins

        const middleStart = this.game.height * 0.3;
        const middleEnd = this.game.height * 0.7;
        const y = middleStart + Math.random() * (middleEnd - middleStart - size);

        for (let i = 0; i < count; i++) {
            this.createCollectible(x + i * (size + 10), y, size, type);
        }
    }

    spawnV() {
        const count = 5;
        const x = this.game.width;
        const size = 30;
        const type = 'coin';

        const middleY = this.game.height / 2;
        const offset = 40;

        for (let i = 0; i < count; i++) {
            // V shape: 0, 1, 2, 1, 0 * offset
            const yOffset = Math.abs(i - 2) * offset;
            this.createCollectible(x + i * (size + 10), middleY - 100 + yOffset, size, type);
        }
    }

    createCollectible(x, y, size, type) {
        this.collectibles.push({
            x,
            y,
            size,
            type,
            rotation: 0
        });
    }

    checkCollection(player) {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];

            // Check collision with player
            if (
                player.x < item.x + item.size &&
                player.x + player.size > item.x &&
                player.y < item.y + item.size &&
                player.y + player.size > item.y
            ) {
                this.collectibles.splice(i, 1);
                return item.type;
            }
        }
        return null;
    }

    draw(ctx) {
        for (const item of this.collectibles) {
            ctx.save();
            ctx.translate(item.x + item.size / 2, item.y + item.size / 2);
            item.rotation += 0.05;
            ctx.rotate(item.rotation);

            if (item.type === 'coin') {
                // Draw coin (yellow star)
                ctx.fillStyle = '#FFD700';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#FFD700';
                this.drawStar(ctx, 0, 0, 5, item.size / 2, item.size / 4);
            } else if (item.type === 'shield') {
                // Draw shield (cyan hexagon)
                ctx.fillStyle = '#00FFFF';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00FFFF';
                this.drawHexagon(ctx, 0, 0, item.size / 2);
            }

            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    drawHexagon(ctx, cx, cy, radius) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
}
