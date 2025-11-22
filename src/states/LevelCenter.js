/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import the main player sprite
// import MainPlayer from '../sprites/Player'
import CozyPlayer from '../sprites/CozyPlayer'
import Wind from '../sprites/Wind'

// Import config settings
import config from '../config'
import NormalEnemy from '../sprites/Enemy_Normal'
import WallEnemy from '../sprites/Enemy_Wall'
import UberEnemy from '../sprites/Enemy_Uber'
import ShootEnemy from '../sprites/Enemy_Shoot'
import Pile from '../sprites/Leaf_Pile'

/**
 * The first main level of the game. This game state is the full level with puzzles, season
 * changing, abilities, enemies and all main mechanics.
 * It also is the center area for the larger puzzle that makes up 3-4 game states. Since a level
 * can usually occur more than once during a play session, and will occur as the player moves
 * through puzzles, assume this state CAN be re-entered. All assets are pre-loaded and cached
 * in the Splash state so this must have run once before loading this state.
 *
 * See Phaser.State for more about game states.
 */
class LevelCenter extends Phaser.State {
  init () {}

  preload () {}

  create () {
    // Reference the game (this is for the pause menu)
    var currentGame = this.game
    var gameState = this.state
    var justThis = this
    

    // Create the level collision map
    this.map = this.game.add.tilemap('Center_Level')

    this.map.addTilesetImage('Summer_Map_Center', 'Summer_Center_BG')
    this.map.addTilesetImage('Fall_Map_Center', 'Fall_Center_BG')
    this.map.addTilesetImage('Winter_Map_Center', 'Winter_Center_BG')
    
    this.map.addTilesetImage('Center_Level', 'Center_Level_BG')
    this.CurrentBackground = this.map.createLayer('BackgroundTileLayer')

    this.CurrentBackground.resizeWorld()
    this.game.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    // Create Collision Groups
    this.windCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.terrainCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.winterCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.chasmCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.missingCollisionGroup = this.game.physics.p2.createCollisionGroup()

    // Reads in all polygons under object layer 'DenseTreeCollision', sets them to a collision group
    // and makes them collidable
    let customcollider = this.map.objects['DenseTreeCollision']
    customcollider.forEach(element => {
      this.Collider = this.game.add.sprite(element.x, element.y)
      this.game.physics.p2.enable(this.Collider)
      this.Collider.body.debug = __DEV__
      this.Collider.body.addPolygon({}, element.polygon)
      this.Collider.body.static = true
      this.Collider.body.setCollisionGroup(this.terrainCollisionGroup)
      this.Collider.body.collides([this.playerCollisionGroup, this.enemyCollisionGroup, this.winterCollisionGroup])
    })

    this.game.ChasmGroup = new Array()
    // Reads in all polygons under object layer 'ChasmCollision', sets them to a collision group
    // and makes them collidable
    let Chasmcollider = this.map.objects['ChasmCollisions']
    Chasmcollider.forEach(element => {
      this.Collider = this.game.add.sprite(element.x, element.y)
      this.game.physics.p2.enable(this.Collider)
      this.Collider.body.debug = __DEV__
      this.Collider.body.addPolygon({}, element.polygon)
      this.Collider.body.static = true
      this.game.ChasmGroup.push(this.Collider)
      this.Collider.body.setCollisionGroup(this.chasmCollisionGroup)
      this.Collider.body.collides([this.playerCollisionGroup, this.enemyCollisionGroup])
    })

    this.dashing = true
    this.dashTimer = 0

    // Reads in all polygons under object layer 'LeafPositions'
    // let leafcollider = this.map.objects['LeafPositions']
    // leafcollider.forEach(element => {
    //   this.leafPile = this.game.add.sprite(element.x, element.y)
    //   this.game.physics.p2.enable(this.leafPile)
    //   this.leafPile.body.debug = __DEV__
    //   this.leafPile.body.addPolygon({}, element.polygon)
    //   this.leafPile.body.static = true
    // this.Collider.body.setCollisionGroup(this.terrainCollisionGroup)
    // this.Collider.body.collides([this.playerCollisionGroup, this.enemyCollisionGroup, this.winterCollisionGroup])
    // })

    // Assigns player Start postion from tiled object
    var PlayerStart = this.map.objects['SpritePositions'][0]

    // Create and add the main player object
    this.player = new CozyPlayer({
      game: this.game,
      x: PlayerStart.x,
      y: PlayerStart.y,
      parentLevel: this
    })

    // Starts the camera above the player
    this.camera.setPosition(PlayerStart.x, PlayerStart.y)
    // Reference the player (this is for the pause menu)
    var currentPlayer = this.player

    // Initilze basic enemy array
    this.game.NormalEnemyGroup = new Array()
    this.game.WallEnemyGroup = new Array()
    this.game.UberEnemyGroup = new Array()
    this.game.RangedEnemyGroup = new Array()
    this.game.LeafPileGroup = new Array()    
    // Creates all basic enemies and places them in the world and addes them to an array NormalEnemyGroup
    // for starting the ai and addes then to respective collision group
    let EnemyCreator = this.map.objects['BasicEnemyPositions']
    EnemyCreator.forEach(element => {
      this.BasicEnemy = new NormalEnemy({
        game: this.game,
        x: element.x,
        y: element.y,
        parentLevel: this
      })
      this.BasicEnemy.body.setCollisionGroup(this.enemyCollisionGroup)
      this.BasicEnemy.body.collides([this.windCollisionGroup, this.winterCollisionGroup, this.terrainCollisionGroup, this.chasmCollisionGroup, this.missingCollisionGroup])
      this.BasicEnemy.body.collides(this.playerCollisionGroup, this.BasicEnemy.attackTest, this)
      this.game.add.existing(this.BasicEnemy)
      this.game.NormalEnemyGroup.push(this.BasicEnemy)
    })

    // Creates all basic enemies and places them in the world and addes them to an array wallEnemyGroup
    // for starting the ai
    let WallEnemyCreator = this.map.objects['WallEnemyPositions']
    WallEnemyCreator.forEach(element => {
      this.EnemyWall = new WallEnemy({
        game: this.game,
        x: element.x,
        y: element.y
      })
      this.EnemyWall.body.setCollisionGroup(this.enemyCollisionGroup)
      this.EnemyWall.body.collides([this.playerCollisionGroup, this.windCollisionGroup, this.winterCollisionGroup, this.terrainCollisionGroup, this.chasmCollisionGroup, this.missingCollisionGroup])
      this.game.add.existing(this.EnemyWall)
      this.game.WallEnemyGroup.push(this.EnemyWall)
    })

    // Creates all basic enemies and places them in the world and addes them to an array uberEnemyGroup
    // for starting the ai and addes then to respective collision group
    let UberEnemyCreator = this.map.objects['UberEnemyPositions']
    UberEnemyCreator.forEach(element => {
      this.UberEnemy = new UberEnemy({
        game: this.game,
        x: element.x,
        y: element.y,
        parentLevel: this
      })
      this.UberEnemy.body.setCollisionGroup(this.enemyCollisionGroup)
      this.UberEnemy.body.collides([this.windCollisionGroup, this.winterCollisionGroup, this.terrainCollisionGroup, this.chasmCollisionGroup, this.missingCollisionGroup])
      this.UberEnemy.body.collides(this.playerCollisionGroup, this.UberEnemy.attackTest, this)
      this.game.add.existing(this.UberEnemy)
      this.game.UberEnemyGroup.push(this.UberEnemy)
    })

    // Creates all ranged enemies and places them in the world and addes them to an array rangedEnemyGroup
    // for starting the ai and addes then to respective collision group
    let RangedEnemyCreator = this.map.objects['RangedEnemyPositions']
    RangedEnemyCreator.forEach(element => {
      this.RangedEnemy = new ShootEnemy({
        game: this.game,
        x: element.x,
        y: element.y,
        parentLevel: this
      })
      this.RangedEnemy.body.setCollisionGroup(this.enemyCollisionGroup)
      this.RangedEnemy.body.collides([this.windCollisionGroup, this.winterCollisionGroup, this.terrainCollisionGroup, this.chasmCollisionGroup, this.missingCollisionGroup])
      this.RangedEnemy.body.collides(this.playerCollisionGroup)
      this.game.add.existing(this.RangedEnemy)
      this.game.RangedEnemyGroup.push(this.RangedEnemy)
    })

    let PileCreator = this.map.objects['LeafPositions']
    PileCreator.forEach(element => {
      this.LeafPile = new Pile({
        game: this.game,
        x: element.x,
        y: element.y,
        parentLevel: this
      })

      this.game.add.existing(this.LeafPile)
      this.game.LeafPileGroup.push(this.LeafPile)
    })

    // Create and add the wind object the player can produce
    this.wind = new Wind({
      game: this.game,
      x: 0,
      y: 0
    })

    // Sets camera to follow player
    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1)

