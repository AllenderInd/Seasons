/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import needed functions from utils and config settings
import { sequentialNumArray } from '../utils.js'
import config from '../config'

import Wind from '../sprites/Wind'
import Bullet from '../sprites/bullet'
/**
 * The main player-controllable sprite. This class encapsulates the logic for the main
 * player sprite with all of it's animations and states. It includes a simple, hard-coded
 * movement state-machine that coordinates transitions between differnt movement states
 * and the idle state. It shows examples of setting up animations that are embedded in a
 * larger sprite-sheet and carefule management of the current state. No physics are used
 * in this example, only basic animation.
 *
 * See Phaser.Sprite for more about sprite objects and what they support.
 */
class CozyPlayer extends Phaser.Sprite {
  constructor ({ game, x, y, parentLevel }) {
    // Initialize object basics
    super(game, x, y, 'player-main2', 0)
    this.name = 'CozyPlayer'

    // turn off smoothing (this is pixel art)
    this.smoothed = true

    // Setup all the animations
    this.setupAnimations()

    // Set a reference to the top-level phaser game object
    this.game = game
    this.theLevel = parentLevel

    // All variabes that start with '_' are meant to be private
    // Initial state is 'unknown' as nothing has happened yet
    this._move_state = CozyPlayer.moveStates.UNKNOWN

    // These variables come from config.js rather than being hard-coded here so
    // they can be easily changed and played with
    this._SCALE = config.PLAYER_SCALE
    this._idle_countdown = config.IDLE_COUNTDOWN
    // Initialize the scale of this sprite
    this.scale.setTo(this._SCALE)

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.collideWorldBounds = true
    this.body.fixedRotation = true
    this.game.physics.p2.applyGravity = false // turn off gravity

    // Create a custom shape for the collider body
    this.body.setRectangle(40, 120, 0, -74)
    this.body.addCapsule(55, 30, 0, -145)
    // Configure custom physics properties
    this.body.damping = 0.5
    this.anchor.setTo(0.5, 0.5)

    // Moving Variables
    this.speed = 0
    this.updown = 0

    this.lastspeed = 0
    this.lastupdown = 0

    this.velocity_x = 0
    this.velocity_y = 0

    // Action Variables
    this.dash = false
    this.middash = false

    this.dash_x = 0
    this.dash_y = 0

    this.dashTimer = 0

    this.windy = false
    this.wind_timer = 0

    this.fired = false
    this.shootTimer = 0

    this.invisible = false
    this._visible_timer = 0
    this.inLeaves = false

    this.actionKey = false

    // Cooldown setup
    this._action_cooldown = 0
    this._activeCooldown = false

    // Setup the players health
    this.playerDead = false
    this.playerMaxHealth = 3
    this.playerHealth = this.playerMaxHealth
    this.playedDeath = false
    this.showDeathScreen = false
  }

  // Setter and getter for the movement state property
  get moveState () { return this._move_state }
  set moveState (newState) {
    if (this._move_state !== newState &&
        (this._move_state !== CozyPlayer.moveStates.IDLE ||
        newState !== CozyPlayer.moveStates.STOPPED)) {
      // Update the state
      this._move_state = newState
      this.updateAnimation()
    }
  }

