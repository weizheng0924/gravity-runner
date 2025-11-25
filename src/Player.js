export class Player {
    constructor(game) {
        this.game = game;
        this.size = 30;
        this.x = 100;
        this.y = 0;
        this.vy = 0;
        this.gravity = 0.6;
        this.jumpForce = 12;
        this.gravityDirection = 1; // 1 for down, -1 for up
        this.color = '#ff00ff';
        this.reset();
    }

    reset() {
        this.y = this.game.height / 2;
        this.vy = 0;
        this.gravityDirection = 1;
        this.onGround = false;
    }

    onResize() {
        // Keep player within bounds if resized
        if (this.y > this.game.height - 50 - this.size) {
            this.y = this.game.height - 50 - this.size;
        }
    }

    flipGravity() {
        this.gravityDirection *= -1;
        this.vy = 0; // Reset vertical velocity for snappy feel
    }

    update(deltaTime) {
        // Apply gravity
        this.vy += this.gravity * this.gravityDirection;
        this.y += this.vy;

        // Floor collision
        const floorY = this.game.height - 50 - this.size;
        const ceilingY = 50;

        if (this.y > floorY) {
            this.y = floorY;
            this.vy = 0;
            this.onGround = true;
        } else if (this.y < ceilingY) {
            this.y = ceilingY;
            this.vy = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }

    draw(ctx) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }
}