    // Adds exitdoor
    var DoorPos = this.map.objects['DoorPositions'][0]
    this.DoorOverlay = this.game.add.sprite(DoorPos.x, DoorPos.y, 'ExitBoulder')
    this.DoorOverlay.frame = 0

    // Add player and wind to scene
    this.game.add.existing(this.player)
    this.game.add.existing(this.wind)
    // this.game.add.existing(this.enemy2)
    this.wind.kill()

    // Add collectible tokens
    var winterTokenPos = this.map.objects['TokenPositions'][0]
    this.winterTokenPos = this.game.add.sprite(winterTokenPos.x, winterTokenPos.y, 'CollectTokens')
    this.winterTokenPos.frame = 0
    var fallTokenPos = this.map.objects['TokenPositions'][1]
    this.fallTokenPos = this.game.add.sprite(fallTokenPos.x, fallTokenPos.y, 'CollectTokens')
    this.fallTokenPos.frame = 1
    var summerTokenPos = this.map.objects['TokenPositions'][2]
    this.summerTokenPos = this.game.add.sprite(summerTokenPos.x, summerTokenPos.y, 'CollectTokens')
    this.summerTokenPos.frame = 3
    var springTokenPos = this.map.objects['TokenPositions'][3]
    this.springTokenPos = this.game.add.sprite(springTokenPos.x, springTokenPos.y, 'CollectTokens')
    this.springTokenPos.frame = 2

