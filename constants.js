// Game state constants
const NEW = 'new';
const RUNNING = 'running';
const UPDATING = "updating";
const PAUSED = 'paused';
const ENDING = 'ending';
const ENDED = 'ended';
const GAME_STATES = {
  NEW, RUNNING, UPDATING, PAUSED, ENDING, ENDED,
};

// Stack state constants
const UNCHANGED = 'unchanged';
const CHANGED = 'changed';
const NOT_UPDATABLE = 'not updatable';
const STACK_STATES = { UNCHANGED, CHANGED, NOT_UPDATABLE };

// Side constants
const LEFT = 'left';
const RIGHT = 'right';
const UP = 'up';
const DOWN = 'down';
const SIDES = {
  LEFT, RIGHT, UP, DOWN,
};

// Turn constants
const CLOCKWISE_TURN = 'clockwise turn';
const COUNTERCLOCKWISE_TURN = 'counter-clockwise turn';
const TURNS = { CLOCKWISE_TURN, COUNTERCLOCKWISE_TURN };

// Sound constants
const BACKGROUND_MUSIC = new Audio('resources/static/sounds/TwisterTetris_poinl.mp3');

const SOUNDS = { BACKGROUND_MUSIC };

export {
  GAME_STATES, STACK_STATES, SIDES, TURNS, SOUNDS,
};
