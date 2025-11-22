import Phaser from 'phaser'

// Import needed functions from utils and config settings
import config from '../config'
import MainPlayer from '../sprites/Player'

class Bullet extends Phaser.Sprite {
  constructor ({ game, x, y, parentLevel }) {
    // Initialize object basics
    super(game, x, y, 'Projectile_Sheet', 0)
    this.name = 'Bullet'

    // turn off smoothing (this is pixel art)
    this.smoothed = true

    // Set a reference to the top-level phaser game object
    this.game = game

    // Setup all the animations
    //this.setupAnimations()
    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = 0.5
    // Initialize the scale of this sprite
    this.scale.setTo(this._SCALE)

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = false
    this.body.fixedRotation = true
    this.game.physics.p2.applyGravity = false // turn off gravity

    // Create a custom shape for the collider body
    this.body.setRectangle(30, 30, 0, -80)
    this.body.offset.setTo(0, 0)

    // Configure custom physics properties
    this.body.damping = 0.5
    this.anchor.setTo(0.5, 1.0)
    // this.body.mass = 10000

    //this.body.kinematic = true
    this.body.setCollisionGroup(parentLevel.winterCollisionGroup)
    this.body.collides([parentLevel.enemyCollisionGroup, parentLevel.terrainCollisionGroup])

    this.body.onBeginContact.add(this.contact, this)
    this.x_var = 0
    this.y_var = 0

    this.parentLevel = parentLevel
    this.setupanimations()
  }

  setupanimations()
  {
    this.animations.add('up', [5,6,7], 10, true)
    this.animations.add('up_still', [7], 10, false)
  }

  contact (otherBody, otherP2Body, myShape, otherShape) {
    if (otherShape !== null) {
      if (otherShape.collisionGroup == this.parentLevel.terrainCollisionGroup.mask) {
        this.killBullet()
      } else if (otherShape.collisionGroup == this.parentLevel.enemyCollisionGroup.mask) {
        this.freeze(otherBody)
      }
    }
  }

  // Function that runs every tick to update this sprite
  update () {
    // Always give parent a chance to update
    super.update()
    this.body.velocity.x = this.x_var
    this.body.velocity.y = this.y_var
  }


  direction(play_x, play_y)
  {
    this.x_var = 400 * play_x
    this.y_var = 400 * play_y

    this.animations.play('up_still')

    if(play_x == 0 && play_y == -1) this.angle = 0
    else if(play_x == 0 && play_y == 1) this.angle = 180
    else if(play_x == 1 && play_y == 0) this.angle = 90
    else if(play_x == -1 && play_y == 0) this.angle = -90
    else if(play_x == 1 && play_y == 1) this.angle = 135
    else if(play_x == -1 && play_y == 1) this.angle = -135
    else if(play_x == 1 && play_y == -1) this.angle = 45
    else if(play_x == -1 && play_y == -1) this.angle = -45

    this.body.rotation = (Math.PI / 180) * this.angle

  }

  freeze(body2)
  {
    console.log('in Bullet.freeze')
    body2.sprite.frozen = true
    body2.sprite.frozenTimer = 0
    this.game.sounds.play('ice_spell_impact_shatter_09', config.SFX_VOLUME, false)
    this.destroy()
  }

  killBullet()
  {
    console.log('in Bullet.killBullet')
    console.log(this)
    this.game.sounds.play('ice_spell_impact_shatter_09', config.SFX_VOLUME, false)
    this.destroy()
  }
}

// Expose the MainPlayer class to other files
export default Bullet
