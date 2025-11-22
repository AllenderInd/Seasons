import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'

class UberEnemy extends Phaser.Sprite {
  constructor ({ game, x, y, parentLevel }) {
    // Initialize object basics
    super(game, x, y, 'Enemy_Uber_Sheet', 0)
    this.name = 'Basic Enemy'

    // Set parent level
    this.theLevel = parentLevel

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
    this.body.setRectangle(120, 120, 0, 0)
    this.body.offset.setTo(0, 120)

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

    //true = left - right
    //false = up - down
    this.path = true
    //direct true = up
    //driect false = down

    this.attack = false
    this.attackTimer = 0

    this.PlayerAlert = false
    this.LostPlayer = false

    this.setupAnimations()
    this._move_state = UberEnemy.moveStates.UNKNOWN
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
    this.animations.add('walk_down', [10,11,12,13,15], 10, true)
    this.animations.add('walk_left', [19,20,21,22], 10, true)
    this.animations.add('walk_up', [14,16,17,18], 10, true)
    this.animations.add('frozen_down', [26], 10, true)
    this.animations.add('frozen_up', [27], 10, false)
    this.animations.add('frozen_left', [28], 10, false)
    this.animations.add('attack_down', [0,1,24,25,10], 10, false)
    this.animations.add('attack_up', [2,3,4,5,14], 10, false)
    this.animations.add('attack_left', [6,7,8,9,19], 10, false)
  }

  updateAnimation()
  {
    switch (this._move_state) {
      case UberEnemy.moveStates.WALK_DOWN:
        this.animations.play('walk_down')
        break

      case UberEnemy.moveStates.WALK_UP:
        this.animations.play('walk_up')
        break

      case UberEnemy.moveStates.WALK_LEFT:
        this.animations.play('walk_left')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case UberEnemy.moveStates.WALK_RIGHT:
        this.animations.play('walk_left')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case UberEnemy.moveStates.FROZEN_DOWN:
        this.animations.play('frozen_down')
        break

      case UberEnemy.moveStates.FROZEN_UP:
        this.animations.play('frozen_up')
        break

      case UberEnemy.moveStates.FROZEN_LEFT:
        this.animations.play('frozen_left')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case UberEnemy.moveStates.FROZEN_RIGHT:
        this.animations.play('frozen_left')
        this.scale.set(-this._SCALE, this._SCALE)
        break

      case UberEnemy.moveStates.ATTACK_UP:
        this.animations.play('attack_up')
        break

      case UberEnemy.moveStates.ATTACK_DOWN:
        this.animations.play('attack_down')
        break

      case UberEnemy.moveStates.ATTACK_LEFT:
        this.animations.play('attack_left')
        this.scale.set(this._SCALE, this._SCALE)
        break

      case UberEnemy.moveStates.ATTACK_RIGHT:
        this.animations.play('attack_left')
        this.scale.set(-this._SCALE, this._SCALE)
        break
    }
  }