    // Adding tree overlay
    this.treeOverlay = this.game.add.sprite(0, 0, 'Center_Level_Tree_Overlay')

    

    // Apply objects put into the scene to their collision groups    
    this.wind.body.setCollisionGroup(this.windCollisionGroup)
    this.player.body.setCollisionGroup(this.playerCollisionGroup)

    // Set collision parameters for objects
    this.wind.body.collides(this.enemyCollisionGroup, this.wind.push, this) // Activates the PUSH function when collided with
    // this.enemy2.body.collides([this.windCollisionGroup, this.playerCollisionGroup, this.terrainCollisionGroup, this.winterCollisionGroup])
    this.BasicEnemy.body.collides([this.windCollisionGroup, this.playerCollisionGroup, this.terrainCollisionGroup, this.winterCollisionGroup])
    this.player.body.collides([this.enemyCollisionGroup, this.terrainCollisionGroup, this.winterCollisionGroup, this.chasmCollisionGroup])

    // Start playing the background music
    // this.game.sounds.play('sunny', config.MUSIC_VOLUME)
    this.game.sounds.play('music_calm_tree_of_life', config.MUSIC_VOLUME, true)

    // Setup the key objects
    this.setupKeyboard()

    // Turn off gravity
    this.game.physics.p2.gravity.y = 0

    // Player Health
    this.player.maxHealth = 3
    this.player.playerHealth = 3
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
    // Health indicators
    this.healthSun01 = this.game.add.sprite(1075, 10, 'PlayerHealthSun')
    this.healthSun01.scale.setTo(0.5, 0.5)
    this.healthSun01.fixedToCamera = true
    this.healthSun02 = this.game.add.sprite(1160, 10, 'PlayerHealthSun')
    this.healthSun02.scale.setTo(0.5, 0.5)
    this.healthSun02.fixedToCamera = true
    this.healthSun03 = this.game.add.sprite(1245, 10, 'PlayerHealthSun')
    this.healthSun03.scale.setTo(0.5, 0.5)
    this.healthSun03.fixedToCamera = true
    // Season/Ability indicators
    this.seasonIndicator = this.game.add.sprite(20, 590, 'SeasonIndicators')
    this.seasonIndicator.fixedToCamera = true
    this.abilityIndicator = this.game.add.sprite(320, 690, 'AbilityIndicators')
    this.abilityIndicator.fixedToCamera = true
    // Collectibles
    this.springToken = this.game.add.sprite(1080, 100, 'Collectibles', 6)
    this.springToken.scale.setTo(0.4)
    this.springToken.fixedToCamera = true
    this.summerToken = this.game.add.sprite(1140, 100, 'Collectibles', 7)
    this.summerToken.scale.setTo(0.4)
    this.summerToken.fixedToCamera = true
    this.fallToken = this.game.add.sprite(1200, 100, 'Collectibles', 5)
    this.fallToken.scale.setTo(0.4)
    this.fallToken.fixedToCamera = true
    this.winterToken = this.game.add.sprite(1260, 100, 'Collectibles', 4)
    this.winterToken.scale.setTo(0.4)
    this.winterToken.fixedToCamera = true
    this.springCollected = false
    this.summerCollected = false
    this.fallCollected = false
    this.winterCollected = false

    // Setup win condition
    this.gameWin = false
    this.runWinOnce = true
    this.winDelay = 0
    this.runDeathOnce = true
    this.deathDelay = 0

    // Setup Pause Menu
    var menu, resumeButton, exitButton, seasonalIcon, gameSounds
    gameSounds = this.game.sounds
    seasonalIcon = this.seasonIndicator // reference for pause functions
    seasonalIcon.inputEnabled = true
    seasonalIcon.events.onInputUp.add(function () {
      // When the pause button is pressed, we pause the game
      currentGame.paused = true

      // Restrict multiple clicks to the button
      seasonalIcon.inputEnabled = false

      // Then add the menu and buttons
      menu = currentGame.add.sprite(currentGame.camera.x, currentGame.camera.y, 'PauseMenu')
      menu.scale.setTo(0.3, 0.3)
      menu.fixedToCamera = true
      resumeButton = currentGame.add.button(currentGame.camera.x + 270, currentGame.camera.y + 525, 'MenuButton', unpause, this, 1, 0, 2)
      resumeButton.scale.setTo(1.3, 1.3)
      resumeButton.fixedToCamera = true
      exitButton = currentGame.add.button(currentGame.camera.x + 630, currentGame.camera.y + 525, 'MenuButton', moveToMenu, this, 1, 0, 2)
      exitButton.scale.setTo(1.3, 1.3)
      exitButton.fixedToCamera = true
    })

