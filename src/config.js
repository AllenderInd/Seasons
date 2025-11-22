/**
 * config.js: Global configuration details meant to be used in files throughout
 * your game. Values included here should be ones that help you tweek your game
 * or avoid writing constants more than once.
 * 
 * THESE VALUES SHOULD BE TREATED AS CONSTANT/READ ONLY!!
 * If you need to change their values during run-time then they don't belong here.
 */

export default {
  gameWidth: 1353, // The width of the game viewport in the browser
  gameHeight: 900, // The height of the game viewport in the browser
  localStorageName: 'stoutGDD325', // Prefix for cookie & session storage
  
  // List of webfonts you want to load
  webfonts: ['Libre Franklin'],

  // Sound and music settings
  MUSIC_VOLUME: 0.1,
  SFX_VOLUME: 0.2,
  SWITCH_SFX: 0.5,

  // Minimum time to display the splash screen
  MIN_SPLASH_SECONDS: 2,

  // Time before playing the idle animation
  IDLE_COUNTDOWN: 200,

  // Values for tweeking the player character behaviors
  PLAYER_SCALE: 0.75,
  ALEX_SCALE: 0.2,
  PLAYER_MASS: 5,
  JUMP_INITIAL: -400,
  JUMP_TIME: 0.4,
  GRAVITY_CONSTANT: 1000,

  // Enemy Values for scaling
  BASIC_ENEMY_SCALE: 1.5,
  UBER_ENEMY_SCALE: 1.5,
  WALL_ENEMY_SCALE: 1.5
}
