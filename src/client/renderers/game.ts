import { CanvasRenderer, CANVAS_WIDTH, CANVAS_HEIGHT } from ".";

// Game Constants
const GRAVITY = 3e-2;
const FLOOR_HEIGHT = 300;

// Player Constants
const PLAYER_DIAMETER = 15;
const PLAYER_RADIUS = PLAYER_DIAMETER / 2;
const PLAYER_SPEED = 5;
const PLAYER_ACCN = 0.8; // 0-1 where 1 is instantly new speed

export interface Vector { x: number, y: number; }
export interface PlayerState {
    color: string,
    grounded: boolean;
    position: Vector,
    velocity: Vector;
}

const player: PlayerState = {
    color: 'indianred',
    grounded: false,
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    velocity: { x: 0, y: 0 }
};

export class Game extends CanvasRenderer {
    pointer?: Vector = undefined;
    activePointer?: boolean = undefined;

    constructor() {
        super();
        this.attachListeners(this.ctx);
        this.drawLoop(this.ctx)(0);
    }

    getPointerPosition(ctx: CanvasRenderingContext2D, v: Vector): Vector {
        const { left, top } = ctx.canvas.getBoundingClientRect();
        return { x: v.x - left, y: v.y - top };
    }

    attachListeners(ctx: CanvasRenderingContext2D) {
        ctx.canvas.addEventListener('mousedown', ({ x, y }: MouseEvent) => {
            this.activePointer = true;
            this.pointer = this.getPointerPosition(ctx, { x, y });
        });
        ctx.canvas.addEventListener('mousemove', ({ x, y }: MouseEvent) => {
            this.pointer = this.getPointerPosition(ctx, { x, y });
        });
        window.addEventListener('mouseup', () => {
            this.activePointer = false;
            this.pointer = undefined;
        });
        ctx.canvas.addEventListener('mouseout', () => {
            this.activePointer = false;
            this.pointer = undefined;
        });
        ctx.canvas.addEventListener('touchstart', (event: TouchEvent) => {
            this.activePointer = true;
            const { clientX, clientY } = event.touches[0];
            this.pointer = this.getPointerPosition(ctx, { x: clientX, y: clientY });
        });
        ctx.canvas.addEventListener('touchmove', (event: TouchEvent) => {
            const { clientX, clientY } = event.touches[0];
            const pointer = this.getPointerPosition(ctx, { x: clientX, y: clientY });
            if (pointer.x < 0 || pointer.x > CANVAS_WIDTH || pointer.y < 0 || pointer.y > CANVAS_HEIGHT) {
                this.pointer = undefined;
            } else {
                this.pointer = pointer;
            }
        });
        window.addEventListener('touchend', (event: TouchEvent) => {
            if (event.touches.length === 0) {
                this.activePointer = false;
                this.pointer = undefined;
            }
        });
        window.addEventListener('touchcancel', (event: TouchEvent) => {
            if (event.touches.length === 0) {
                this.activePointer = false;
                this.pointer = undefined;
            }
        });
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'rgb(89, 124, 66)';
        ctx.fillRect(0, FLOOR_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
        ctx.fillStyle = player.color;
        const { x, y } = player.position;
        ctx.fillRect(x - PLAYER_RADIUS, y - PLAYER_RADIUS, PLAYER_DIAMETER, PLAYER_DIAMETER);
    }

    draw(ctx: CanvasRenderingContext2D, frameDuration: number) {
        // Perform physics
        player.velocity.y += (GRAVITY * frameDuration);
        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;
        if (this.activePointer && this.pointer) {
            // Move on input
            player.velocity.x =
                (PLAYER_ACCN * (PLAYER_SPEED * Math.sign(this.pointer.x - player.position.x))) +
                ((1 - PLAYER_ACCN) * (player.velocity.x));
        } else if (player.grounded) {
            // Slow down if no input
            player.velocity.x *= PLAYER_ACCN; // This needs to be an equation based on frameDuration
        }

        // Calculate collisions
        if (player.position.y + PLAYER_RADIUS > FLOOR_HEIGHT) {
            player.velocity.y = 0;
            player.position.y = FLOOR_HEIGHT - PLAYER_RADIUS;
            player.grounded = true;
        }

        //Draw
        this.drawBackground(ctx);
        this.drawPlayer(ctx, player);
        if (this.pointer && this.activePointer) {
            this.drawPlayer(ctx, {
                color: 'white',
                grounded: false,
                position: this.pointer,
                velocity: this.pointer
            });
        }
    }
}