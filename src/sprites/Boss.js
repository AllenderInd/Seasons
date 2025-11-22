import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'
import MainPlayer from '../sprites/Player'

class Boss extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    // Initialize object basics
    super(game, x, y, 'enemy_test', 0)
    this.name = 'Boss'

    // turn off smoothing (this is pixel art)
    this.smoothed = true

    // Set a reference to the top-level phaser game object
    this.game = game

    this._SCALE = 0.5
    // Initialize the scale of this sprite
    this.scale.setTo(this._SCALE)

    //this.scale.y = 0.3

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = false
    this.body.fixedRotation = true
    this.game.physics.p2.applyGravity = false // turn off gravity

    // Create a custom shape for the collider body
    this.body.setRectangle(20, 20, 0, -74)
    this.body.offset.setTo(0, 0)

    // Configure custom physics properties
    this.body.damping = 0.5
    this.anchor.setTo(0.5, 1.0)
    // this.body.mass = 10000

    this.body.kinematic = true
  }

  retrieveBounds()
  {
    let bounds = this.getBounds()
    bounds.width -= 80
    bounds.x += 40
    bounds.height -= 20
    bounds.y += 10
    return bounds
  }

}

// Expose the MainPlayer class to other files
export default Boss
