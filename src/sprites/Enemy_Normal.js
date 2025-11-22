import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

class NormalEnemy extends Phaser.Sprite {
  constructor ({ game, x, y, parentLevel }) {
    // Initialize object basics
    super(game, x, y, 'Enemy_Basic_Sheet', 0)
    this.name = 'Basic Enemy'

    // Set parent level
    this.theLevel = parentLevel

    // turn on smoothing
    this.smoothed = true

    // Set a reference to the top-level phaser game object
    this.game = game

    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = 0.6
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
    this.body.setRectangle(80, 100, 0, 0)
    this.body.offset.setTo(0, 90)

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

    // setup player alert variable
    this.PlayerAlert = false
    this.LostPlayer = false

    this.attack = false
    this.attackTimer = 0
    this.attackAngle = 0

    this.setupAnimations()

    this._move_state = NormalEnemy.moveStates.UNKNOWN
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

  setupAnimations() {
    this.animations.add('walk_down', [0,1,2,3,4,5,6,7], 10, true)
    this.animations.add('walk_right', [8,9,10,11,12], 10, true)
    this.animations.add('walk_up', [13,14,15,16,17], 10, true)
    this.animations.add('attack_down', [18,19,20,21,18], 10, false)
    this.animations.add('attack_right', [22,23,24,25], 10, false)
    this.animations.add('attack_up', [26,27,28,29], 10, false)
    this.animations.add('idle_down', [30,31,32,33], 7, true)
    this.animations.add('idle_up', [34,35,36,37], 7, true)
    this.animations.add('idle_right', [38,39,40,41], 7, true)
    this.animations.add('frozen_down', [42], 10, true)
    this.animations.add('frozen_up', [43], 10, true)
    this.animations.add('frozen_right', [44], 10, true)
  }

  updateAnimation () {
    // Look at the current movement state and adjust the animation accordingly
    switch (this._move_state) {
      case NormalEnemy.moveStates.WALKING_DOWN:
        if (__DEV__) console.info('Playing "walk_down"')
        this.animations.play('walk_down')
        break

      case NormalEnemy.moveStates.WALKING_RIGHT:
        if (__DEV__) console.info('Playing "walk_right"')
        this.animations.play('walk_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.WALKING_LEFT:
        if (__DEV__) console.info('Playing "walk_left"')
        this.animations.play('walk_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.WALKING_UP:
        if (__DEV__) console.info('Playing "walk_up"')
        this.animations.play('walk_up')
        break

      case NormalEnemy.moveStates.IDLE_DOWN:
        this.animations.play('idle_down')
        break

      case NormalEnemy.moveStates.IDLE_RIGHT:
        this.animations.play('idle_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.IDLE_LEFT:
        this.animations.play('idle_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.IDLE_UP:
        this.animations.play('idle_up')
        break

      case NormalEnemy.moveStates.FROZEN_UP:
        this.animations.play('frozen_up')
        break

      case NormalEnemy.moveStates.FROZEN_DOWN:
        this.animations.play('frozen_down')
        break

      case NormalEnemy.moveStates.FROZEN_RIGHT:
        this.animations.play('frozen_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.FROZEN_LEFT:
        this.animations.play('frozen_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.ATTACK_LEFT:
        this.animations.play('attack_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.ATTACK_RIGHT:
        this.animations.play('attack_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case NormalEnemy.moveStates.ATTACK_DOWN:
        this.animations.play('attack_down')
        break

      case NormalEnemy.moveStates.ATTACK_UP:
        this.animations.play('attack_up')
        break
    }
  }

  // Function for base enemy
  moveToPlayer (thePlayer) {
    // Detect the distance between the player and the enemy
    var dist = Math.sqrt(Math.pow((thePlayer.y - 50) - this.y,2) + Math.pow(thePlayer.x - this.x,2))
    // Dont move if being pushed by wind
    if (this.pushed)
    {
      this.body.velocity.x = this.push_x * 200
      this.body.velocity.y = this.push_y * 200
      this.pushTimer += 1
      if (this.pushTimer > 75)
      {
        this.pushed = false
      }
      this.attack = false
      this.attackTimer = 0
    }
    else if (this.frozen)
    {
      this.body.velocity.x = 0
      this.body.velocity.y = 0
      this.frozenTimer += 1
      if (this.frozenTimer > 150)
      {
        this.frozen = false
      }
      this.attack = false
      this.attackTimer = 0
    }
    else if(this.attack)
    {
      this.attackTimer += 1

      this.body.velocity.x = 0
      this.body.velocity.y = 0

      if(this.attackTimer > 100)
      {
        this.attack = false
        this.attackTimer = 0

        switch(this._move_state)
        {
          case NormalEnemy.moveStates.IDLE_UP:
            this.body.y += 20
            break

          case NormalEnemy.moveStates.IDLE_DOWN:
            this.body.y -= 20
            break

          case NormalEnemy.moveStates.IDLE_LEFT:
            this.body.x += 20
            break

          case NormalEnemy.moveStates.IDLE_RIGHT:
            this.body.x -= 20
            break
        }
      }
    }
    // Don't move if the player is too far away
    else if (dist > 500 || thePlayer.invisible)
    {
      this.PlayerAlert = false
      this.LostPlayer = false
      this.wanderTimer += 1
      if (this.wanderTimer > 120 && this.wanderTimer < 180)
      {
        this.body.velocity.x = Math.cos(this.wanderAngle) * 75
        this.body.velocity.y = Math.sin(this.wanderAngle) * 75
      }
      else if (this.wanderTimer > 180)
      {
        this.wanderAngle = this.game.rnd.integer()
        this.wanderTimer = 0
      }
      else
      {
        this.body.velocity.x = 0
        this.body.velocity.y = 0
      }
    }
    // Move towards the player
    else
    {
      this.PlayerAlert = true
      var angle = Math.atan2((thePlayer.y - 50) - this.y, thePlayer.x - this.x)
      this.body.velocity.x = Math.cos(angle) * 125
      this.body.velocity.y = Math.sin(angle) * 125
      this.attackAngle = angle
    }

    // Change Animations
    if(this.frozen)
    {
      switch(this._move_state)
      {
        case NormalEnemy.moveStates.WALKING_UP:
          this.moveState = NormalEnemy.moveStates.FROZEN_UP
          break

        case NormalEnemy.moveStates.WALKING_DOWN:
          this.moveState = NormalEnemy.moveStates.FROZEN_DOWN
          break

        case NormalEnemy.moveStates.WALKING_LEFT:
          this.moveState = NormalEnemy.moveStates.FROZEN_LEFT
          break

        case NormalEnemy.moveStates.WALKING_RIGHT:
          this.moveState = NormalEnemy.moveStates.FROZEN_RIGHT
          break

        case NormalEnemy.moveStates.IDLE_UP:
          this.moveState = NormalEnemy.moveStates.FROZEN_UP
          break

        case NormalEnemy.moveStates.IDLE_DOWN:
          this.moveState = NormalEnemy.moveStates.FROZEN_DOWN
          break

        case NormalEnemy.moveStates.IDLE_LEFT:
          this.moveState = NormalEnemy.moveStates.FROZEN_LEFT
          break

        case NormalEnemy.moveStates.IDLE_RIGHT:
          this.moveState = NormalEnemy.moveStates.FROZEN_RIGHT
          break
      }
    }
    else if(this.attack && this.attackTimer < 30)
    {
      switch(this._move_state)
      {
        case NormalEnemy.moveStates.WALKING_UP:
          this.moveState = NormalEnemy.moveStates.ATTACK_UP
          break

        case NormalEnemy.moveStates.WALKING_DOWN:
          this.moveState = NormalEnemy.moveStates.ATTACK_DOWN
          break

        case NormalEnemy.moveStates.WALKING_LEFT:
          this.moveState = NormalEnemy.moveStates.ATTACK_LEFT
          break

        case NormalEnemy.moveStates.WALKING_RIGHT:
          this.moveState = NormalEnemy.moveStates.ATTACK_RIGHT
          break

        case NormalEnemy.moveStates.IDLE_UP:
          this.moveState = NormalEnemy.moveStates.ATTACK_UP
          break

        case NormalEnemy.moveStates.IDLE_DOWN:
          this.moveState = NormalEnemy.moveStates.ATTACK_DOWN
          break

        case NormalEnemy.moveStates.IDLE_LEFT:
          this.moveState = NormalEnemy.moveStates.ATTACK_LEFT
          break

        case NormalEnemy.moveStates.IDLE_RIGHT:
          this.moveState = NormalEnemy.moveStates.ATTACK_RIGHT
          break
      }
    }
    else if((this.body.velocity.x == 0 && this.body.velocity.y == 0) || this.pushed)
    {
      switch(this._move_state)
      {
        case NormalEnemy.moveStates.WALKING_UP:
          this.moveState = NormalEnemy.moveStates.IDLE_UP
          break

        case NormalEnemy.moveStates.WALKING_DOWN:
          this.moveState = NormalEnemy.moveStates.IDLE_DOWN
          break

        case NormalEnemy.moveStates.WALKING_LEFT:
          this.moveState = NormalEnemy.moveStates.IDLE_LEFT
          break

        case NormalEnemy.moveStates.WALKING_RIGHT:
          this.moveState = NormalEnemy.moveStates.IDLE_RIGHT
          break

        case NormalEnemy.moveStates.ATTACK_UP:
          this.moveState = NormalEnemy.moveStates.IDLE_UP
          break

        case NormalEnemy.moveStates.ATTACK_DOWN:
          this.moveState = NormalEnemy.moveStates.IDLE_DOWN
          break

        case NormalEnemy.moveStates.ATTACK_LEFT:
          this.moveState = NormalEnemy.moveStates.IDLE_LEFT
          break

        case NormalEnemy.moveStates.ATTACK_RIGHT:
          this.moveState = NormalEnemy.moveStates.IDLE_RIGHT
          break
      }
    }
    else if(Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y))
    {
      if(this.body.velocity.x < 0)
      {
        this.moveState = NormalEnemy.moveStates.WALKING_LEFT
      }
      else{
        this.moveState = NormalEnemy.moveStates.WALKING_RIGHT
      }
    }
    else
    {
      if(this.body.velocity.y < 0)
      {
        this.moveState = NormalEnemy.moveStates.WALKING_UP
      }
      else{
        this.moveState = NormalEnemy.moveStates.WALKING_DOWN
      }
    }
    // if enemy sees player play alert sound
    if (this.PlayerAlert == true) {
      if (this.LostPlayer == false) {
        this.LostPlayer = true
        this.game.sounds.play('PP_Monster_Alert_1_2', config.SFX_VOLUME)
      }
    }
  }
 
  attackTest (body1, body2) {
    if (!body1.sprite.attack && !body1.sprite.frozen && !body1.sprite.pushed)
    {
      if (!body1.sprite.theLevel.invulerable && !body2.sprite.invisible)
      {
        body1.sprite.attack = true
        body1.sprite.attackTimer = 0
        body2.sprite.damage(1)
        body1.sprite.theLevel.invulnerable = true
        body1.sprite.theLevel.invulnerable_countdown = 120
        //console.log("health " + body2.sprite.health)
        body2.sprite.theLevel.game.camera.shake(0.007, 100)
      }
    }
  }
}


NormalEnemy.moveStates = Object.freeze({
  UNKNOWN: 'unknown',
  WALKING_UP: 'walk_up',
  WALKING_LEFT: 'walk_left',
  WALKING_RIGHT: 'walk_right',
  WALKING_DOWN: 'walk_down',
  IDLE_UP: 'idle_up',
  IDLE_LEFT: 'idle_left',
  IDLE_RIGHT: 'idle_right',
  IDLE_DOWN: 'idle_down',
  ATTACK_UP: 'attack_up',
  ATTACK_LEFT: 'attack_left',
  ATTACK_RIGHT: 'attack_right',
  ATTACK_DOWN: 'attack_down',
  FROZEN_UP: 'frozen_up',
  FROZEN_LEFT: 'frozen_left',
  FROZEN_RIGHT: 'frozen_right',
  FROZEN_DOWN: 'frozen_down'
})

export default NormalEnemy
