import { CanvasRenderer, CANVAS_WIDTH, CANVAS_HEIGHT, Vector } from ".";
import { PlayerState, Players } from '../player';
import { socket } from "..";

// Game Constants
const GRAVITY = 3e-2;
const FLOOR_HEIGHT = 300;

// Player Constants
const PLAYER_DIAMETER = 15;
const PLAYER_RADIUS = PLAYER_DIAMETER / 2;
const PLAYER_SPEED = 7;
const PLAYER_ACCN = 0.8;                        // [0 - 1] where 1 is instantly new speed
const PLAYER_JUMP = 10;
const PLAYER_SMALLEST_MOVE_DELTA = 20;
const PLAYER_SWORD_DRAW_SPEED = 0.1;           // [0 - 1] where 1 is instantly new length
const PLAYER_SWORD_MAX_LENGTH = 120;

export class Game extends CanvasRenderer {
    pointer?: Vector = undefined;
    // @ts-ignore handled in constructor
    player: PlayerState;
    // @ts-ignore handled in constructor
    enemies: Players;

    constructor(private updateRenderer: (rendererConstructor: any, _opts: any) => void, players: Players) {
        super();
        this.attachListeners(this.ctx);
        this.enemies = {};
        Object.entries(players)
            .forEach(([id, playerState]) => {
                if (id === socket.id) {
                    this.player = playerState;
                } else {
                    this.enemies[id] = playerState;
                }
            });
    }

    getPointerPosition(ctx: CanvasRenderingContext2D, pointer: Vector): Vector {
        const { left, top } = ctx.canvas.getBoundingClientRect();
        return { x: pointer.x - left, y: pointer.y - top };
    }

    getSwordTip(player: PlayerState, pointer: Vector | undefined, _frameDuration: number): Vector | undefined {
        if (!pointer) return;
        const dX = pointer.x - player.position.x;
        const dY = pointer.y - player.position.y;
        const pointerLength = Math.hypot(dX, dY);
        const unitSword: Vector = { x: dX / pointerLength, y: dY / pointerLength };

        // Sowrd should a proportion of max length
        // This is a function of playerVelocity, prevSwordLength and frameDuration
        const playerVelocity = Math.hypot(player.velocity.x, player.velocity.y);
        const playerVelocityContributor = 0.25 + (Math.atan(playerVelocity) * 3 / (Math.PI * 4)); // [0.25 - 1]
        const prevSwordLength = player.swordTip
            ? Math.hypot(
                player.position.x - player.velocity.x - player.swordTip.x,
                player.position.y - player.velocity.y - player.swordTip.y
            )
            : 0;
        const swordLength =
            (PLAYER_SWORD_DRAW_SPEED * playerVelocityContributor * PLAYER_SWORD_MAX_LENGTH) +
            ((1 - PLAYER_SWORD_DRAW_SPEED) * prevSwordLength);
        const swordTip: Vector = {
            x: player.position.x + unitSword.x * swordLength,
            y: player.position.y + unitSword.y * swordLength
        };
        return swordTip;
    }

    onPlayerState = ({ id, state }: { id: string, state: PlayerState; }) => {
        this.enemies[id] = state;
    };

    onHit = (id: string) => {
        if (id === socket.id) {
            // You've been hit
            console.log(`You've been hit!`);
        } else {
            // You've scored a hit
            console.log(`You've scored a hit`);
        }
    };

