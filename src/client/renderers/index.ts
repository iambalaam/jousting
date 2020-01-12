import { socket } from "..";
import { initDebugPing, cleanDebugPing } from "../debug-ping";

export interface Renderer {
    /**
     * This is responsible for taking control of the <main/> tag
     * It will also need to rAF in a loop
     */
    // TODO: how do I type new? 

    /**
     * This will hold all actions that must be done to clean up
     * This will be called in reverse order
     */
    cleanActions: Array<() => void>;
}

export const cleanMain = () => {
    const main = document.getElementsByTagName('main')[0];
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
};

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;

export class CanvasRenderer implements Renderer {
    rAFLoop: boolean;
    debug: boolean;
    lastTime: number;
    ping?: number;
    ctx: CanvasRenderingContext2D;
    cleanActions: Array<() => void>;

    constructor() {
        this.cleanActions = [cleanMain, () => { this.rAFLoop = false; }];
        this.rAFLoop = true;
        const params = new URLSearchParams(window.location.search);
        this.debug = params.has('debug') || params.has('forceDebug');
        if (this.debug) {
            initDebugPing((ping: number) => { this.ping = ping; });
            this.cleanActions.push(cleanDebugPing);
        }
        this.lastTime = 0;
        this.ctx = this.createCanvas();
        this.drawLoop(this.ctx)(0);
    }

    createCanvas(): CanvasRenderingContext2D {
        const main = document.getElementsByTagName('main')[0];
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        main.appendChild(canvas);
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
            throw new Error('Could not create canvas context');
        }
        return canvasContext;
    }

    drawLoop = (ctx: CanvasRenderingContext2D): FrameRequestCallback => {
        return (time) => {
            const frameDuration = time - this.lastTime;
            this.lastTime = time;
            this.draw(ctx, frameDuration);
            if (this.debug) {
                this.drawDebug(ctx, frameDuration);
            }
            if (this.rAFLoop) {
                window.requestAnimationFrame(this.drawLoop(ctx));
            }
        };
    };

    /**
     * Callback for rAF, draws a single frame
     */
    draw(ctx: CanvasRenderingContext2D, _frameDuration: number) {
        ctx.fillStyle = 'indianred';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawDebug(ctx: CanvasRenderingContext2D, frameDuration: number) {
        ctx.fillStyle = 'black';
        ctx.font = '20px sans-serif';
        // FPS
        if (frameDuration) {
            const fps = (1000 / frameDuration);
            ctx.fillText(`fps: ${fps.toFixed(0)}`, 20, 20);
        }
        // PING
        if (this.ping) {
            ctx.fillText(`ping: ${this.ping.toFixed(0)}`, 20, 40);
        }
    }
};