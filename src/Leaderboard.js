export class Leaderboard {
    constructor() {
        this.storageKey = 'gravityRunnerLeaderboard';
        this.maxEntries = 10;
    }

    getScores() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    addScore(score, name = 'Anonymous') {
        const scores = this.getScores();
        const timestamp = new Date().toISOString();

        scores.push({
            score: Math.floor(score),
            name: name.trim() || 'Anonymous',
            date: timestamp
        });

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Keep only top entries
        const topScores = scores.slice(0, this.maxEntries);

        localStorage.setItem(this.storageKey, JSON.stringify(topScores));

        // Return rank (1-indexed), or 0 if not in top 10
        const rank = topScores.findIndex(s => s.score === Math.floor(score) && s.date === timestamp);
        return rank >= 0 ? rank + 1 : 0;
    }

    isHighScore(score) {
        const scores = this.getScores();
        if (scores.length < this.maxEntries) return true;
        return score > scores[scores.length - 1].score;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }
}
