export class Input {
    constructor(game) {
        this.game = game;

        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
                if (this.game.isRunning) {
                    this.game.player.flipGravity();
                }
                // Prevent scrolling and button triggering for game keys
                e.preventDefault();
            }
        });


        window.addEventListener('touchstart', (e) => {
            if (this.game.isRunning) {
                this.game.player.flipGravity();
                e.preventDefault(); // Prevent scrolling
            }
        }, { passive: false });

        window.addEventListener('mousedown', (e) => {
            if (this.game.isRunning && e.target.tagName === 'CANVAS') {
                this.game.player.flipGravity();
            }
        });
    }
}
