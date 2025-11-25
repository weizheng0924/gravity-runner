import { db } from './firebase.js';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Leaderboard } from './Leaderboard.js';

export class FirebaseLeaderboard {
    constructor() {
        this.localLeaderboard = new Leaderboard();
        this.collectionName = 'leaderboard';
        this.firebaseEnabled = true;
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 1 * 60 * 1000; // 1 minute
    }

    async addScore(score, name = 'Anonymous', gameDuration = 0) {
        // Always save to local first
        const localRank = this.localLeaderboard.addScore(score, name);

        // Try to save to Firebase
        if (this.firebaseEnabled) {
            try {
                // Calculated limit based on game mechanics:
                // Max Base Score (Speed 20, Combo 100): ~11,000 pts/sec
                // Max Coin Score (10 coins/sec): 2,000 pts/sec
                // Total theoretical max: ~13,000 pts/sec
                // Setting safe limit to 15,000 pts/sec with 5,000 buffer for short games
                const maxPossibleScore = Math.max(5000, gameDuration * 15000);
                const actualScore = Math.floor(score);

                // Only save if score seems reasonable
                if (actualScore <= maxPossibleScore || gameDuration === 0) {
                    await addDoc(collection(db, this.collectionName), {
                        score: actualScore,
                        name: name.trim() || 'Anonymous',
                        gameDuration: gameDuration,
                        timestamp: new Date().toISOString(),
                        date: new Date().toLocaleDateString()
                    });
                } else {
                    console.warn(`Score rejected: ${actualScore} > ${maxPossibleScore} (Duration: ${gameDuration}s)`);
                }
            } catch (error) {
                console.warn('Firebase write failed, using local only:', error);
                this.firebaseEnabled = false;
            }
        }

        return localRank;
    }

    async getGlobalScores() {
        // Return cached data if still valid
        const now = Date.now();
        if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
            return this.cache;
        }

        if (!this.firebaseEnabled) {
            return this.localLeaderboard.getScores();
        }

        try {
            const q = query(
                collection(db, this.collectionName),
                orderBy('score', 'desc'),
                limit(20)
            );

            const querySnapshot = await getDocs(q);
            const scores = [];

            querySnapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            // Cache the results
            this.cache = scores;
            this.cacheTime = now;

            return scores;
        } catch (error) {
            console.warn('Firebase read failed, using local leaderboard:', error);
            this.firebaseEnabled = false;
            return this.localLeaderboard.getScores();
        }
    }

    getLocalScores() {
        return this.localLeaderboard.getScores();
    }

    isFirebaseAvailable() {
        return this.firebaseEnabled;
    }
}
