import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'

import Projectile from '../sprites/Enemy_Projectile'

class ShootEnemy extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    // Initialize object basics
    super(game, x, y, 'Enemy_Shoot_Sheet', 0)
    this.name = 'Basic Enemy'

    // turn off smoothing (this is pixel art)
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
    this.body.offset.setTo(0, 80)

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

    this.shootTimer = 0

    this.PlayerAlert = false
    this.LostPlayer = false

    this.setupAnimations()
    this._move_state = ShootEnemy.moveStates.UNKNOWN
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

  setupAnimations()
  {
    this.animations.add('idle_down', [0,1,2,3], 10, true)
    this.animations.add('idle_up', [4,5,6,7], 10, true)
    this.animations.add('idle_right', [8,9,10,11], 10, true)
    this.animations.add('attack_down', [12,13,14], 10, false)
    this.animations.add('attack_up', [15,16,17], 10, false)
    this.animations.add('attack_right', [18,19,20], 10, false)
    this.animations.add('frozen_down',[21], 10, true)
    this.animations.add('frozen_up', [22], 10, true)
    this.animations.add('frozen_right', [23], 10, true)
  }

  updateAnimation()
  {
    switch (this._move_state) {
      case ShootEnemy.moveStates.IDLE_DOWN:
        this.animations.play('idle_down')
        break

      case ShootEnemy.moveStates.IDLE_UP:
        this.animations.play('idle_up')
        break

      case ShootEnemy.moveStates.IDLE_LEFT:
        this.animations.play('idle_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case ShootEnemy.moveStates.IDLE_RIGHT:
        this.animations.play('idle_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case ShootEnemy.moveStates.FROZEN_UP:
        this.animations.play('frozen_up')
        break

      case ShootEnemy.moveStates.FROZEN_DOWN:
        this.animations.play('frozen_down')
        break

      case ShootEnemy.moveStates.FROZEN_RIGHT:
        this.animations.play('frozen_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case ShootEnemy.moveStates.FROZEN_LEFT:
        this.animations.play('frozen_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case ShootEnemy.moveStates.ATTACK_DOWN:
        this.animations.play('attack_down')
        break

      case ShootEnemy.moveStates.ATTACK_UP:
        this.animations.play('attack_up')
        break

      case ShootEnemy.moveStates.ATTACK_RIGHT:
        this.animations.play('attack_right')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case ShootEnemy.moveStates.ATTACK_LEFT:
        this.animations.play('attack_right')
        this.scale.set(-this._SCALE, this._SCALE)
        break
    }
  }

  //Function for shooting enemy
  moveBack(thePlayer, thegame) {
    //Find distance between original position and enemy
    var dist = Math.sqrt(Math.pow(this.original_y - this.body.y,2) + Math.pow(this.original_x - this.body.x,2))
    //Don't move if being pushed
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
      switch(this._move_state)
      {
        case ShootEnemy.moveStates.IDLE_UP:
          this.moveState = ShootEnemy.moveStates.FROZEN_UP
          break

        case ShootEnemy.moveStates.IDLE_DOWN:
          this.moveState = ShootEnemy.moveStates.FROZEN_DOWN
          break

        case ShootEnemy.moveStates.IDLE_LEFT:
          this.moveState = ShootEnemy.moveStates.FROZEN_LEFT
          break

        case ShootEnemy.moveStates.IDLE_RIGHT:
          this.moveState = ShootEnemy.moveStates.FROZEN_RIGHT
          break
      }
    }
    //Move towards original position
    else if(dist > 10)
    {
      var angle = Math.atan2(this.original_y - this.body.y, this.original_x - this.body.x)
      this.body.velocity.x = Math.cos(angle) * 50
      this.body.velocity.y = Math.sin(angle) * 50
      if(Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle)))
      {
        if(Math.cos(angle) > 0)
        {
          this.moveState = ShootEnemy.moveStates.IDLE_RIGHT
        }
        else
        {
          this.moveState = ShootEnemy.moveStates.IDLE_LEFT
        }
      }
      else
      {
        if(Math.sin(angle) > 0)
        {
          this.moveState = ShootEnemy.moveStates.IDLE_DOWN
        }
        else
        {
          this.moveState = ShootEnemy.moveStates.IDLE_UP
        }
      }
    }
    //If in position, dont move and fire at the player
    else
    {
      if(!thePlayer.invisible)
      {
        this.fireAtPlayer(thePlayer, thegame)
      }
      this.body.velocity.x = 0
      this.body.velocity.y = 0
    }

    if (this.PlayerAlert == true) {
      if (this.LostPlayer == false) {
        this.LostPlayer = true
        this.game.sounds.play('PP_Monster_Alert_1_2', config.SFX_VOLUME)
      }
    }
  }

  //Shooting function
  fireAtPlayer (thePlayer, thegame) {
    var dist = Math.sqrt(Math.pow((thePlayer.body.y - 50) - this.body.y,2) + Math.pow(thePlayer.body.x - this.body.x,2))
    if(dist < 500)
    {
      this.PlayerAlert = true
      var angle = Math.atan2((thePlayer.body.y - 50) - this.body.y, thePlayer.body.x - this.body.x)
      this.shootTimer += 1
      if(this.shootTimer > 120)
      {
        this.game.sounds.play('bullet_leave_barrel_effect_01', config.SFX_VOLUME, false)
        this.shootTimer = 0
        var bullet = new Projectile({
          game: this.game,
          parentLevel: thegame,
          x: this.body.x,
          y: this.body.y - 35
        })
        this.game.add.existing(bullet)
        bullet.body.setCollisionGroup(thegame.enemyCollisionGroup)
        bullet.direction(Math.cos(angle), Math.sin(angle), angle)
      }

      if(this.shootTimer > 100 && this.shootTimer < 120)
      {
        switch(this._move_state)
        {
          case ShootEnemy.moveStates.IDLE_UP:
            this.moveState = ShootEnemy.moveStates.ATTACK_UP
            break

          case ShootEnemy.moveStates.IDLE_DOWN:
            this.moveState = ShootEnemy.moveStates.ATTACK_DOWN
            break

          case ShootEnemy.moveStates.IDLE_LEFT:
            this.moveState = ShootEnemy.moveStates.ATTACK_LEFT
            break

          case ShootEnemy.moveStates.IDLE_RIGHT:
            this.moveState = ShootEnemy.moveStates.ATTACK_RIGHT
            break
        }
      }
      else if(Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle)))
      {
        if(Math.cos(angle) > 0)
        {
          this.moveState = ShootEnemy.moveStates.IDLE_RIGHT
        }
        else
        {
          this.moveState = ShootEnemy.moveStates.IDLE_LEFT
        }
      }
      else
      {
        if(Math.sin(angle) > 0)
        {
          this.moveState = ShootEnemy.moveStates.IDLE_DOWN
        }
        else
        {
          this.moveState = ShootEnemy.moveStates.IDLE_UP
        }
      }

    }
    else
    {
      this.PlayerAlert = false
      this.LostPlayer = false
      this.shootTimer = 50
      switch(this._move_state)
      {
        case ShootEnemy.moveStates.ATTACK_UP:
          this.moveState = ShootEnemy.moveStates.IDLE_UP
          break

        case ShootEnemy.moveStates.ATTACK_DOWN:
          this.moveState = ShootEnemy.moveStates.IDLE_DOWN
          break

        case ShootEnemy.moveStates.ATTACK_LEFT:
          this.moveState = ShootEnemy.moveStates.IDLE_LEFT
          break

        case ShootEnemy.moveStates.ATTACK_RIGHT:
          this.moveState = ShootEnemy.moveStates.IDLE_RIGHT
          break
      }
    }
  }

}

ShootEnemy.moveStates = Object.freeze({
  UNKNOWN: 'unknown',
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

export default ShootEnemy
