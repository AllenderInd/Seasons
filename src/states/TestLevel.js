/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import the main player sprite
import MainPlayer from '../sprites/Player'
import BaseEnemy from '../sprites/Enemy'
import TreeSprite from '../sprites/TreeSprite'

// Import config settings
import config from '../config'

/**
 * The TestLevel game state. This game state is a simple test level showing a main
 * player sprite that can be roughly controlled with the left, right, and shift keys.
 * It also displays some text, shows how to display debugging info properly, and
 * sequences and plays some background music and sound FX. Level can usually occur
 * more than once during a play session so assume this state CAN be re-entered. All
 * assets are pre-loaded and cached in the Splash state so this must have run once
 * before loading this state.
 *
 * See Phaser.State for more about game states.
 */
class TestLevel extends Phaser.State {
  init () {
    // Set / Reset world bounds
    // this.game.world.setBounds(0, 0, this.game.width, this.game.height)
  }

  preload () {
    //this.game.load.spritesheet('anemoi', 'assets/images/Anemoi_FrontIdle.png', 240, 300, 1)

  }

  create () {

    // create level collision map
    // this.map = this.game.add.tilemap('DrawnCollision')
    this.map = this.game.add.tilemap('Center_Level')

    // this.map.addTilesetImage('grwtiles', 'leveltiles')
    // this.map.addTilesetImage('colltree', 'treetile')

    // this.map.addTilesetImage('DrawnCollisionTile', 'DrawnCollisionLevel')
    // this.layerBackground = this.map.createLayer('BackgroundTileLayer')

    this.map.addTilesetImage('Center_Level', 'Center_Level_BG')
    this.layerBackground = this.map.createLayer('BackgroundTileLayer')
    
    // this.layerRock = this.map.createLayer('rockwall')
    // this.layerGrass = this.map.createLayer('grass')
    // this.layerWater = this.map.createLayer('water')
    
    // this.layerTree = this.map.createLayer('trees')
    // this.layerTree2 = this.map.createLayer('CustomTrees')

    // this.map.setCollision([ 1 ], true, this.layerRock, true)
    // this.mapBodies1 = this.game.physics.p2.convertTilemap(this.map, this.layerRock)

    // this.mapBodies1.forEach((body) => {
    //   body.debug = __DEV__
    // })

    // this.layerRock.resizeWorld()
    this.layerBackground.resizeWorld()
    this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    
    // Make with custom 'Treesprite' class that include P2 collider
    
    // Make Collisions For Rock Objects
    // let Rock1 = this.map.objects['RockCollision'][0]
    // this.rockCollider = this.game.add.sprite(Rock1.x, Rock1.y)
    // this.game.physics.p2.enable(this.rockCollider)
    // this.rockCollider.body.debug = __DEV__
    // this.rockCollider.body.addPolygon({}, Rock1.polygon)
    // this.rockCollider.body.static = true

    // reads in all polygons under object layer 'DenseTreeCollision' and sets them as collidable
    // and to a collision group
    let customcollider = this.map.objects['DenseTreeCollision']
    customcollider.forEach(element => {
      this.Collider = this.game.add.sprite(element.x, element.y)
      this.game.physics.p2.enable(this.Collider)
      this.Collider.body.debug = __DEV__
      this.Collider.body.addPolygon({}, element.polygon)
      this.Collider.body.static = true
      // this.Collider.body.setCollisionGroup(this.terrainCollisionGroup)
    })

    // // reads in all polygons under object layer 'DenseTreeCollision' and sets them as collidable
    // // and to a collision group
    let Truckcollider = this.map.objects['TreeTrunkCollision']
    Truckcollider.forEach(element => {
      this.Collider = this.game.add.sprite(element.x, element.y)
      this.game.physics.p2.enable(this.Collider)
      this.Collider.body.debug = __DEV__
      this.Collider.body.addPolygon({}, element.polygon)
      this.Collider.body.static = true
      // this.Collider.body.setCollisionGroup(this.terrainCollisionGroup)
    })

    // // adding polyline for pathing
    let Path1 = this.map.objects['Enemy_Paths'][0]
    this.enemyPath = this.game.add.sprite(Path1.x, Path1.y)
    this.game.physics.p2.enable(this.enemyPath)
    this.enemyPath.body.debug = __DEV__
    this.enemyPath.body.addLine({}, Path1.line)    
    this.enemyPath.body.static = true

    // Assigns player Start postion from tiled object
    var PlayerStart = this.map.objects['SpritePositions'][0]

    // Create and add the main player object
    this.player = new MainPlayer({
      game: this.game,
      x: PlayerStart.x,
      y: PlayerStart.y
    })

    // Creates base enemy
    this.enemy = new BaseEnemy({
      game: this.game,
      x: 150,
      y: 400
    })

    // sets camera to follow player
    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1)

    // Add player after the floor
    this.game.add.existing(this.player)
    this.game.add.existing(this.enemy)

    //adding tree overlay
    this.treeOverlay = this.game.add.sprite(0, 0, 'Center_Level_Tree_Overlay')

    // Start playing the background music
    this.game.sounds.play('sunny', config.MUSIC_VOLUME)

    // Setup the key objects
    this.setupKeyboard()