  moveBetweenSpots(thePlayer) {
    //Detect the distance between the player and the enemy
    var dist = Math.sqrt(Math.pow((thePlayer.y - 50) - this.body.y,2) + Math.pow(thePlayer.x - this.body.x,2))
    //Dont move if being pushed by wind
    if(this.pushed)
    {
      this.body.velocity.x = this.push_x * 200
      this.body.velocity.y = this.push_y * 200
      this.pushTimer += 1
      if(this.pushTimer > 75)
      {
        this.pushed = false
      }
      this.attack = false
      this.attackTimer = 0
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
      this.attack = false
      this.attackTimer = 0
    }
    else if(this.attack)
    {
      this.attackTimer += 1

      this.body.velocity.x = 0
      this.body.velocity.y = 0

      if(this.attackTimer > 60)
      {
        this.attack = false
        this.attackTimer = 0
        switch(this._move_state)
        {
          case UberEnemy.moveStates.ATTACK_UP:
            this.body.y += 20
            break

          case UberEnemy.moveStates.ATTACK_DOWN:
            this.body.y -= 20
            break

          case UberEnemy.moveStates.ATTACK_LEFT:
            this.body.x += 20
            break

          case UberEnemy.moveStates.ATTACK_RIGHT:
            this.body.x -= 20
            break
        }
      }
    }
    //Don't move if the player is too far away
    else if(dist > 500 || thePlayer.invisible)
    {
      this.PlayerAlert = false
      this.LostPlayer = false
      if(this.path)
      {
        if(this.body.y != this.original_y)
        {
          let direct_1 = Math.sqrt(Math.pow(this.original_y - this.body.y,2) + Math.pow(this.original_x - this.body.x,2))
          let direct_2 = Math.sqrt(Math.pow(this.second_y - this.body.y,2) + Math.pow(this.second_x - this.body.x,2))
          if(direct_1 < direct_2)
          {
            this.direct = true
            if(direct_1 > 10)
            {
              let angle = Math.atan2(this.original_y - this.body.y, this.original_x - this.body.x)
              this.body.velocity.x = Math.cos(angle) * 150
              this.body.velocity.y = Math.sin(angle) * 150
            }
            else
            {
              this.body.x = this.original_x
              this.body.y = this.original_y
              this.body.velocity.x = 0
              this.body.velocity.y = 0
            }
          }
          else
          {
            this.direct = false
            if(direct_2 > 10)
            {
              let angle = Math.atan2(this.second_y - this.body.y, this.second_x - this.body.x)
              this.body.velocity.x = Math.cos(angle) * 150
              this.body.velocity.y = Math.sin(angle) * 150
            }
            else
            {
              this.body.x = this.second_x
              this.body.y = this.second_y
              this.body.velocity.x = 0
              this.body.velocity.y = 0
            }
          }
        }
        else
        {
          if(this.direct)
          {
            this.body.velocity.x = 200
            if(this.body.x > this.second_x)
            {
              this.direct = false
            }
          }
          else
          {
            this.body.velocity.x = -200
            if(this.body.x < this.original_x)
            {
              this.direct = true
            }
          }
        }
      }
      else
      {
        if(this.body.x != this.original_x)
        {
          let direct_1 = Math.sqrt(Math.pow(this.original_y - this.body.y,2) + Math.pow(this.original_x - this.body.x,2))
          let direct_2 = Math.sqrt(Math.pow(this.second_y - this.body.y,2) + Math.pow(this.second_x - this.body.x,2))
          if(direct_1 < direct_2)
          {
            this.direct = true
            if(direct_1 > 10)
            {
              let angle = Math.atan2(this.original_y - this.body.y, this.original_x - this.body.x)
              this.body.velocity.x = Math.cos(angle) * 150
              this.body.velocity.y = Math.sin(angle) * 150
            }
            else
            {
              this.body.x = this.original_x
              this.body.y = this.original_y
              this.body.velocity.x = 0
              this.body.velocity.y = 0
            }
          }
          else
          {
            this.direct = false
            if(direct_2 > 10)
            {
              let angle = Math.atan2(this.second_y - this.body.y, this.second_x - this.body.x)
              this.body.velocity.x = Math.cos(angle) * 150
              this.body.velocity.y = Math.sin(angle) * 150
            }
            else
            {
              this.body.x = this.second_x
              this.body.y = this.second_y
              this.body.velocity.x = 0
              this.body.velocity.y = 0
            }
          }
        }
        else
        {
          if(this.direct)
          {
            this.body.velocity.y = 200
            if(this.body.y > this.second_y)
            {
              this.direct = false
            }
          }
          else
          {
            this.body.velocity.y = -200
            if(this.body.y < this.original_y)
            {
              this.direct = true
            }
          }
        }
      }
    }
    //Move towards the player
    else
    {
      this.PlayerAlert = true
      let angle = Math.atan2((thePlayer.y - 50) - this.body.y, thePlayer.x - this.body.x)
      this.body.velocity.x = Math.cos(angle) * 225
      this.body.velocity.y = Math.sin(angle) * 225
    }

    if(this.frozen)
    {
      switch(this._move_state)
      {
        case UberEnemy.moveStates.WALK_UP:
          this.moveState = UberEnemy.moveStates.FROZEN_UP
          break

        case UberEnemy.moveStates.WALK_DOWN:
          this.moveState = UberEnemy.moveStates.FROZEN_DOWN
          break

        case UberEnemy.moveStates.WALK_LEFT:
          this.moveState = UberEnemy.moveStates.FROZEN_LEFT
          break

        case UberEnemy.moveStates.WALK_RIGHT:
          this.moveState = UberEnemy.moveStates.FROZEN_RIGHT
          break

        case UberEnemy.moveStates.ATTACK_UP:
          this.moveState = UberEnemy.moveStates.FROZEN_UP
          break

        case UberEnemy.moveStates.ATTACK_DOWN:
          this.moveState = UberEnemy.moveStates.FROZEN_DOWN
          break

        case UberEnemy.moveStates.ATTACK_LEFT:
          this.moveState = UberEnemy.moveStates.FROZEN_LEFT
          break

        case UberEnemy.moveStates.ATTACK_RIGHT:
          this.moveState = UberEnemy.moveStates.FROZEN_RIGHT
          break
      }
    }
    else if(this.pushed)
    {
      switch(this._move_state)
      {
        case UberEnemy.moveStates.ATTACK_UP:
          this.moveState = UberEnemy.moveStates.WALK_UP
          break

        case UberEnemy.moveStates.ATTACK_DOWN:
          this.moveState = UberEnemy.moveStates.WALK_DOWN
          break

        case UberEnemy.moveStates.ATTACK_LEFT:
          this.moveState = UberEnemy.moveStates.WALK_LEFT
          break

        case UberEnemy.moveStates.ATTACK_RIGHT:
          this.moveState = UberEnemy.moveStates.WALK_RIGHT
          break
      }
    }
    else if(this.attack)
    {
      switch(this._move_state)
      {
        case UberEnemy.moveStates.WALK_UP:
          this.moveState = UberEnemy.moveStates.ATTACK_UP
          break

        case UberEnemy.moveStates.WALK_DOWN:
          this.moveState = UberEnemy.moveStates.ATTACK_DOWN
          break

        case UberEnemy.moveStates.WALK_LEFT:
          this.moveState = UberEnemy.moveStates.ATTACK_LEFT
          break

        case UberEnemy.moveStates.WALK_RIGHT:
          this.moveState = UberEnemy.moveStates.ATTACK_RIGHT
          break
      }
    }
    else if(Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y))
    {
      if(this.body.velocity.x > 0)
      {
        this.moveState = UberEnemy.moveStates.WALK_RIGHT
      }
      else
      {
        this.moveState = UberEnemy.moveStates.WALK_LEFT
      }
    }
    else
    {
      if(this.body.velocity.y > 0)
      {
        this.moveState = UberEnemy.moveStates.WALK_DOWN
      }
      else
      {
        this.moveState = UberEnemy.moveStates.WALK_UP
      }
    }

