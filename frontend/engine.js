"use strict";

class Engine {
    constructor(update, render, tickRate, frameSkip) {
        this.update = update;
        this.render = render;
        this.lastFrame = 0.0;
        this.tickRate = tickRate;
        this.frameSkip = 6 | 0;
    }

    start() {
        this.lastFrame = window.performance.now();
        window.requestAnimationFrame(this.run.bind(this));
    }

    handleRun() {
        window.requestAnimationFrame(this.run.bind(this));
    }

    run() {
        let now = window.performance.now();
        let delta = (now - this.lastFrame);
        this.lastFrame = now;
        let iterations = 0 | 0;

        while (delta > this.tickRate && ++iterations < this.frameSkip) {
            update(this.tickRate);
            delta -= this.tickRate;
        }

        delta = Math.min(Math.max(delta, 0.0), this.tickRate);
        render(delta);
        this.handleRun();
    }
}
