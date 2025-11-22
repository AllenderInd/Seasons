// Import the entire 'phaser' namespace
import Phaser from 'phaser'

// Import needed functions from utils and config settings
import { centerGameObjects } from '../utils'
import config from '../config'

/**
 * The Splash game state. This game state displays a dynamic splash screen used
 * to communicate the progress of asset loading. It should ensure it is always
 * displayed some mimimum amount of time (in case the assets are already cached
 * locally) and it should have pre-loaded any assets it needs to display in Boot
 * before it is run. Generally only runs once, after Boot, and cannot be re-entered.
 *
 * See Phaser.State for more about game states.
 */
class Splash extends Phaser.State {
  // Initialize some local settings for this state
  init () {
    // When was this state started?
    this.started = this.game.time.time

    // Set / Reset world bounds
    this.game.world.setBounds(0, 0, this.game.width, this.game.height)

    // Re-Start Physics
    this.game.physics.p2 = null
    this.game.physics.startSystem(Phaser.Physics.P2JS)
    this.game.physics.p2.setImpactEvents(true)

    this.game.physics.p2.gravity.y = 700
    this.game.physics.p2.world.defaultContactMaterial.friction = 0.3
  }

  preload () {
    // Create sprites from the progress bar assets
    this.loaderBg = this.add.sprite(
      this.game.world.centerX, this.game.world.centerY + 500, 'loaderBg')
    this.loaderBar = this.add.sprite(
      this.game.world.centerX, this.game.world.centerY + 500, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    // Display the progress bar
    this.load.setPreloadSprite(this.loaderBar)
    this.startLogoSequence()

    // *** Load all the assets needed for next state ***

    // Load menu elements
    this.game.load.image('PauseMenu', 'assets/images/UI/SeasonsPauseMenu.png')
    this.game.load.image('DefeatScreen', 'assets/images/UI/DefeatScreen.png')
    this.game.load.image('WinScreen', 'assets/images/UI/VictoryScreen.png')
    this.game.load.image('MenuBG', 'assets/images/UI/SeasonsMenu.png')
    this.game.load.image('MenuButton', 'assets/images/UI/UI_MenuSun.png')

    // Load Credits and Controls
    this.game.load.image('CreditsBG', 'assets/images/Menus/Credits.png')
    this.game.load.image('ControlBG', 'assets/images/Menus/Controls.png')

    // Load Tutorial
    this.game.load.image('TutorialOne', 'assets/images/Menus/TutorialSlide_01.png')
    this.game.load.image('TutorialTwo', 'assets/images/Menus/TutorialSlide_02.png')
    this.game.load.image('TutorialThree', 'assets/images/Menus/TutorialSlide_03.png')
    this.game.load.image('TutorialFour', 'assets/images/Menus/TutorialSlide_04.png')

    // Load tokens
    this.game.load.spritesheet('CollectTokens', 'assets/images/SeasonTokens.png', 170, 200, 4)

    // Load Anemoi spritesheet
    this.load.spritesheet('player-main2', 'assets/images/Anemoi/Anemoi_Spritesheet.png', 466, 687, -1, 0, 0)
    
    // this.load.spritesheet('PlayerDash', 'assets/images/Anemoi/Anemoi_Dash_Cycle.png', 830, 730, -1, 0, 0)
    this.load.image('Anemoi', 'assets/images/Anemoi.png')

    // Load UI Elements
    this.game.load.spritesheet('SeasonIndicators', 'assets/images/UI/UI_Spritesheet_SeasonSwitch.png', 300, 300, 4)
    this.game.load.spritesheet('AbilityIndicators', 'assets/images/UI/UI_AbilitySpritesheet.png', 166.6, 204.25)
    this.game.load.image('PlayerHealthSun', 'assets/images/UI/UI_SunIcon.png')
    this.game.load.image('PlayerHealthMoon', 'assets/images/UI/UI_MoonIcon.png')
    this.game.load.spritesheet('Collectibles', 'assets/images/UI/UI_Collectibles.png', 175, 160, 8)

    // Load tile map Level_Center and assets
    this.game.load.tilemap('Center_Level', 'assets/images/Maps/Center_Level/Center_level.json', null, Phaser.Tilemap.TILED_JSON)
    this.game.load.image('Center_Level_BG', 'assets/images/Maps/Center_Level/map center.png')
    this.game.load.image('Center_Level_Tree_Overlay', 'assets/images/Maps/Center_Level/Center_map_tree_overlay.png')
    this.game.load.image('Summer_Level_Tree_Overlay', 'assets/images/Maps/Center_Level/Summer_Map_Tree_Overlay.png')
    this.game.load.image('Fall_Level_Tree_Overlay', 'assets/images/Maps/Center_Level/Fall_Map_Tree_Overlay.png')
    this.game.load.image('Winter_Level_Tree_Overlay', 'assets/images/Maps/Center_Level/Winter_Map_Tree_Overlay.png')
    this.game.load.image('Summer_Center_BG', 'assets/images/Maps/Center_Level/Summer_Map_Center.png')
    this.game.load.image('Fall_Center_BG', 'assets/images/Maps/Center_Level/Fall_Map_Center.png')
    this.game.load.image('Winter_Center_BG', 'assets/images/Maps/Center_Level/Winter_Map_Center.png')
    this.game.load.spritesheet('ExitBoulder', 'assets/images/Boulders.png', 240, 235)

    // Enemy Spritesheets
    this.game.load.spritesheet('Enemy_Basic_Sheet', 'assets/images/Enemies/Basic_enemy_Spritesheet.png', 275, 329, -1, 0, 0)
    this.game.load.spritesheet('Enemy_Shoot_Sheet', 'assets/images/Enemies/ranged_Sprite_sheet.png', 308, 262, -1, 0, 0)
    this.game.load.spritesheet('Enemy_Wall_Sheet', 'assets/images/Enemies/Wall_Enemy_Spritesheet.png', 519, 635, -1, 0, 0)
    this.game.load.spritesheet('Enemy_Uber_Sheet', 'assets/images/Enemies/Aggressive_Enemy_Spritesheet.png', 385, 481, -1, 0, 0)

    // Projectile Spritesheet
    this.game.load.spritesheet('Projectile_Sheet', 'assets/images/Projectiles_resize.png', 350, 350, -1, 0, 0)

    // Leaf Pile
    this.game.load.image('Leaves', 'assets/images/leaf pile.png')

    // The audiosprite with all music and SFX
    this.load.audioSprite('sounds', [
      'assets/audio/sounds.ogg', 'assets/audio/sounds.mp3',
      'assets/audio/sounds.m4a', 'assets/audio/sounds.ac3'
    ], 'assets/audio/sounds.json')
  }

  // Pre-load is done

  create () {
    // Setup the audio which should now be loaded
    this.setupAudio()
  }

  setupAudio () {
    // Load the audio sprite into the global game object (and also make a local variable)
    this.game.sounds = this.game.add.audioSprite('sounds')
  }

  // Called repeatedly after pre-load finishes and after 'create' has run
  update () {
    // Make sure the audio is not only loaded but also decoded before advancing
    if (this.doneWithLogos && this.game.sounds.get('Funky_Chill_2_loop').isDecoded) {
      this.state.start('StartScreen')
    }
  }

  startLogoSequence () {
    // Begin the logo process
    let myState = this
    let myCam = this.game.camera
    this.stage.backgroundColor = '#000000'
    myCam.fade(0x000000, 1)
    myCam.onFadeComplete.add(() => {
      myCam.onFadeComplete.removeAll()
      myState.makeSethsBasementLogo()
    })
  }

  makeSethsBasementLogo () {
    // Add the background audio
    this.basementAudio = this.game.add.audio('basement')

    // Add the logo to the screen and center it
    this.sethsBlogo = this.game.add.sprite(
      this.game.world.centerX, this.game.world.centerY, 'sethsBLogo')

    // Setup the text
    this.sethsBText1 = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY - this.sethsBlogo.height / 2 - 50,
      'A game made in')

    this.sethsBText2 = this.game.add.bitmapText(
      this.game.world.centerX,
      this.game.world.centerY + this.sethsBlogo.height / 2 + 50,
      'sethsBFont', 'Seth\'s Basement', 64)

    this.sethsBText3 = this.game.add.text(
      this.game.world.centerX,
      this.game.world.centerY + this.sethsBlogo.height / 2 + 150,
      'by ...')

    // Configure the non-bitmap text
    this.sethsBText1.font = this.sethsBText3.font = 'Arial'
    this.sethsBText1.padding.set(10, 16)
    this.sethsBText3.padding.set(10, 16)
    this.sethsBText1.fontSize = this.sethsBText3.fontSize = 40
    this.sethsBText1.fontWeight = this.sethsBText3.fontWeight = 'bold'
    this.sethsBText1.stroke = this.sethsBText3.stroke = '#000000'
    this.sethsBText1.strokeThickness = this.sethsBText3.strokeThickness = 4
    this.sethsBText1.fill = this.sethsBText3.fill = '#FFFFFF'

    // Center everything
    centerGameObjects([this.sethsBlogo, this.sethsBText1,
      this.sethsBText2, this.sethsBText3])

    // Setup transition fade to happen when audio stops
    let myState = this
    let myCam = this.game.camera
    setTimeout(() => {
      this.basementAudio.fadeOut(1000)
      myCam.fade(0x000000, 1000, false, 1.0)
      myCam.onFadeComplete.add(() => {
        // Reset signal
        myCam.onFadeComplete.removeAll()

        // Remove previous logo
        myState.sethsBlogo.destroy()
        myState.sethsBText1.destroy()
        myState.sethsBText2.destroy()
        myState.sethsBText3.destroy()

        // Create next logo
        myState.makeTeamLogo()
      })
    }, 4000)

    // Fade in from black
    myCam.flash(0x000000, 1000)

    // Start the audio
    this.basementAudio.play()
  }

  makeTeamLogo () {
    // Set final background color
    this.stage.backgroundColor = '#000000'

    // Add the logo to the screen and center it
    this.logo = this.game.add.sprite(
      this.game.world.centerX, this.game.world.centerY - 70, 'logo')

    /*
      this.teamName = this.game.add.bitmapText(
      this.game.world.centerX,
      this.game.world.centerY + this.logo.height / 2 - 75,
      'logoFont', '$ystem Atla$', 100)
    */

    centerGameObjects([this.logo])

    // Setup transition fade to happen after timeout
    let myState = this
    let myCam = this.game.camera
    setTimeout(() => {
      myCam.onFadeComplete.add(() => {
        myState.doneWithLogos = true
      })
      myCam.fade(0x000000, 1000, false, 1.0)
    }, 4000)

    // Fade in from black
    myCam.flash(0x000000, 1000)
  }
}

// Expose the Splash class for use in other modules
export default Splash
