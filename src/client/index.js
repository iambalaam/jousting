const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

let BG_COLOR;

const GRAVITY = 0.5;
const SPEED = 5;
const AIR_MANEUVERABILITY = 0.2;

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

    // Movement
    let xMovement = 0;
    if (keyDown(LEFT_ARROW) || keyDown('a')) xMovement -= SPEED;
    if (keyDown(RIGHT_ARROW) || keyDown('d')) xMovement += SPEED;
    if (player.touching.bottom || player.touching.left || player.touching.right) {
        // On a surface
        player.velocity.x = xMovement;
    } else {
        // In the air
        player.velocity.x = (AIR_MANEUVERABILITY * xMovement) + ((1 - AIR_MANEUVERABILITY) * player.velocity.x);
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