    attachListeners(ctx: CanvasRenderingContext2D) {
        ctx.canvas.addEventListener('mousedown', ({ x, y }: MouseEvent) => {
            this.pointer = this.getPointerPosition(ctx, { x, y });
        });
        ctx.canvas.addEventListener('mousemove', ({ x, y }: MouseEvent) => {
            if (this.pointer) {
                this.pointer = this.getPointerPosition(ctx, { x, y });
            }
        });
        window.addEventListener('mouseup', () => {
            this.pointer = undefined;
        });
        ctx.canvas.addEventListener('mouseout', () => {
            this.pointer = undefined;
        });
        ctx.canvas.addEventListener('touchstart', (event: TouchEvent) => {
            const { clientX, clientY } = event.touches[0];
            this.pointer = this.getPointerPosition(ctx, { x: clientX, y: clientY });
        });
        ctx.canvas.addEventListener('touchmove', (event: TouchEvent) => {
            if (this.pointer) {
                const { clientX, clientY } = event.touches[0];
                const pointer = this.getPointerPosition(ctx, { x: clientX, y: clientY });
                if (pointer.x < 0 || pointer.x > CANVAS_WIDTH || pointer.y < 0 || pointer.y > CANVAS_HEIGHT) {
                    this.pointer = undefined;
                } else {
                    this.pointer = pointer;
                }
            }
        });
        window.addEventListener('touchend', (event: TouchEvent) => {
            if (event.touches.length === 0) {
                this.pointer = undefined;
            }
        });
        window.addEventListener('touchcancel', (event: TouchEvent) => {
            if (event.touches.length === 0) {
                this.pointer = undefined;
            }
        });
        window.addEventListener('keydown', ({ key }) => {
            if (key === ' ') {
                this.player.isJumping = true;
            }
        });
        socket.on('hit', this.onHit);
        socket.on('player-state', this.onPlayerState);

    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = 'rgb(89, 124, 66)';
        ctx.fillRect(0, FLOOR_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
        const { x, y } = player.position;
        if (player.swordTip) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(player.swordTip.x, player.swordTip.y);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fillStyle = player.color;
        ctx.fillRect(x - PLAYER_RADIUS, y - PLAYER_RADIUS, PLAYER_DIAMETER, PLAYER_DIAMETER);
    }

    draw = (ctx: CanvasRenderingContext2D, frameDuration: number) => {
        // Move from input
        if (this.player.isJumping) {
            this.player.velocity.y = -PLAYER_JUMP;
            this.player.grounded = false;
            this.player.isJumping = false;
        }

        // Move on input
        if (this.pointer && this.player.grounded) {
            if (Math.abs(this.pointer.x - this.player.position.x) > PLAYER_SMALLEST_MOVE_DELTA) {
                this.player.velocity.x =
                    (PLAYER_ACCN * (PLAYER_SPEED * Math.sign(this.pointer.x - this.player.position.x))) +
                    ((1 - PLAYER_ACCN) * (this.player.velocity.x));
            }
        }

        // Slow down on the ground or walls
        if (this.player.grounded) {
            this.player.velocity.x *= PLAYER_ACCN; // This needs to be an equation based on frameDuration
        }
        if (this.player.sliding) {
            this.player.velocity.y *= PLAYER_ACCN;
        }

        // Perform physics
        this.player.velocity.y += (GRAVITY * frameDuration);
        this.player.position.x += this.player.velocity.x;
        this.player.position.y += this.player.velocity.y;

        // Calculate collisions
        // floor
        if (this.player.position.y + PLAYER_RADIUS > FLOOR_HEIGHT) {
            this.player.velocity.y = 0;
            this.player.position.y = FLOOR_HEIGHT - PLAYER_RADIUS;
            this.player.grounded = true;
        }
        // walls
        if (this.player.position.x <= 0 + PLAYER_RADIUS) {
            this.player.velocity.x = 0;
            this.player.position.x = 0 + PLAYER_RADIUS;
            this.player.sliding = true;
        } else if (this.player.position.x >= CANVAS_WIDTH - PLAYER_RADIUS) {
            this.player.velocity.x = 0;
            this.player.position.x = CANVAS_WIDTH - PLAYER_RADIUS;
            this.player.sliding = true;
        } else {
            this.player.sliding = false;
        }

        // Calculate sword position
        this.player.swordTip = this.getSwordTip(this.player, this.pointer, frameDuration);

        // Hit detection
        if (this.player.swordTip) {
            Object.entries(this.enemies)
                .forEach(([playerId, enemy]) => {
                    if (
                        this.player.swordTip!.x > enemy.position.x - PLAYER_RADIUS &&
                        this.player.swordTip!.x < enemy.position.x + PLAYER_RADIUS &&
                        this.player.swordTip!.y > enemy.position.y - PLAYER_RADIUS &&
                        this.player.swordTip!.y < enemy.position.y + PLAYER_RADIUS
                    ) {
                        socket.emit('hit', playerId);
                        this.onHit(playerId);
                    }
                });
        }

        //Draw
        this.drawBackground(ctx);
        Object.entries(this.enemies)
            .forEach(([_id, player]) => {
                this.drawPlayer(ctx, player);
            });
        this.drawPlayer(ctx, this.player);

        // Update others
        socket.emit('player-state', { id: socket.id, state: this.player });
    };
}