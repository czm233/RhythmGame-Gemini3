export class Timer {
    private startTime: number = 0;
    private pausedTime: number = 0;
    private isRunning: boolean = false;
    private animationFrameId: number | null = null;

    start() {
        if (this.isRunning) return;
        this.startTime = performance.now() - this.pausedTime;
        this.isRunning = true;
    }

    pause() {
        if (!this.isRunning) return;
        this.pausedTime = performance.now() - this.startTime;
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    reset() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    getTime(): number {
        if (!this.isRunning) return this.pausedTime;
        return performance.now() - this.startTime;
    }
}

export const gameTimer = new Timer();