    // this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()
    // this.leafCollisionGroup = this.game.physics.p2.createCollisionGroup()

    // this.player.body.setCollisionGroup(this.playerCollisionGroup)
    //this.leaveCollider.body.setCollisionGroup(this.leafCollisionGroup)
  }

  // setupText (floorHeight) {
  // Title message to show on screen
  // const bannerText = 'UW Stout / GDD 325 - 2D Web Game Base'
  // let banner = this.add.text(this.world.centerX, 180, bannerText)

  // Configure all the title message font properties
  // banner.font = 'Libre Franklin'
  // banner.padding.set(10, 16)
  // banner.fontSize = 30
  // banner.fontWeight = 'bolder'
  // banner.stroke = '#FFFFFF'
  // banner.strokeThickness = 1
  // banner.fill = '#012169'
  // banner.anchor.setTo(0.5)

  // Control message to show on screen
  // const controlText = 'L & R arrow -- walk\n' +
  //                     '      SHIFT -- hold to run'
  // let controls = this.add.text(this.game.width - 100, floorHeight + 60, controlText)

  // // Configure all the control message font properties
  // controls.font = 'Courier'
  // controls.padding.set(10, 0)
  // controls.fontSize = 18
  // controls.fill = '#000000'
  // controls.anchor.setTo(1.0, 0)

  // Credits message to show on screen
  // const creditsText = 'Based on "The Great Tsunami Theif":\n' +
  //                     '     Colton Barto -- Programming\n' +
  //                     ' Nicole Fairchild -- Art\n' +
  //                     '   Maria Kastello -- Programming\n' +
  //                     '     Austin Lewer -- Art\n' +
  //                     '    Austin Martin -- Music\n' +
  //                     '    Cole Robinson -- Programming\n' +
  //                     '       Shane Yach -- Programming'

  // Configure all the credits message font properties
  // let credits = this.add.text(100, floorHeight + 20, creditsText)
  // credits.font = 'Courier'
  // credits.padding.set(10, 0)
  // credits.fontSize = 14
  // credits.fill = '#000000'
  // credits.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2)
  // credits.anchor.setTo(0, 0)
  // }

  setupKeyboard () {
    // Register the keys
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP)
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    this.sprintKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)

    // Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SHIFT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN
    ])
  }

  update () {
    /*let boundsA = this.player.getBounds()
    let boundsB = this.leaveCollider.getBounds()

    if(Phaser.Rectangle.intersects(boundsA, boundsB))
    {
      this.player.alpha = 0.2
    }
    else
    {
      this.player.alpha = 1
    }*/
    // Check state of keys to control main character
    var speed = 0
    var updown = 0

    if (this.rightKey.isDown) { speed++ }
    if (this.leftKey.isDown) { speed-- }
    if (this.upKey.isDown) { updown-- }
    if (this.downKey.isDown) { updown++ }
    if (this.sprintKey.isDown) {
      speed *= 2
      updown *= 2
    }
    else {
      this.player.body.velocity.x = 0
      this.player.body.velocity.y = 0
    }

    if (speed !== 0) {
      this.player.body.velocity.x = speed * 150
      // if (speed > 0)
      // {
      //   this.lastspeed = 1
      // }

      // else
      // {
      //   this.lastspeed = -1
      // }
      // if (updown === 0)
      // {
      //   this.lastupdown = 0
      // }
    }
    if (updown !== 0) {
      this.player.body.velocity.y = updown * 150
      // if (updown > 0)
      // {
      //   this.lastupdown = 1
      // }
      // else
      // {
      //   this.lastupdown = -1
      // }
      // if (speed === 0)
      // {
      //   this.lastspeed = 0
      // }

      // if (this.moveState === this.player.moveStates.STOPPED) {
      //   this.body.velocity.x = 0
      //   this.body.velocity.y = 0
      // }
    }

    // Update sprite facing direction
    // if (speed > 0 && !this.player.isFacingRight()) {
    //   this.player.makeFaceRight()
    // } else if (speed < 0 && !this.player.isFacingLeft()) {
    //   this.player.makeFaceLeft()
    // }

    // Update sprite movement state and playing audio
    if (Math.abs(speed) > 1) {
      // Player is running
      this.player.moveState = MainPlayer.moveStates.RUNNING
      if (!this.game.sounds.get('running').isPlaying) {
        this.game.sounds.play('running', config.SFX_VOLUME)
      }
    } else {
      // Player is walking or stopped
      this.game.sounds.stop('running')
      if (Math.abs(speed || updown) > 0) {
        if (this.rightKey.isDown) {
          this.player.moveState = MainPlayer.moveStates.WALKING_EAST
        }
        if (this.leftKey.isDown) {
          this.player.moveState = MainPlayer.moveStates.WALKING_WEST
        }
        if (this.upKey.isDown) {
          this.player.moveState = MainPlayer.moveStates.WALKING_NORTH
        }
        if (this.downKey.isDown) {
          this.player.moveState = MainPlayer.moveStates.WALKING_SOUTH
        }
      } else {
        this.player.moveState = MainPlayer.moveStates.STOPPED
      }
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

// Expose the class TestLevel to other files
export default TestLevel
