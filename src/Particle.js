export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // random horizontal speed
        this.vy = (Math.random() - 0.5) * 2; // random vertical speed
        this.life = 30 + Math.random() * 20; // frames
        this.color = color || 'rgba(255,255,255,0.8)';
        this.size = 2 + Math.random() * 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        // fade out
        const alpha = Math.max(this.life / 50, 0);
        this.currentColor = this.color.replace(/rgba?\(([^,]+),([^,]+),([^,]+)(?:,[^)]*)?\)/, `rgba($1,$2,$3,${alpha})`);
    }

    draw(ctx) {
        ctx.fillStyle = this.currentColor || this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
