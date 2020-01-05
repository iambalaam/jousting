import { Renderer } from "../app";
import { backgroundFill } from '../drawing';

export class Loading implements Renderer {
    draw = (ctx: CanvasRenderingContext2D, time: number) => {
        const brightness = (Math.sin(time / 1000) + 1) / 2;
        const color = Array(3).fill(brightness * 255).join(',');
        backgroundFill(ctx, `rgb(${color})`);
    }
}