  // Update animation to match state (called only when state changes)
  updateAnimation () {
    // Look at the current movement state and adjust the animation accordingly
    switch (this._move_state) {
      case CozyPlayer.moveStates.STOPPED:
        if (__DEV__) console.info('Playing "stop"')
        this.animations.play('stop')
        this._idle_countdown = config.IDLE_COUNTDOWN
        break

      case CozyPlayer.moveStates.WALKING_EAST:
        if (__DEV__) console.info('Playing "walk_east"')
        this.animations.play('Walk_East')
        break

      case CozyPlayer.moveStates.WALKING_NORTH:
        if (__DEV__) console.info('Playing "walk_north"')
        this.animations.play('Walk_North')
        break

      case CozyPlayer.moveStates.WALKING_SOUTH:
        if (__DEV__) console.info('Playing "walk_south"')
        this.animations.play('Walk_South')
        break

      case CozyPlayer.moveStates.WALKING_WEST:
        if (__DEV__) console.info('Playing "walk_west"')
        this.animations.play('Walk_West')
        break

      case CozyPlayer.moveStates.DASHING_EAST:
        if (__DEV__) console.info('Playing "dash_east"')
        this.animations.play('Dash_East')
        break

      case CozyPlayer.moveStates.DASHING_NORTH:
        if (__DEV__) console.info('Playing "dash_north"')
        this.animations.play('Dash_North')
        break

      case CozyPlayer.moveStates.DASHING_SOUTH:
        if (__DEV__) console.info('Playing "dash_south"')
        this.animations.play('Dash_South')
        break

      case CozyPlayer.moveStates.DASHING_WEST:
        if (__DEV__) console.info('Playing "dash_west"')
        this.animations.play('Dash_West')
        break
      case CozyPlayer.moveStates.GUST_NORTH:
        if (__DEV__) console.info('Playing "gust_north"')
        this.animations.play('Gust_North')
        break
      case CozyPlayer.moveStates.GUST_EAST:
        if (__DEV__) console.info('Playing "gust_east"')
        this.animations.play('Gust_East')
        break
      case CozyPlayer.moveStates.GUST_SOUTH:
        if (__DEV__) console.info('Playing "gust_south"')
        this.animations.play('Gust_South')
        break
      case CozyPlayer.moveStates.GUST_WEST:
        if (__DEV__) console.info('Playing "gust_west"')
        this.animations.play('Gust_West')
        break
      case CozyPlayer.moveStates.FREEZE_NORTH:
        if (__DEV__) console.info('Playing "Freeze_north"')
        this.animations.play('Freeze_North')
        break
      case CozyPlayer.moveStates.FREEZE_EAST:
        if (__DEV__) console.info('Playing "Freeze_east"')
        this.animations.play('Freeze_East')
        break
      case CozyPlayer.moveStates.FREEZE_SOUTH:
        if (__DEV__) console.info('Playing "Freeze_south"')
        this.animations.play('Freeze_South')
        break
      case CozyPlayer.moveStates.FREEZE_WEST:
        if (__DEV__) console.info('Playing "Freeze_west"')
        this.animations.play('Freeze_West')
        break
      case CozyPlayer.moveStates.RUNNING:
        if (__DEV__) console.info('Playing "run"')
        this.animations.play('run')
        break

      case CozyPlayer.moveStates.IDLE:
        if (__DEV__) console.info('Playing "idle"')
        this.animations.play('idle')
        break

      case CozyPlayer.moveStates.IDLE_NORTH:
        this.animations.play('Idle_North')
        break

      case CozyPlayer.moveStates.IDLE_SOUTH:
        this.animations.play('Idle_South')
        break

      case CozyPlayer.moveStates.IDLE_EAST:
        this.animations.play('Idle_East')
        break

      case CozyPlayer.moveStates.IDLE_WEST:
        this.animations.play('Idle_West')
        break
    }
  }

