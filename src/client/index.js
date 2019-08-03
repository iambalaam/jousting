const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

let BG_COLOR;

const PLAYER_SIZE = 10;
const GRAVITY = 0.5;
const ACCELERATION = 0.3;
const MAX_SPEED = 6;
const AIR_MANEUVERABILITY = 0.2;
const SWORD_LENGTH = 10;
const FLOOR_HEIGHT = 100

let floor;
let player;
function setup() {
    BG_COLOR = color(89, 124, 66);
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    floor = createSprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT - FLOOR_HEIGHT / 2, CANVAS_WIDTH, FLOOR_HEIGHT);
    floor.shapeColor = BG_COLOR;

    player = createSprite(CANVAS_WIDTH / 5, CANVAS_HEIGHT - FLOOR_HEIGHT - 20, PLAYER_SIZE, PLAYER_SIZE);
    player.shapeColor = color(10, 10, 10);
}

function draw() {
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
    let swordTip;
    if (pointer) {
        const vel = Math.hypot(player.velocity.x, player.velocity.y);
        const swordLength = Math.sqrt(vel) * SWORD_LENGTH;
        const angle = mouseX > player.position.x
            ? Math.atan((player.position.y - mouseY) / (mouseX - player.position.x))
            : Math.atan((player.position.y - mouseY) / (mouseX - player.position.x)) + Math.PI;
        swordTip = {
            x: swordLength * Math.cos(angle) + player.position.x,
            y: - swordLength * Math.sin(angle) + player.position.y
        }
        stroke(255);
        strokeWeight(1);
        line(
            player.position.x, player.position.y,
            swordTip.x, swordTip.y,
        );
    }

    // Movement
    const playerIsOnTheGround = (player.position.y + 1 + PLAYER_SIZE / 2) >= (CANVAS_HEIGHT - FLOOR_HEIGHT)
    const swordIsInTheGround = swordTip && swordTip.y + 1 >= (CANVAS_HEIGHT - FLOOR_HEIGHT)
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
    if (pointer && swordTip) {
        if (swordTip.y > (CANVAS_HEIGHT - FLOOR_HEIGHT)) {
            player.setVelocity(player.velocity.x, 1.1 * ((CANVAS_HEIGHT - FLOOR_HEIGHT) - swordTip.y));
        }
    }


    // colissions
    player.collide(floor, (player, _floor) => {
        if (player.touching.left || player.touching.right) {
            // Sliding on surface
            player.velocity.y = Math.atan(player.velocity.y);

            player.velocity.x = 0;
        } else {
            if (player.touching.bottom) {
            }
            player.velocity.y = 0;
        }
    });

    // final draw 
    drawSprites();
}