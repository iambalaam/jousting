import { Renderer } from "../app";
import { backgroundFill } from '../drawing';

export class Matchmaking implements Renderer {
    constructor() {
        fetch('/api/players')
            .then((data) => data.json())
            .then(console.log);
    }

    draw = (ctx: CanvasRenderingContext2D, time: number) => {
        backgroundFill(ctx, 'white');
    };
}