  // Create different walk animations
  setupAnimations () {
    // Anemoi Movements and animations
    // Basic movement animations
    // this.animations.add('stop', [0], 1, false)
    // this.animations.add('walk_West', [0, 1, 2, 3, 4, 5], 10, true)
    // this.animations.add('walk_East', [6, 7, 8, 9, 10, 11], 10, true)
    // this.animations.add('walk_South', [12, 13, 14, 15, 16, 17], 10, true)
    // this.animations.add('walk_North', [18, 19, 20, 21, 22, 23], 10, true)

    this.animations.add('stop', [87], 1, false)
    // death animation set up
    this.animations.add('Death', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 10, false)
    // Freeze animation setup
    this.animations.add('Freeze_South', [15, 16, 17, 18, 19, 20], 10, false)
    this.animations.add('Freeze_North', [21, 22, 23, 24, 25, 26], 10, false)
    this.animations.add('Freeze_East', [27, 28, 29, 30, 31, 32], 10, false)
    this.animations.add('Freeze_West', [33, 34, 35, 36, 37, 38], 10, false)
    // Gust animation setup
    this.animations.add('Gust_West', [39, 40, 41, 42, 43, 44], 10, false)
    this.animations.add('Gust_East', [45, 46, 47, 48, 49, 50], 10, false)
    this.animations.add('Gust_South', [51, 52, 53, 54, 55, 56], 10, false)
    this.animations.add('Gust_North', [57, 58, 59, 60, 61, 62], 10, false)
    // Idle animation setup
    this.animations.add('Idle_West', [63, 64, 65, 66, 67, 68], 10, true)
    this.animations.add('Idle_East', [69, 70, 71, 72, 73, 74], 10, true)
    this.animations.add('Idle_South', [75, 76, 77, 78, 79, 80], 10, true)
    this.animations.add('Idle_North', [81, 82, 83, 84, 85, 86], 10, true)
    // Walk animation setup
    this.animations.add('Walk_West', [87, 88, 89, 90, 91, 92], 10, true)
    this.animations.add('Walk_East', [93, 94, 95, 96, 97, 98], 10, true)
    this.animations.add('Walk_South', [99, 100, 101, 102, 103, 104], 10, true)
    this.animations.add('Walk_North', [105, 106, 107, 108, 109, 110], 10, true)
    // Dash Animation setup
    this.animations.add('Dash_West', [111, 112, 113], 3, false)
    this.animations.add('Dash_East', [114, 115, 116], 3, false)
    this.animations.add('Dash_South', [117, 118, 119], 3, false)
    this.animations.add('Dash_North', [120, 121, 119], 3, false)

  }

  // Set the players max health
  maxHealth (amountOfHealth)
  {
    console.log("The players max health function")
    this.playerMaxHealth = amountOfHealth
  }

  // Retrieve the players health
  /*
  health ()
  {
    console.log("The players health function")
    return this.playerHealth
  }
  */

  // Deal damage to the player
  damage (amountOfDamage)
  {
    console.log('"The players damage function"')
    this.game.sounds.play('punch_general_body_impact_04', config.SFX_VOLUME, false)
    if (this.playerHealth > 0)
    {
      this.playerHealth -= amountOfDamage
    }
  }

  kill ()
  {
    this.body.velocity.x = 0
    this.body.velocity.y = 0
    console.log('"The players kill function"')
    // Restrict player movement
    this.playerDead = true
    
    // Set the death animation
    if (!this.playedDeath)
    {
      this.animations.play('Death')
      this.game.sounds.stop('music_calm_tree_of_life')
      this.game.sounds.play('TD_Game_Over_Slow_Loop', config.SFX_VOLUME, true)
      this.showDeathScreen = true
    }

    // Pull up lose screen
    /*
    if (this.showDeathScreen)
    {
      console.log("Show Death Screen")
      var loseScreen
      console.log(this.theLevel)
      loseScreen = this.theLevel.add.sprite(this.theLevel.camera.x + 687, this.theLevel.camera.y + 449, 'DefeatScreen')
      console.log(this.theLevel.camera.x + " | " + this.theLevel.camera.y)
      //loseScreen.scale.setTo(0.3, 0.3)
      console.log(loseScreen)
      loseScreen.fixedToCamera = true
      //this.showDeathScreen = false
    }
    */

  }

  // Function that runs every tick to update this sprite
  update () {
    // Always give parent a chance to update
    super.update()
    
    // Check if the player is dead
    if (this.playerHealth <= 0)
    {
      this.kill()
      this.playedDeath = true
    }

    // Check if there is an active cooldown
    if (this._action_cooldown > 0) {
      // Count down the cooldown
      this._action_cooldown--
    }
    else
    {
      // Deactivate the cooldown
      this._activeCooldown = false
    }

    // Countdown while the player is invisible
    if (this._visible_timer > 0) {
      this._visible_timer--
    }
    else if(!this.inLeaves)
    {
      //this.alpha = 1
      //this.invisible = false
    }
  }

