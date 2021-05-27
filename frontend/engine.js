"use strict";

class Engine {
    constructor(update, render, tickRate, frameSkip) {
        this.update = update;
        this.render = render;
        this.lastFrame = 0.0;
        this.tickRate = tickRate;
        this.frameSkip = 6 | 0;
        this.delta = 0.0;
    }

    start() {
        this.lastFrame = window.performance.now();
        window.requestAnimationFrame(this.run.bind(this));
    }

    handleRun() {
        window.requestAnimationFrame(this.run.bind(this));
    }

    run(now) {
        this.delta += (now - this.lastFrame);
        this.lastFrame = now;
        let iterations = 0 | 0;

        while (this.delta > this.tickRate && iterations++ < this.frameSkip) {
            update(this.tickRate);
            this.delta -= this.tickRate;
        }

        this.delta = Math.min(Math.max(this.delta, 0.0), this.tickRate);
        render(this.delta / this.tickRate);
        this.handleRun();
    }
}
