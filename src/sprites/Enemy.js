/* globals __DEV__ */
// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import needed functions from utils and config settings
// import { sequentialNumArray } from '../utils.js'
import config from '../config'

class BaseEnemy extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    // Initialize object basics
    super(game, x, y, 'enemy-base', 50)
    this.name = 'Base Enemy'

    // turn off smoothing (this is pixel art)
    this.smoothed = false

    // Set a reference to the top-level phaser game object
    this.game = game

    // Setup all the animations
    // this.setupAnimations()

    // All variabes that start with '_' are meant to be private
    // Initial state is 'unknown' as nothing has happened yet
    // this._move_state = BaseEnemy.moveStates.UNKNOWN

    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = config.PLAYER_SCALE
    // this._idle_countdown = config.IDLE_COUNTDOWN

    // Initialize the scale of this sprite
    // this.scale.setTo(20, 20)
    this.scale.setTo(this._SCALE)

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = false
    this.body.fixedRotation = true
    // Create a custom shape for the collider body
    this.body.setRectangle(40, 120, 0, 35)
    // this.body.offset.setTo(0, -15)
  }
}
export default BaseEnemy
