const socket = io();

let floor;
let player;
let prevSwordAngle;
let playerColor;
let enemy;

const GAME_STATE = {
    WAITING: 'WAITING',
    GAMEPLAY: 'GAMEPLAY',
    WON: 'WON',
    LOST: 'LOST'
}
let state = GAME_STATE.WAITING;

socket.on('initialise', (color) => {
    playerColor = color;
    setupGame(color);
    state = GAME_STATE.GAMEPLAY;
});

socket.on('hit', (hit) => {
    background(200, 200, 200);
    player.position = hit.enemy.position;
    player.swordTip = hit.enemy.swordTip;
    player.shapeColor = 'red';
    enemy.position = hit.player.position;
    enemy.swordTip = hit.player.swordTip;
    stroke(255);
    line(
        enemy.position.x, enemy.position.y,
        enemy.swordTip.x, enemy.swordTip.y
    );
    drawSprites();
    drawTopLeft(playerColor);
    drawTitle('You lose!');
    drawSubtitle('refresh the page for rematch');
    state = GAME_STATE.LOST;
});

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

let BG_COLOR;

const PLAYER_DIAMETER = 15;
const PLAYER_RADIUS = PLAYER_DIAMETER / 2;
const GRAVITY = 0.2;
const MAX_VAULT = 10;
const ACCELERATION = 0.3;
const MAX_SPEED = 6;
const AIR_MANEUVERABILITY = 0.2;
const SWORD_LENGTH = 20;
const FLOOR_HEIGHT = 100;

const sendPlayerState = (player) => {
    const { position, velocity } = player;
    socket.emit('player-state', {
        position: { x: position.x, y: position.y },
        velocity: { x: velocity.x, y: velocity.y },
        swordTip: player.swordTip
    });
}

function setup() {
    BG_COLOR = color(89, 124, 66);
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    floor = createSprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT - FLOOR_HEIGHT / 2, CANVAS_WIDTH, FLOOR_HEIGHT);
    floor.shapeColor = BG_COLOR;
}

const setupGame = (color) => {
    const initialPlayerX = color === 'blue' ? CANVAS_WIDTH / 5 : 4 * CANVAS_WIDTH / 5
    const initialEnemyX = color === 'blue' ? 4 * CANVAS_WIDTH / 5 : CANVAS_WIDTH / 5

    player = createSprite(initialPlayerX, CANVAS_HEIGHT - FLOOR_HEIGHT - 100, PLAYER_DIAMETER, PLAYER_DIAMETER);
    player.shapeColor = color;

    enemy = createSprite(initialEnemyX, CANVAS_HEIGHT - FLOOR_HEIGHT - 100, PLAYER_DIAMETER, PLAYER_DIAMETER);
    enemy.shapeColor = color === 'blue' ? 'orange' : 'blue';

    socket.on('player-state', ({ position, swordTip }) => {
        enemy.position = position;
        enemy.swordTip = swordTip;
        enemy.update();
    });
}

function draw() {
    switch (state) {
        case GAME_STATE.WAITING:
            waiting();
            break;
        case GAME_STATE.GAMEPLAY:
            gameplay();
            break;
        case GAME_STATE.WON:
        case GAME_STATE.LOST:
            break;
    }
}

