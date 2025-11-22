/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import the main player sprite
import CozyPlayer from '../sprites/CozyPlayer'
//import AlexPlayer from '../sprites/AlexPlayer'
import Wind from '../sprites/Wind'

// Import config settings
import config from '../config'

/**
 * The CozyTest game state. This game state is a simple test level showing a main
 * player sprite that can be roughly controlled with the left, right, and shift keys.
 * It also displays some text, shows how to display debugging info properly, and
 * sequences and plays some background music and sound FX. Level can usually occur
 * more than once during a play session so assume this state CAN be re-entered. All
 * assets are pre-loaded and cached in the Splash state so this must have run once
 * before loading this state.
 *
 * See Phaser.State for more about game states.
 */
class CozyTest extends Phaser.State {
  init () {}

  preload () {}

  create () {
    // create level collision map
    this.map = this.game.add.tilemap('Collisiontest1')

    this.map.addTilesetImage('grwtiles', 'leveltiles')
    this.map.addTilesetImage('colltree', 'treetile')

    this.layerRock = this.map.createLayer('rockwall')
    this.layerGrass = this.map.createLayer('grass')
    this.layerWater = this.map.createLayer('water')
    this.layerTree = this.map.createLayer('trees')

    this.map.setCollision([ 1 ], true, this.layerRock, true)
    this.map.setCollision([ 5 ], true, this.layerTree, true)

    this.mapBodies1 = this.game.physics.p2.convertTilemap(this.map, this.layerRock)
    this.mapBodies2 = this.game.physics.p2.convertTilemap(this.map, this.layerTree)

    this.mapBodies1.forEach((body) => {
      body.debug = __DEV__
    })

    this.mapBodies2.forEach((body) => {
      body.debug = __DEV__
    })

    this.layerRock.resizeWorld()
    this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    // Create and add the main player object
    this.player = new CozyPlayer({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY
    })

    this.wind = new Wind({
      game: this.game,
      x: 0,
      y: 0
    })

    // Sets camera to follow player
    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1)

    // Add player after the floor
    this.game.add.existing(this.player)
    this.game.add.existing(this.wind)
    this.wind.kill()

    // Start playing the background music
    this.game.sounds.play('sunny', config.MUSIC_VOLUME)

    // Setup the key objects
    this.setupKeyboard()

    this.game.physics.p2.gravity.y = 0

    // Player Health
    this.player.maxHealth = 5
    this.player.health = 5
    this.invulnerable = false
    this.invulnerable_countdown = 0

    // Setup seasons
    this.Seasons = { SPRING: 1, SUMMER: 2, FALL: 3, WINTER: 4 }
    this.currentSeason = this.Seasons.SPRING
    this.lastSeason = this.currentSeason

    // Cooldown setup
    this._season_cooldown = 0
    this._activeCooldown = false

    // Setup HUD elements
    this.seasonIndicator = this.game.add.sprite(20, 735, 'SeasonIndicators')
    this.seasonIndicator.fixedToCamera = true
    //this.playerTest = this.game.add.sprite(60, 300, 'AnemoiIdle')
    //this.pauseButton = this.game.add.button(30, 480, 'button', pauseGame(), this)
    //this.pauseButton.fixedToCamera = true 
  }

  pauseGame ()
  {
    this.game.paused = true
  }

  changeSeason (newSeason)
  {
    this.lastSeason = this.currentSeason

    switch (newSeason)
    {
      case 1:
        this.currentSeason = this.Seasons.SPRING
        this.map.replace(4, 2)
        this.seasonIndicator.frame = 0
        break
      case 2:
        this.currentSeason = this.Seasons.SUMMER
        this.map.replace(2, 4)
        this.seasonIndicator.frame = 1
        break
      case 3:
        this.currentSeason = this.Seasons.FALL
        this.seasonIndicator.frame = 2
        break
      case 4:
        this.currentSeason = this.Seasons.WINTER
        this.seasonIndicator.frame = 3
        break
      default:
        this.currentSeason = this.Seasons.SPRING
        this.seasonIndicator.frame = 0
        break
    }

    // Set cooldown to be active
    this._activeCooldown = true
    this._season_cooldown = 300
    this.seasonIndicator.alpha = 0.6
  }

  setupKeyboard () {
    // Register the keys
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.sprintKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP)
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    this.actionKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E)
    this.springKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    this.summerKey = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    this.fallKey = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    this.winterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR)
    this.dealDamage = this.game.input.keyboard.addKey(Phaser.Keyboard.H)

    // Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SHIFT, Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN, Phaser.Keyboard.E, Phaser.Keyboard.ONE, Phaser.Keyboard.TWO, 
      Phaser.Keyboard.THREE, Phaser.Keyboard.FOUR, Phaser.Keyboard.H
    ])
  }

  update () {
    // Check state of keys to control main character
    this.player.movement(this.currentSeason, this.upKey.isDown, this.downKey.isDown, this.leftKey.isDown, this.rightKey.isDown, this.actionKey.isDown, this.game, this.wind)

    if(this.dealDamage.isDown && !this.invulnerable)
    {
      this.player.damage(1)
      console.log(this.player.health)
      this.invulnerable = true
      this.invulnerable_countdown = 120
    }

    if (!this._activeCooldown)
    {
      this.seasonIndicator.alpha = 1
    }

    if(this.springKey.isDown && this.currentSeason != 1 && !this._activeCooldown)
    {
      this.changeSeason(1)
    }
    else if(this.summerKey.isDown && this.currentSeason != 2 && !this._activeCooldown)
    {
      this.changeSeason(2)
    }
    else if(this.fallKey.isDown && this.currentSeason != 3 && !this._activeCooldown)
    {
      this.changeSeason(3)
    }
    else if(this.winterKey.isDown && this.currentSeason !== 4 && !this._activeCooldown)
    {
      this.changeSeason(4)
    }

    // Check if there is an active cooldown
    if (this._season_cooldown > 0) {
      // Count down the cooldown
      this._season_cooldown--
    }
    else
    {
      // Deactivate the cooldown
      this._activeCooldown = false
    }

    if (this.invulnerable_countdown > 0) {
      // Count down the cooldown
      this.invulnerable_countdown--
    }
    else
    {
      // Deactivate the cooldown
      this.invulnerable = false
    }
  }

  render () {
    // Optionally render some development/debugging info
    if (__DEV__) {
      // Print info about the player sprite at (32, 32) -> top left
      this.game.debug.spriteInfo(this.player, 32, 32)

      // Print some text about the player state machine
      this.game.debug.text(`Movement State: ${this.player.moveState}`, this.game.width - 350, 32)

      // Print a warning that the game is running in DEV/Debug mode
      this.game.debug.text(`${this.game.time.fps} fps`, this.game.width - 200, this.game.height - 10, '#AA0000')
      this.game.debug.text('DEV BUILD', this.game.width - 100, this.game.height - 10, '#AA0000')
    }
  }
}

// Expose the class CozyTest to other files
export default CozyTest
