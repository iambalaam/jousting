const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

let BG_COLOR;

const GRAVITY = 0.5;
const ACCELERATION = 0.3;
const MAX_SPEED = 6;
const AIR_MANEUVERABILITY = 0.2;
const SWORD_LENGTH = 5;

let floor;
let player;
function setup() {
    BG_COLOR = color(89, 124, 66);
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    floor = createSprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT + 50, CANVAS_WIDTH, 120);
    floor.shapeColor = BG_COLOR;

    player = createSprite(CANVAS_WIDTH / 5, CANVAS_HEIGHT - 30, 10, 10);
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

    // Movement
    if (pointer) {
        if (pointer.x < player.position.x) {
            player.velocity.x = Math.max(-MAX_SPEED, player.velocity.x - ACCELERATION);
        } else {
            player.velocity.x = Math.min(MAX_SPEED, player.velocity.x + ACCELERATION)
        }
    } else {
        player.velocity.x *= 0.8;
    }

    // Sword
    if (pointer) {
        const vel = Math.hypot(player.velocity.x, player.velocity.y);
        const angle = mouseX > player.position.x
            ? Math.atan((player.position.y - mouseY) / (mouseX - player.position.x))
            : Math.atan((player.position.y - mouseY) / (mouseX - player.position.x)) + Math.PI;
        stroke(255);
        strokeWeight(1);
        line(
            player.position.x, player.position.y,
            vel * SWORD_LENGTH * Math.cos(angle) + player.position.x, -vel * SWORD_LENGTH * Math.sin(angle) + player.position.y,
        );
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
    floor.debug = mouseIsPressed;
    player.debug = mouseIsPressed;
}