  // Control the players movement and actions
  movement (currentSeason, upkey, downkey, leftkey, rightkey, actionkey, thegame, windobject) {
    this.speed = 0
    this.updown = 0

    if (rightkey) { this.speed++ }
    if (leftkey) { this.speed-- }
    if (upkey) { this.updown-- }
    if (downkey) { this.updown++ }

    // Dash action
    if (actionkey && currentSeason === 1)
    {
      if (!this.dash && !this._activeCooldown)
      {
        this.dash = true
        this.middash = true

        thegame.chasmCheck(this.middash)

        if (this.speed === 0 && this.updown === 0)
        {
          this.game.sounds.play('Wind7fast', config.SFX_VOLUME, false)
          this.dash_x = Math.sign(this.lastspeed) * 4000
          this.dash_y = Math.sign(this.lastupdown) * 4000
        }
        else
        {
          this.game.sounds.play('Wind7fast', config.SFX_VOLUME, false)
          this.dash_x = Math.sign(this.speed) * 4000
          this.dash_y = Math.sign(this.updown) * 4000
        }
        
        // Set cooldown to be active
        this._activeCooldown = true
        this._action_cooldown = 140
      }
    }
    else
    {
      this.dash = false
    }

    if(this.middash)
    {
      this.body.velocity.x = this.dash_x
      this.body.velocity.y = this.dash_y
    }

    thegame.chasmCheck(this.middash)

    // Wind wall action
    if (actionkey && currentSeason === 2)
    {
      if (!this.windy && !this._activeCooldown)
      {
        this.windy = true
        windobject.reset()
        windobject.animations.play('up')
        this.game.sounds.play('Wind_1', config.SFX_VOLUME, false)
        if (this.speed === 0 && this.updown === 0)
        {
          // Set the wind object's position
          windobject.body.x = (this.body.x + (Math.sign(this.lastspeed) * 10))
          windobject.body.y = (this.body.y + (Math.sign(this.lastupdown) * 30) - 100)

          // Set the variables for the direction the wind pushes things
          windobject.x_pos = Math.sign(this.lastspeed)
          windobject.y_pos = Math.sign(this.lastupdown)
        }
        // If moving
        else
        {
          // Set the wind object's position
          windobject.body.x = (this.body.x + (Math.sign(this.speed) * 10))
          windobject.body.y = (this.body.y + (Math.sign(this.updown) * 30) - 100)

          // Set the variables for the direction the wind pushes things
          windobject.x_pos = Math.sign(this.speed)
          windobject.y_pos = Math.sign(this.updown)
        }

        // Set cooldown to be active
        this._activeCooldown = true
        this._action_cooldown = 120
      }
    }

    

    // Count down to the destruction of the wind
    if (this.windy)
    {
      this.wind_timer += 1
      if (this.wind_timer > 50)
      {
        windobject.kill()
        this.windy = false
        this.wind_timer = 0
      }
    }

    // Invisible action
    if (currentSeason === 3)
    {
      if (actionkey)
      {
        if (!this.invisible && !this._activeCooldown)
        {
          this.game.sounds.play('stealth', 0.75, false)
          // Change character sprite
          this.alpha = 0.4

          // Set invisible to true
          this.invisible = true
          this._visible_timer = 120

          // Set cooldown to be active
          this._activeCooldown = true
          this._action_cooldown = 180
        }
      }
    }
    else
    {
      this.invisible = false
    }

    // Projectile Action
    if (actionkey && currentSeason === 4)
    {
      if (!this.fired && !this._activeCooldown)
      {
        this.game.sounds.play('ice_blast_projectile_spell_03', config.SFX_VOLUME, false)
        this.fired = true
        this.shootTimer = 45
        var bullet = new Bullet({
          game: this.game,
          parentLevel: thegame,
          x: this.x,
          y: this.y - 90
        })
        this.game.add.existing(bullet)

        // Swap the depths so the bullet goes behind trees
        // this.game.world.swap(thegame.treeOverlay, bullet)
        thegame.seasonIndicator.bringToTop()
        thegame.abilityIndicator.bringToTop()
        thegame.healthSun01.bringToTop()
        thegame.healthSun02.bringToTop()
        thegame.healthSun03.bringToTop()
        thegame.winterToken.bringToTop()
        thegame.fallToken.bringToTop()
        thegame.springToken.bringToTop()
        thegame.summerToken.bringToTop()

        if (this.speed === 0 && this.updown === 0)
        {
          bullet.direction(this.lastspeed, this.lastupdown)
        }
        else
        {
          bullet.direction(this.speed, this.updown)
        }

        // Set cooldown to be active
        this._activeCooldown = true
        this._action_cooldown = 180
      }
    }
    else
    {
      this.fired = false
    }

    if(this.shootTimer > 0)
    {
      this.shootTimer -= 1
    }

    // ***** Player movement *****
    if(!this.middash)
    {
      // North South direcitonal movement
      if (this.updown !== 0) {
        this.velocity_y = this.updown * 175
        if (this.updown > 0)
        {
          this.lastupdown = 1
        }
        else
        {
          this.lastupdown = -1
        }
        if (this.speed === 0)
        {
          this.lastspeed = 0
        }
      }
      else if (!this.middash) { this.velocity_y = 0 }

      // East West directional movement
      if (this.speed != 0) {
        this.velocity_x = this.speed * 175
        if (this.speed > 0)
        {
          this.lastspeed = 1
        }
        else
        {
          this.lastspeed = -1
        }
        if(this.updown === 0)
        {
          this.lastupdown = 0
        }
      }
      else if (!this.middash) { this.velocity_x = 0 }

    }
    // Check if the player is creating a wind object
    // If they are, freeze their current position
    if(!this.windy && !this.middash)
    {
      // Update sprite facing direction
      /*
      if (this.speed > 0 && !this.isFacingRight()) {
        this.makeFaceRight()
      } else if (this.speed < 0 && !this.isFacingLeft()) {
        this.makeFaceLeft()
      }
      */
      
      this.body.velocity.x = this.velocity_x
      this.body.velocity.y = this.velocity_y
    }
    else if(!this.middash)
    {
      this.body.velocity.x = 0
      this.body.velocity.y = 0
    }

    // Reset being in the middle of a dash
    if(this.middash)
    {
      this.dashTimer += 1
      if(this.dashTimer > 4)
      {
        this.middash = false
        this.dashTimer = 0
      }
    }

  }
}