    if (this.PlayerAlert == true) {
      if (this.LostPlayer == false) {
        this.LostPlayer = true
        this.game.sounds.play('Monster_2', config.SFX_VOLUME)
      }
    }

  }


  attackTest(body1, body2){
    if(!body1.sprite.attack && !body1.sprite.frozen && !body1.sprite.pushed)
    {
      if (!body1.sprite.theLevel.invulerable && !body2.sprite.invisible)
      {
        body1.sprite.attack = true
        body1.sprite.attackTimer = 0
        body2.sprite.damage(2)
        body1.sprite.theLevel.invulnerable = true
        body1.sprite.theLevel.invulnerable_countdown = 120
        //console.log("health " + body2.sprite.health)
        body2.sprite.theLevel.game.camera.shake(0.01, 150)
      }
    }
  }
}

UberEnemy.moveStates = Object.freeze({
  UNKNOWN: 'unknown',
  WALK_UP: 'walk_up',
  WALK_LEFT: 'walk_left',
  WALK_RIGHT: 'walk_right',
  WALK_DOWN: 'walk_down',
  ATTACK_UP: 'attack_up',
  ATTACK_LEFT: 'attack_left',
  ATTACK_RIGHT: 'attack_right',
  ATTACK_DOWN: 'attack_down',
  FROZEN_UP: 'frozen_up',
  FROZEN_DOWN: 'frozen_down',
  FROZEN_RIGHT: 'frozen_right',
  FROZEN_LEFT: 'frozen_left'
})

export default UberEnemy
