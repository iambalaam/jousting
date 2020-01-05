export interface Renderer {
    /**
     * This is responsible for taking control of the <main/> tag
     * It will also need to rAF in a loop
     */
    init(): void;

    /**
     * This should remove all event listeners and clean the <main/> tag
     */
    clean(): void;
}

export const cleanMain = () => {
    const main = document.getElementsByTagName('main')[0];
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

export class CanvasRenderer implements Renderer {
    init() {
        const main = document.getElementsByTagName('main')[0];
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        main.appendChild(canvas);
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
            throw new Error('Could not create canvas context');
        }
        this.draw(canvasContext);
    }

    /**
     * Callback for rAF, draws a single frame
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'indianred';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    clean() {
        cleanMain();
    }
}