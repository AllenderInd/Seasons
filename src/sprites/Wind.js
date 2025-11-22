import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'
import MainPlayer from '../sprites/Player'

class Wind extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    // Initialize object basics
    super(game, x, y, 'Projectile_Sheet', 0)
    this.name = 'Wind'

    // turn off smoothing (this is pixel art)
    this.smoothed = true

    // Set a reference to the top-level phaser game object
    this.game = game

    // Setup all the animations
    //this.setupAnimations()
    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = 0.6
    // Initialize the scale of this sprite
    this.scale.setTo(this._SCALE)

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = false
    this.body.fixedRotation = true
    this.game.physics.p2.applyGravity = false // turn off gravity

    // Create a custom shape for the collider body
    this.body.setRectangle(100, 120, 0, -90)
    this.body.offset.setTo(0, 0)

    // Configure custom physics properties
    this.body.damping = 0.5
    this.anchor.setTo(0.5, 1.0)
    // this.body.mass = 10000

    this.body.kinematic = true

    this.x_pos = 0
    this.y_pos = 0

    this.setupanimations()

    this.play = false
  }

  setupanimations(){
    this.animations.add('up', [0,1,2,3,4], 10, false)
    this.animations.add('up_still', [4], 10, false)
  }

  // Function that runs every tick to update this sprite
  update () {
    // Always give parent a chance to update
    super.update()
    this.body.velocity.x = 0
    this.body.velocity.y = 0

    if(this.x_pos == 0 && this.y_pos == -1) this.angle = 0
    else if(this.x_pos == 0 && this.y_pos == 1) this.angle = 180
    else if(this.x_pos == 1 && this.y_pos == 0) this.angle = 90
    else if(this.x_pos == -1 && this.y_pos == 0) this.angle = -90
    else if(this.x_pos == 1 && this.y_pos == 1) this.angle = 135
    else if(this.x_pos == -1 && this.y_pos == 1) this.angle = -135
    else if(this.x_pos == 1 && this.y_pos == -1) this.angle = 45
    else if(this.x_pos == -1 && this.y_pos == -1) this.angle = -45

    this.body.rotation = (Math.PI / 180) * this.angle
  }

  //Function called when touching something pushable
  push(body1, body2)
  {
    //Tell the object it is being pushed
    body2.sprite.pushed = true
    //Set the direction the object is being pushed in
    body2.sprite.push_x = body1.sprite.x_pos
    body2.sprite.push_y = body1.sprite.y_pos
    //Reset the timer for how long it can be pushed
    body2.sprite.pushTimer = 0
  }
}

// Expose the MainPlayer class to other files
export default Wind