    // Setup Unpausing
    function unpause ()
    {
      // Only run if the game is currently paused
      if (currentGame.paused)
      {
        menu.destroy()
        resumeButton.destroy()
        exitButton.destroy()
        seasonalIcon.inputEnabled = true
        currentGame.paused = false
      }
    }

    // Return to the main menu
    function moveToMenu ()
    {
      if (currentGame.paused)
      {
        currentGame.paused = false
        gameSounds.stop('music_calm_tree_of_life')
        gameState.start('StartScreen')
      }
    }
  }

  // Go to the main menu
  moveToMenu ()
  {
    this.game.sounds.stop('TD_Game_Over_Slow_Loop')
    this.state.start('StartScreen')
  }

  // Restart the level
  restartLevel ()
  {
    this.game.sounds.stop('TD_Game_Over_Slow_Loop')
    this.state.restart('Level01')
  }

  // Check for two sprites overlapping
  checkOverlap (sprite1, sprite2)
  {
    var boundsA = sprite1.getBounds()
    var boundsB = sprite2.getBounds()

    var wid = boundsB.width
    var hei = boundsB.height

    boundsB.width = 80
    boundsB.x += (wid / 2) - 40

    boundsB.height = 80
    boundsB.y += (hei / 2) - 40

    wid = boundsA.width
    hei = boundsA.height

    boundsA.width = 80
    boundsA.x += (wid / 2) - 40

    boundsA.height = 120
    boundsA.y += (hei / 2 ) - 80

    return Phaser.Rectangle.intersects(boundsA, boundsB)
  }

  // Update the sprite for the door depending on which tokens are collected
  // Run through all of springs checks, then summers, then falls, and
  // finally the last check for winter
  updateExitDoor ()
  {
    // Check for which tokens have been collected
    if (this.springCollected)
    {
      // Spring and summer check
      if (this.summerCollected)
      {
        // Spring and summer and fall check
        if (this.fallCollected)
        {
          // All tokens collected
          if (this.winterCollected)
          {
            this.DoorOverlay.frame = 15
            this.game.sounds.play('rock_door_slide_block_move_drag_loop1', config.SFX_VOLUME, false)
          }
          // Spring and summer and fall
          else
          {
            this.DoorOverlay.frame = 12
          }
        }
        // Spring and summer and winter
        else if (this.winterCollected)
        {
          this.DoorOverlay.frame = 11
        }
        // Spring and summer
        else
        {
          this.DoorOverlay.frame = 10
        }
      }
      // Spring and fall and winter check
      else if (this.fallCollected)
      {
        // Spring and fall and winter
        if (this.winterCollected)
        {
          this.DoorOverlay.frame = 14
        }
        // Spring and fall
        else
        {
          this.DoorOverlay.frame = 6
        }
      }
      // Spring and winter
      else if (this.winterCollected)
      {
        this.DoorOverlay.frame = 9
      }
      // Only spring collected
      else
      {
        this.DoorOverlay.frame = 1
      }
    }
    else if (this.summerCollected)
    {
      // Summer and fall check
      if (this.fallCollected)
      {
        // Summer and fall and winter
        if (this.winterCollected)
        {
          this.DoorOverlay.frame = 13
        }
        // Summer and fall
        else
        {
          this.DoorOverlay.frame = 5
        }
      }
      // Summer and winter
      else if (this.winterCollected)
      {
        this.DoorOverlay.frame = 8
      }
      // Only summer collected
      else
      {
        this.DoorOverlay.frame = 2
      }
    }
    else if (this.fallCollected)
    {
      // Fall and winter check
      if (this.winterCollected)
      {
        // Fall and winter
        if (this.winterCollected)
        {
          this.DoorOverlay.frame = 7
        }
      }
      // Only fall collected
      else
      {
        this.DoorOverlay.frame = 4
      }
    }
    // Only winter collected
    else if (this.winterCollected)
    {
      this.DoorOverlay.frame = 3
    }
  }

  // Bring UI to top
  keepUITop ()
  {
    this.seasonIndicator.bringToTop()
    this.abilityIndicator.bringToTop()
    this.healthSun01.bringToTop()
    this.healthSun02.bringToTop()
    this.healthSun03.bringToTop()
    this.winterToken.bringToTop()
    this.fallToken.bringToTop()
    this.springToken.bringToTop()
    this.summerToken.bringToTop()
  }

  // Switch the currently active season after button press
  changeSeason (newSeason)
  {
    var lastSeason = this.currentSeason
    // var oldKey = ''
    // var newKey = ''
    this.oldKey = ''
    this.newKey = ''
    // var keyOld
    // var keyNew
    if (lastSeason === this.Seasons.SPRING)
    {
      this.game.oldKey = 1
    }
    // resets camera fade
    function resetFade () {
      this.game.camera.resetFX()
    }

    // function mapReplace () {
    //   oldKey = keyOld
    //   newKey = keyNew
    //   this.game.map.replace(this.oldKey, this.newKey)
    // }
    // Switch season variables
    switch (newSeason)
    {
      case 1:
        this.game.camera.fade(0xffffff, 500)
        // this.game.camera.flash(0xffffff, 2000)
        this.game.camera.onFadeComplete.add(() => {
          this.game.sounds.play('slash', config.SWITCH_SFX)
          this.treeOverlay.destroy()
          this.treeOverlay = this.game.add.sprite(0, 0, 'Center_Level_Tree_Overlay')
          this.keepUITop()
          this.currentSeason = this.Seasons.SPRING
          this.seasonIndicator.frame = 0
          this.game.newKey = 1
          this.map.replace(this.game.oldKey, this.game.newKey)
          this.game.oldKey = this.game.newKey
          this.game.camera.resetFX()
        })
        
        break
      case 2:
        this.game.camera.fade(0xffffff,500)
        // this.game.camera.flash(0xffffff, 2000)
        this.game.camera.onFadeComplete.add(() => {
          this.game.sounds.play('slash', config.SWITCH_SFX)
          this.treeOverlay.destroy()
          this.treeOverlay = this.game.add.sprite(0, 0, 'Summer_Level_Tree_Overlay')
          this.keepUITop()
          this.currentSeason = this.Seasons.SUMMER
          this.seasonIndicator.frame = 1
          this.game.newKey = 2
          this.map.replace(this.game.oldKey, this.game.newKey)
          this.game.oldKey = this.game.newKey
          this.game.camera.resetFX()
        })
        
        // this.game.camera.onFadeComplete.add(resetFade, this)
        break
      case 3:
        this.game.camera.fade(0xffffff, 500)
        // this.game.camera.flash(0xffffff, 2000)
        this.game.camera.onFadeComplete.add(() => {
          this.game.sounds.play('slash', config.SWITCH_SFX)
          this.treeOverlay.destroy()
          this.treeOverlay = this.game.add.sprite(0, 0, 'Fall_Level_Tree_Overlay')
          this.keepUITop()
          this.currentSeason = this.Seasons.FALL
          this.seasonIndicator.frame = 2
          this.game.newKey = 3
          this.map.replace(this.game.oldKey, this.game.newKey)
          this.game.oldKey = this.game.newKey
          this.game.camera.resetFX()
        })
        
        // this.game.camera.onFadeComplete.add(resetFade, this)
        break
      case 4:
        this.game.camera.fade(0xffffff, 500)
        // this.game.camera.flash(0xffffff, 2000)
        this.game.camera.onFadeComplete.add(() => {
          this.game.sounds.play('slash', config.SWITCH_SFX)
          this.treeOverlay.destroy()
          this.treeOverlay = this.game.add.sprite(0, 0, 'Winter_Level_Tree_Overlay')
          this.keepUITop()
          this.currentSeason = this.Seasons.WINTER
          this.seasonIndicator.frame = 3
          this.game.newKey = 4
          this.map.replace(this.game.oldKey, this.game.newKey)
          this.game.oldKey = this.game.newKey
          this.game.camera.resetFX()
        })
        
        // this.game.camera.onFadeComplete.add(resetFade, this)
        break
      default:
        this.currentSeason = this.Seasons.SPRING
        this.seasonIndicator.frame = 0
        break
    }

    // Set cooldown to be active
    this._activeCooldown = true
    this._season_cooldown = 180
    this.seasonIndicator.alpha = 0.7
  }

  // Set up the keys to be used in game
  setupKeyboard () {
    // Register the keys
    // Movement keys
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    this.sprintKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP)
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    // Action keys
    this.actionKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E)
    this.springKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    this.summerKey = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    this.fallKey = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    this.winterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR)

    // Development Testing
    this.dealDamage = this.game.input.keyboard.addKey(Phaser.Keyboard.H)

    // Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SHIFT, Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN, Phaser.Keyboard.E, Phaser.Keyboard.ONE, Phaser.Keyboard.TWO,
      Phaser.Keyboard.THREE, Phaser.Keyboard.FOUR, Phaser.Keyboard.H
    ])
  }

  // Deal damage to the player
  playerDamage ()
  {
    this.player.damage(1)

    this.invulnerable = true
    this.invulnerable_countdown = 120
  }

  resetPlayerHealth()
  {
    this.player.playerHealth = 3
    this.healthSun01.loadTexture('PlayerHealthSun')
    this.healthSun02.loadTexture('PlayerHealthSun')
    this.healthSun03.loadTexture('PlayerHealthSun')
  }

  // Check for a chasm collision
  chasmCheck (middash)
  {
    if (middash)
    {
      this.game.ChasmGroup.forEach(element => {
        element.body.setCollisionGroup(this.missingCollisionGroup)
      })

      this.dashing = false
    }
    else if (!this.dashing)
    {
      this.dashTimer += 1
      if (this.dashTimer > 20)
      {
        this.game.ChasmGroup.forEach(element => {
          element.body.setCollisionGroup(this.chasmCollisionGroup)
        })
        this.dashing = true
        this.dashTimer = 0
      }
    }
  }

  // plays animation depending on season for gust and ice shot
  // skillAnimation () {
  //   if (this.currentSeason === this.Seasons.SPRING && this.actionKey.isDown) {
  //     if (CozyPlayer.updown === 0) {
  //       console.log('dashnorth')
  //       this.player.moveState = CozyPlayer.moveStates.DASHING_NORTH
  //     }
  //     if (CozyPlayer.updown < -1) {
  //       this.player.moveState = CozyPlayer.moveStates.DASHING_SOUTH
  //     }
  //     if (CozyPlayer.speed === 1) {
  //       this.player.moveState = CozyPlayer.moveStates.DASHING_EAST
  //     }
  //     if (CozyPlayer.speed === -1) {
  //       this.player.moveState = CozyPlayer.moveStates.DASHING_WEST
  //     }
  //   } else if (this.currentSeason === this.Seasons.SUMMER) {
  //     // this.abilityIndicator.frame = 11
  //   } else if (this.currentSeason === this.Seasons.WINTER) {
  //     // this.abilityIndicator.frame = 1
  //   }
  //     this.player.moveState = CozyPlayer.moveStates.DASHING_NORTH
  //   }
  // }
  stealthPiles () {
    this.game.sounds.play('stealth', 0.75, false)
  }
  // Runs every frame
  update () {
    // Check that the player isn't dead
    if (!this.player.playerDead)
    {
      // Check state of keys to control main character
      this.player.movement(this.currentSeason, this.upKey.isDown, this.downKey.isDown, this.leftKey.isDown, this.rightKey.isDown, this.actionKey.isDown, this, this.wind)
      
      // Modify the HUD to represent the correct amount of health
      if (this.player.playerHealth <= 2)
      {
        this.healthSun01.loadTexture('PlayerHealthMoon')
        if (this.player.playerHealth <= 1)
        {
          this.healthSun02.loadTexture('PlayerHealthMoon')
          if (this.player.playerHealth <= 0)
          {
            this.healthSun03.loadTexture('PlayerHealthMoon')
          }
        }
      }

      // Leaf Piles!
      if (this.currentSeason === 3)
      {
        this.game.LeafPileGroup.forEach(element => {
          element.alpha = 1
          if (this.checkOverlap(this.player, element))
          { 
            this.player.alpha = 0.4
            this.player.invisible = true
            this.player.inLeaves = true
            // this.game.stealthPiles()
          }
        })
      }
      else
      {
        this.game.LeafPileGroup.forEach(element => {
          element.alpha = 0.1
        })
      }
      
      if (this.player._visible_timer <= 0 && !this.player.inLeaves)
      {
        this.player.alpha = 1
        this.player.invisible = false
      }

      this.player.inLeaves = false

      // Check for collecting tokens
      // Spring token overlap
      if (!this.springCollected)
      {
        if (this.checkOverlap(this.player, this.springTokenPos))
        {
          this.springToken.frame = 2
          this.springCollected = true
          this.game.sounds.play('collectable_item_bonus_01', config.SFX_VOLUME, false)
          this.springTokenPos.destroy()
          this.resetPlayerHealth()
          this.updateExitDoor()
        }
      }

      // Summer token overlap
      if (!this.summerCollected)
      {
        if (this.checkOverlap(this.player, this.summerTokenPos))
        {
          this.summerToken.frame = 3
          this.summerCollected = true
          this.game.sounds.play('collectable_item_bonus_01', config.SFX_VOLUME, false)
          this.summerTokenPos.destroy()
          this.resetPlayerHealth()
          this.updateExitDoor()
        }
      }

      // Fall token overlap
      if (!this.fallCollected)
      {
        if (this.checkOverlap(this.player, this.fallTokenPos))
        {
          this.fallToken.frame = 1
          this.fallCollected = true
          this.game.sounds.play('collectable_item_bonus_01', config.SFX_VOLUME, false)
          this.fallTokenPos.destroy()
          this.resetPlayerHealth()
          this.updateExitDoor()
        }
      }

      // Winter token overlap
      if (!this.winterCollected)
      {
        if (this.checkOverlap(this.player, this.winterTokenPos))
        {
          this.winterToken.frame = 0
          this.winterCollected = true
          this.game.sounds.play('collectable_item_bonus_01', config.SFX_VOLUME, false)
          this.winterTokenPos.destroy()
          this.resetPlayerHealth()
          this.updateExitDoor()
        }
      }

      // Check for game win
      if (this.checkOverlap(this.player, this.DoorOverlay))
      {
        if (this.springCollected && this.summerCollected && this.fallCollected && this.winterCollected)
        {
          this.winDelay++
          this.player.body.velocity.x = 0
          this.player.body.velocity.y = 0
          console.log(this.winDelay)

          if (this.runWinOnce)
          {
            this.gameWin = true
            this.winScreen = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'WinScreen')
            this.winScreen.scale.setTo(0.6, 0.6)
            this.game.sounds.stop('music_calm_tree_of_life')
            this.game.sounds.stop('rock_door_slide_block_move_drag_loop1')
            this.game.sounds.play('music_happy_high_pop_advertising_jingle', config.MUSIC_VOLUME, false)
            console.log('YOU HAVE WON THE GAME!!!')
            this.runWinOnce = false
          }

          if (this.winDelay >= 300)
          {
            this.game.sounds.stop('music_happy_high_pop_advertising_jingle')
            this.game.state.start('StartScreen')
          }
        }
        else
        {
          // console.log('Collect the rest of the tokens, then come back here')
        }
      }

      // Leaf pile overlap
      // if (this.checkOverlap(this.player, this.leafPile))
      // {
      //   console.log('leave pile overlap')
      // }

      // Checks Basic enemy AI
      this.game.NormalEnemyGroup.forEach(element => {
        element.moveToPlayer(this.player)
      })

      // Checks Uber Enemy AI
      this.game.UberEnemyGroup.forEach(element => {
        element.moveBetweenSpots(this.player)
      })

      // Checks Ranged Enemy AI
      this.game.RangedEnemyGroup.forEach(element => {
        element.moveBack(this.player, this)
      })

      // Checks Chasms and player
      // this.game.ChasmGroup.forEach(element => {
      //   element.moveBetweenSpots(this.player)
      // })

      // Check if the player just took damage
      if (this.dealDamage.isDown && !this.invulnerable)
      {
        this.playerDamage()
      }

      // Checks Wall Enemy AI
      this.game.WallEnemyGroup.forEach(element => {
        element.moveWall()
      })

      // Check if the player just took damage
      if (this.dealDamage.isDown && !this.invulnerable)
      {
        this.playerDamage()
      }

      // Countdown player invulnerability after damage
      if (this.invulnerable_countdown > 0) {
        // Count down the cooldown
        this.invulnerable_countdown--
        // console.log(this.invulnerable_countdown)
      }
      else
      {
        // Deactivate the cooldown
        this.invulnerable = false
      }

      // Check if there is an active season cooldown
      if (!this._activeCooldown)
      {
        this.seasonIndicator.alpha = 1
      }

      // Switch the ability cooldown icon
      if (this.player._activeCooldown) {
        // Set the next icon for cooldown
        if (this.player._action_cooldown > 90)
        {
          if (this.currentSeason === this.Seasons.SUMMER)
          {
            this.abilityIndicator.frame = 16
          }
          else if (this.currentSeason === this.Seasons.SPRING)
          {
            this.abilityIndicator.frame = 11
          }
          else if (this.currentSeason === this.Seasons.FALL)
          {
            this.abilityIndicator.frame = 6
          }
          else if (this.currentSeason === this.Seasons.WINTER)
          {
            this.abilityIndicator.frame = 1
          }
        }
        // Set the next icon for cooldown
        else if (this.player._action_cooldown > 60)
        {
          if (this.currentSeason === this.Seasons.SUMMER)
          {
            this.abilityIndicator.frame = 17
          }
          else if (this.currentSeason === this.Seasons.SPRING)
          {
            this.abilityIndicator.frame = 12
          }
          else if (this.currentSeason === this.Seasons.FALL)
          {
            this.abilityIndicator.frame = 7
          }
          else if (this.currentSeason === this.Seasons.WINTER)
          {
            this.abilityIndicator.frame = 2
          }
        }
        // Set the next icon for cooldown
        else if (this.player._action_cooldown > 30)
        {
          if (this.currentSeason === this.Seasons.SUMMER)
          {
            this.abilityIndicator.frame = 18
          }
          else if (this.currentSeason === this.Seasons.SPRING)
          {
            this.abilityIndicator.frame = 13
          }
          else if (this.currentSeason === this.Seasons.FALL)
          {
            this.abilityIndicator.frame = 8
          }
          else if (this.currentSeason === this.Seasons.WINTER)
          {
            this.abilityIndicator.frame = 3
          }
        }
        // Set the next icon for cooldown
        else
        {
          if (this.currentSeason === this.Seasons.SUMMER)
          {
            this.abilityIndicator.frame = 19
          }
          else if (this.currentSeason === this.Seasons.SPRING)
          {
            this.abilityIndicator.frame = 14
          }
          else if (this.currentSeason === this.Seasons.FALL)
          {
            this.abilityIndicator.frame = 9
          }
          else if (this.currentSeason === this.Seasons.WINTER)
          {
            this.abilityIndicator.frame = 4
          }
        }
      }
      // Set the next icon for cooldown
      else
      {
        if (this.currentSeason === this.Seasons.SUMMER)
        {
          this.abilityIndicator.frame = 15
        }
        else if (this.currentSeason === this.Seasons.SPRING)
        {
          this.abilityIndicator.frame = 10
        }
        else if (this.currentSeason === this.Seasons.FALL)
        {
          this.abilityIndicator.frame = 5
        }
        else if (this.currentSeason === this.Seasons.WINTER)
        {
          this.abilityIndicator.frame = 0
        }
      }

      // Used to change the seasons
      if (this.springKey.isDown && this.currentSeason !== 1 && !this._activeCooldown)
      {
        this.changeSeason(1)
      }
      else if (this.summerKey.isDown && this.currentSeason !== 2 && !this._activeCooldown)
      {
        this.changeSeason(2)
      }
      else if (this.fallKey.isDown && this.currentSeason !== 3 && !this._activeCooldown)
      {
        this.changeSeason(3)
      }
      else if (this.winterKey.isDown && this.currentSeason !== 4 && !this._activeCooldown)
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

      // Update sprite movement state and playing audio
      // if (Math.abs(this.player.speed) > 1) {
      //   // Player is running
      //   this.player.moveState = CozyPlayer.moveStates.RUNNING
      //   if (!this.game.sounds.get('running').isPlaying) {
      //     this.game.sounds.play('running', config.SFX_VOLUME)
      //   }
      // } else {
      // Player is walking or stopped
      // this.game.sounds.stop('running')
      if(this.player.shootTimer > 0)
      {
        switch(this.player.moveState)
        {
          case CozyPlayer.moveStates.WALKING_NORTH:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_NORTH
            break

          case CozyPlayer.moveStates.WALKING_SOUTH:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_SOUTH
            break

          case CozyPlayer.moveStates.WALKING_EAST:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_EAST
            break

          case CozyPlayer.moveStates.WALKING_WEST:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_WEST
            break

          case CozyPlayer.moveStates.IDLE_NORTH:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_NORTH
            break

          case CozyPlayer.moveStates.IDLE_SOUTH:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_SOUTH
            break

          case CozyPlayer.moveStates.IDLE_EAST:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_EAST
            break

          case CozyPlayer.moveStates.IDLE_WEST:
            this.player.moveState = CozyPlayer.moveStates.FREEZE_WEST
            break
        }
      }
      else if(this.player.middash)
      {
        if(Math.abs(this.player.dash_x) > 0)
        {
          if(this.player.dash_x > 0)
          {
            this.player.moveState = CozyPlayer.moveStates.DASHING_WEST
          }
          else
          {
            this.player.moveState = CozyPlayer.moveStates.DASHING_EAST
          }
        }
        else
        {
          if(this.player.dash_y > 0)
          {
            this.player.moveState = CozyPlayer.moveStates.DASHING_SOUTH
          }
          else
          {
            this.player.moveState = CozyPlayer.moveStates.DASHING_NORTH
          }
        }
      }
      else if(!this.player.windy)
      {
      if (Math.abs(this.player.speed || this.player.updown) > 0) {
        if (this.downKey.isDown) {
          if (this.leftKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_WEST
          } else if (this.rightKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_EAST
          } else if (this.downKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_SOUTH
          }
        } else if (this.upKey.isDown) {
          if (this.leftKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_WEST
          } else if (this.rightKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_EAST
          } else if (this.upKey.isDown) {
            this.player.moveState = CozyPlayer.moveStates.WALKING_NORTH
          }
        } else if (this.rightKey.isDown) {
          this.player.moveState = CozyPlayer.moveStates.WALKING_EAST
        } else if (this.leftKey.isDown) {
          this.player.moveState = CozyPlayer.moveStates.WALKING_WEST
        }
      } else {
        if(Math.abs(this.player.lastspeed) > 0)
        {
          if(this.player.lastspeed > 0)
          {
            this.player.moveState = CozyPlayer.moveStates.IDLE_EAST
          }
          else
          {
            this.player.moveState = CozyPlayer.moveStates.IDLE_WEST
          }
        }
        else
        {
          if(this.player.lastupdown > 0)
          {
            this.player.moveState = CozyPlayer.moveStates.IDLE_SOUTH
          }
          else
          {
            this.player.moveState = CozyPlayer.moveStates.IDLE_NORTH
          }
        }
      }
    }
    }
    // The player has died
    else
    {
      if (this.player.playerHealth <= 0)
      {
        this.healthSun03.loadTexture('PlayerHealthMoon')
      }
      this.seasonIndicator.inputEnabled = false
      this.deathDelay++

      if (this.runDeathOnce && this.deathDelay >= 140)
      {
        this.loseScreen = this.game.add.sprite(this.game.camera.x, this.game.camera.y, 'DefeatScreen')
        this.loseScreen.scale.setTo(0.6, 0.6)
        this.restartButton = this.game.add.button(this.game.camera.x + 270, this.game.camera.y + 525, 'MenuButton', this.restartLevel, this, 1, 0, 2)
        this.restartButton.scale.setTo(1.3, 1.3)
        this.endButton = this.game.add.button(this.game.camera.x + 630, this.game.camera.y + 525, 'MenuButton', this.moveToMenu, this, 1, 0, 2)
        this.endButton.scale.setTo(1.3, 1.3)
        this.runDeathOnce = false
        this.game.sounds.stop('rock_door_slide_block_move_drag_loop1')
      }
    }

    // TRAILER
    // this.player.alpha = 0
    // this.player.body.setCollisionGroup(this.terrainCollisionGroup)
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
export default LevelCenter
