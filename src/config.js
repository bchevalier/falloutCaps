var VIEW_WIDTH = 320;
var VIEW_HEIGHT = Math.round(VIEW_WIDTH * 16 / 9);

// Grid dimensions is square
var GRID_TOP = VIEW_HEIGHT * 0.15;
var GRID_BOTTOM = GRID_TOP + VIEW_WIDTH * 1.1;

var AIMING_RANGE = 0.8 * Math.PI; // in radians

var NB_STARTING_LINES = 2;
var MAX_NB_BUBBLES_PER_LINE = 10;

var STARTING_LINE_DROP_INTERVAL = 5000;
var MIN_LINE_DROP_INTERVAL = 800;

// How much spaces the bubble occupies (as opposed to visual width and height dimensions)
// corresponds to both height and width
var BUBBLE_SPACE = VIEW_WIDTH / MAX_NB_BUBBLES_PER_LINE;

// Visual dimensions of a bubble
var BUBBLE_DIMENSION = BUBBLE_SPACE * 1.03;

// Physical dimensions of a bubble
var BUBBLE_COLLISION_DIMENSION = BUBBLE_SPACE * 0.8;

// Top half of bubbles on the top line are off-screen
var MAX_GRID_HEIGHT = (GRID_BOTTOM - GRID_TOP) - 0.5 * BUBBLE_SPACE;
var MAX_NB_LINES = Math.ceil(MAX_GRID_HEIGHT / BUBBLE_SPACE); // Above it's game over

// Readjusting grid dimensions to fit a multiple of a line height
MAX_GRID_HEIGHT = MAX_NB_LINES * BUBBLE_SPACE;
GRID_BOTTOM = GRID_TOP + MAX_GRID_HEIGHT - 0.5 * BUBBLE_SPACE;

var NB_BUBBLE_TYPES = 5;

var CANNON_X = VIEW_WIDTH / 2;
var CANNON_Y = GRID_BOTTOM + 70;

exports = {
  viewWidth: VIEW_WIDTH,
  viewHeight: VIEW_HEIGHT,
  viewCenterX: VIEW_WIDTH / 2,
  viewCenterY: VIEW_HEIGHT / 2,

  gridTop: GRID_TOP,
  gridBottom: GRID_BOTTOM,
  maxGridHeight: MAX_GRID_HEIGHT,
  nbBubblesPerLine: MAX_NB_BUBBLES_PER_LINE,
  maxNbLines: MAX_NB_LINES,
  nbStartingLines: NB_STARTING_LINES,

  nbAimingDots: 5,
  aimingDotsSpacing: 30,
  dotDimension: 8,
  minAimingAngle: -Math.PI / 2 - AIMING_RANGE / 2,
  maxAimingAngle: -Math.PI / 2 + AIMING_RANGE / 2,

  shootingSpeed: 20,

  startingLineDropInterval: STARTING_LINE_DROP_INTERVAL,
  minLineDropInterval: MIN_LINE_DROP_INTERVAL,

  cannonX: CANNON_X,
  cannonY: CANNON_Y,

  reserveX: CANNON_X - BUBBLE_SPACE,
  reserveY: CANNON_Y + BUBBLE_SPACE,

  swapSignX: CANNON_X - BUBBLE_SPACE * 0.2,
  swapSignY: CANNON_Y + BUBBLE_SPACE - BUBBLE_SPACE * 0.2,

  nbBubbleTypes: NB_BUBBLE_TYPES,
  bubbleImages: [
    'resources/images/caps/redCap.png',
    'resources/images/caps/greenCap.png',
    'resources/images/caps/blueCap.png',
    'resources/images/caps/yellowCap.png',
    'resources/images/caps/purpleCap.png'
  ],
  bubbleDimension: BUBBLE_DIMENSION,
  bubbleSpace: BUBBLE_SPACE,
  bubbleCollisionDimension: BUBBLE_COLLISION_DIMENSION
};