const drawTitle = (s) => {
    strokeWeight(0);
    textAlign(CENTER);
    textSize(32);
    text(s, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}
const drawSubtitle = (s) => {
    strokeWeight(0);
    textAlign(CENTER);
    textSize(24);
    text(s, CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 40);
}
const drawTopLeft = (color) => {
    strokeWeight(0);
    textAlign(LEFT);
    textSize(24);
    fill(color);
    text(color, 30, 30)
}

const waiting = () => {
    strokeWeight(0);
    background(200, 200, 200);
    drawTitle('Waiting for another player.');
    drawSprites();
}

const angleBetweenPoints = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => {
    return x2 > x1
        ? Math.atan((y2 - y1) / (x1 - x2))
        : Math.atan((y2 - y1) / (x1 - x2)) + Math.PI;
}

const gameplay = () => {
    // repaint next frame
    background(200, 200, 200);

    // Gravity
    player.velocity.y += GRAVITY;

    // Pointer
    let pointer;
    if (mouseIsPressed) {
        pointer = { x: mouseX, y: mouseY }
    } else if (touches.length) {
        pointer = { x: touches[0].x, y: touches[0].y }
    }

    // Sword
    if (pointer) {
        const vel = Math.hypot(player.velocity.x, player.velocity.y);

        const swordLength = Math.sqrt(vel) * SWORD_LENGTH;
        const angle = angleBetweenPoints(player.position, { x: mouseX, y: mouseY });
        player.swordTip = {
            x: swordLength * Math.cos(angle) + player.position.x,
            y: - swordLength * Math.sin(angle) + player.position.y
        }
        stroke(255);
        strokeWeight(1.5);
        line(
            player.position.x, player.position.y,
            player.swordTip.x, player.swordTip.y,
        );
    } else {
        player.swordTip = undefined;
    }

    // Enemy Sword
    if (enemy.swordTip) {
        stroke(255);
        strokeWeight(1.5);
        line(
            enemy.position.x, enemy.position.y,
            enemy.swordTip.x, enemy.swordTip.y
        )
    }

    // Movement
    const playerIsOnTheGround = (player.position.y + 1 + PLAYER_RADIUS) >= (CANVAS_HEIGHT - FLOOR_HEIGHT)
    const swordIsInTheGround = player.swordTip && player.swordTip.y + 1 >= (CANVAS_HEIGHT - FLOOR_HEIGHT)
    if (playerIsOnTheGround && pointer && !swordIsInTheGround) {
        // On the Ground
        if (pointer.x < player.position.x) {
            player.velocity.x = Math.max(-MAX_SPEED, player.velocity.x - ACCELERATION);
        } else {
            player.velocity.x = Math.min(MAX_SPEED, player.velocity.x + ACCELERATION)
        }
    } else if (playerIsOnTheGround && !pointer) {
        player.velocity.x *= 0.8;
    } else if (!playerIsOnTheGround && swordIsInTheGround) {
        player.velocity.x *= 0.8;
    }

    // Vault
    if (pointer && player.swordTip) {
        if (player.swordTip.y > (CANVAS_HEIGHT - FLOOR_HEIGHT)) {
            player.setVelocity(
                player.velocity.x,
                Math.max(-MAX_VAULT, 1.1 * ((CANVAS_HEIGHT - FLOOR_HEIGHT) - player.swordTip.y))
            );
        }
    }

    // Collisions
    player.collide(floor, (player, _floor) => {
        player.velocity.y = 0;
    });

    if (player.position.x < PLAYER_RADIUS) {
        player.position.x = PLAYER_RADIUS;
        player.velocity.x = 0;
    };
    if (player.position.x > CANVAS_WIDTH - PLAYER_RADIUS) {
        player.position.x = CANVAS_WIDTH - PLAYER_RADIUS;
        player.velocity.x = 0;
    };

    if (
        player.swordTip &&
        player.swordTip.x > (enemy.position.x - PLAYER_RADIUS) &&
        player.swordTip.x < (enemy.position.x + PLAYER_RADIUS) &&
        player.swordTip.y < (enemy.position.y + PLAYER_RADIUS) &&
        player.swordTip.y > (enemy.position.y - PLAYER_RADIUS)
    ) {
        socket.emit('hit', {
            player: {
                position: {
                    x: player.position.x,
                    y: player.position.y
                },
                swordTip: player.swordTip
            },
            enemy: {
                position: {
                    x: enemy.position.x,
                    y: enemy.position.y
                },
                swordTip: enemy.swordTip
            }
        });
        state = GAME_STATE.WON;
        enemy.shapeColor = 'red';
        drawSprites();
        drawTopLeft(playerColor);
        drawTitle('You win!');
        drawSubtitle('refresh the page for rematch');
        return;
    }

    sendPlayerState(player);

    // Final draw 
    drawSprites();
    drawTopLeft(player.shapeColor);
}