import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'

class WallEnemy extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    // Initialize object basics
    super(game, x, y, 'Enemy_Wall_Sheet', 0)
    this.name = 'Basic Enemy'

    // turn off smoothing (this is pixel art)
    this.smoothed = true

    // Set a reference to the top-level phaser game object
    this.game = game

    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = 0.8
    this._idle_countdown = config.IDLE_COUNTDOWN
    // Initialize the scale of this sprite
    this.scale.setTo(this._SCALE)

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = false
    this.body.fixedRotation = true
    this.game.physics.p2.applyGravity = false // turn off gravity

    // Create a custom shape for the collider body
    this.body.setRectangle(200, 300, 0, 0)
    this.body.offset.setTo(0, 250)

    // Configure custom physics properties
    this.body.damping = 0.5
    this.anchor.setTo(0.5, 1.0)
    this.body.mass = 1

    this.wanderTimer = 0
    this.wanderAngle = this.game.rnd.integer()

    this.pushed = false
    this.push_x = 0
    this.push_y = 0
    this.pushTimer = 0

    this.frozen = false
    this.frozenTimer = 0

    this.original_x = this.body.x
    this.original_y = this.body.y

    this.second_x = this.body.x + 300
    this.second_y = this.body.y
    //true = right
    //false = left
    this.direct = true

    this.setupAnimations()
    this._move_state = WallEnemy.moveStates.UNKNOWN
  }

  get moveState () { return this._move_state }
  set moveState (newState) {
    if (this._move_state !== newState) {
      // Update the state
      this._move_state = newState
      this.updateAnimation()
    }
  }

  // Function that runs every tick to update this sprite
  update () {
    // Always give parent a chance to update
    super.update()
  }

  setupAnimations(){
    this.animations.add('idle', [0,1,2,3,4,5], 10, true)
    this.animations.add('walk', [6,7,8,9,10,11,12,13,14,15,16,17,18,19], 10, true)
    this.animations.add('frozen', [20], 10, true)
  }

  updateAnimation()
  {
    switch (this._move_state) {
      case WallEnemy.moveStates.IDLE:
        this.animations.play('idle')
        this.game.sounds.stop('rock_door_slide_block_move_drag_loop1')
        break

      case WallEnemy.moveStates.WALK:
        this.animations.play('walk')
        this.game.sounds.play('rock_door_slide_block_move_drag_loop1', 0.075)
        break

      case WallEnemy.moveStates.FROZEN:
        this.animations.play('frozen')
        break
    }
  }

  moveWall() {
    this.body.mass = 100
    //Find distance between original position and enemy
    var dist = Math.sqrt(Math.pow(this.original_y - this.body.y,2) + Math.pow(this.original_x - this.body.x,2))
    if(this.pushed)
    {
      this.body.velocity.x = this.push_x * 200
      this.body.velocity.y = this.push_y * 200
      this.pushTimer += 1
      if(this.pushTimer > 75)
      {
        this.pushed = false
      }
    }
    else if(this.frozen)
    {
      this.body.velocity.x = 0
      this.body.velocity.y = 0
      this.frozenTimer += 1
      if(this.frozenTimer > 150)
      {
        this.frozen = false
      }
      this.moveState = WallEnemy.moveStates.FROZEN
    }
    else if(dist > 10)
    {
      var angle = Math.atan2(this.original_y - this.body.y, this.original_x - this.body.x)
      this.body.velocity.x = Math.cos(angle) * 50
      this.body.velocity.y = Math.sin(angle) * 50
      this.moveState = WallEnemy.moveStates.WALK
     
    }
    //If in position, dont move and fire at the player
    else
    {
      this.body.velocity.x = 0
      this.body.velocity.y = 0
      this.moveState = WallEnemy.moveStates.IDLE
    }
  }
}

WallEnemy.moveStates = Object.freeze({
  UNKOWN: 'unknown',
  IDLE: 'idle',
  WALK: 'walk',
  FROZEN: 'frozen'
})

export default WallEnemy