// All possible player 'movement states'
// Note: this is an example of a static 'enum' in JavaScript
CozyPlayer.moveStates = Object.freeze({
  UNKNOWN: 'unknown',
  STOPPED: 'stopped',
  WALKING: 'walking',
  WALKING_NORTH: 'walking_north',
  WALKING_EAST: 'walking_east',
  WALKING_SOUTH: 'walking_south',
  WALKING_WEST: 'walking_west',
  DASHING_NORTH: 'dashing_north',
  DASHING_EAST: 'dashing_east',
  DASHING_SOUTH: 'dashing_south',
  DASHING_WEST: 'dashing_west',
  GUST_NORTH: 'gusting_north',
  GUST_EAST: 'gusting_east',
  GUST_SOUTH: 'gusting_south',
  GUST_WEST: 'gusting_west',
  FREEZE_NORTH: 'freezing_north',
  FREEZE_EAST: 'freezing_east',
  FREEZE_SOUTH: 'freezing_south',
  FREEZE_WEST: 'freezing_west',
  IDLE_NORTH: 'idle_north',
  IDLE_EAST: 'idle_east',
  IDLE_WEST: 'idle_west',
  IDLE_SOUTH: 'idle_south',
  RUNNING: 'running',
  IDLE: 'idle'
})

// Expose the CozyPlayer class to other files
export default CozyPlayer
