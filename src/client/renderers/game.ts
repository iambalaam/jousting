import { CanvasRenderer, CANVAS_WIDTH, CANVAS_HEIGHT, Vector } from ".";
import { PlayerState, createPlayer } from '../player';
import { socket } from "..";

// Game Constants
const GRAVITY = 3e-2;
const FLOOR_HEIGHT = 300;

// Player Constants
const PLAYER_DIAMETER = 15;
const PLAYER_RADIUS = PLAYER_DIAMETER / 2;
const PLAYER_SPEED = 7;
const PLAYER_ACCN = 0.8; // 0-1 where 1 is instantly new speed
const PLAYER_JUMP = 10;
const PLAYER_SMALLEST_MOVE_DELTA = 20;


const player = createPlayer({
    team: 'indianred',
    position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }
});

export class Game extends CanvasRenderer {
    pointer?: Vector = undefined;
    activePointer?: boolean = undefined;

    constructor(private updateRenderer: (rendererConstructor: any, _opts: any) => void, _opts: any) {
        super();
        this.attachListeners(this.ctx);
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
        window.addEventListener('keydown', ({ key }) => {
            if (key === ' ') {
                player.isJumping = true;
            }
        });
        socket.on('hit', console.log);
        socket.on('player-state', console.log);

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
        // Move from input
        if (player.isJumping) {
            player.velocity.y = -PLAYER_JUMP;
            player.grounded = false;
            player.isJumping = false;
        }

        // Move on input
        if (this.activePointer && this.pointer && player.grounded) {
            if (Math.abs(this.pointer.x - player.position.x) > PLAYER_SMALLEST_MOVE_DELTA) {
                player.velocity.x =
                    (PLAYER_ACCN * (PLAYER_SPEED * Math.sign(this.pointer.x - player.position.x))) +
                    ((1 - PLAYER_ACCN) * (player.velocity.x));
            }
        }

        // Slow down on the ground or walls
        if (player.grounded) {
            player.velocity.x *= PLAYER_ACCN; // This needs to be an equation based on frameDuration
        }
        if (player.sliding) {
            player.velocity.y *= PLAYER_ACCN;
        }

        // Perform physics
        player.velocity.y += (GRAVITY * frameDuration);
        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;

        // Calculate collisions
        // floor
        if (player.position.y + PLAYER_RADIUS > FLOOR_HEIGHT) {
            player.velocity.y = 0;
            player.position.y = FLOOR_HEIGHT - PLAYER_RADIUS;
            player.grounded = true;
        }
        // walls
        if (player.position.x <= 0 + PLAYER_RADIUS) {
            player.velocity.x = 0;
            player.position.x = 0 + PLAYER_RADIUS;
            player.sliding = true;
        } else if (player.position.x >= CANVAS_WIDTH - PLAYER_RADIUS) {
            player.velocity.x = 0;
            player.position.x = CANVAS_WIDTH - PLAYER_RADIUS;
            player.sliding = true;
        } else {
            player.sliding = false;
        }

        //Draw
        this.drawBackground(ctx);
        this.drawPlayer(ctx, player);
        if (this.pointer && this.activePointer) {
            this.drawPlayer(ctx, createPlayer({ team: 'white', position: this.pointer }));
        }
    }
}