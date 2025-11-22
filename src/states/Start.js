/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'
import config from '../config'

/**
 * The StartMenu game state. This game state is a simple Start menu consisting of
 * buttons that take the player to the different menus and the actual game. All
 * assets are pre-loaded and cached in the Splash state so this must have run once
 * before loading this state.
 *
 * See Phaser.State for more about game states.
 */
class StartScreen extends Phaser.State {
  init () {
    // Set / Reset world bounds
    this.game.world.setBounds(0, 0, this.game.width, this.game.height)
  }

  preload () {
    // *** Load all the assets needed for next state ***
  }

  // Pre-load is done

  create () {
    // Set up the background  
    var imageBG = this.game.add.sprite(0, 0, 'MenuBG')
    imageBG.scale.setTo(0.3, 0.3)

    // Setup standard button configuration
    let buttonTextStyle = { font: "12px Arial", fill: "#ffffff", align: "center" }

    // Setup button for going to Level01
    let buttonLevel01
    //let buttonLevel01Text = this.game.add.text(this.game.world.centerX + 25, this.game.world.centerY - 275, "Center Level", buttonTextStyle)
    // buttonLevel01 = this.game.add.button(this.game.world.centerX - 220, this.game.world.centerY - 355, 'MenuButton', moveToLevel01, this, 1, 0, 2)
    buttonLevel01 = this.game.add.button(this.game.world.centerX - 375, this.game.world.centerY + 48, 'MenuButton', moveToTutorial, this, 1, 0, 2)

    // Setup for going to Control screen
    let buttonControls
    buttonControls = this.game.add.button(this.game.world.centerX - 375, this.game.world.centerY + 148, 'MenuButton', moveToControls, this, 1, 0, 2)

    // Setup for going to Credit screen
    let buttonCredit
    buttonCredit = this.game.add.button(this.game.world.centerX - 110, this.game.world.centerY + 148, 'MenuButton', moveToCredits, this, 1, 0, 2)

    // Setup button for Exit
    let buttonExit
    buttonExit = this.game.add.button(this.game.world.centerX - 110, this.game.world.centerY + 48, 'MenuButton', moveToExit, this, 1, 0, 2)

    // Setup button for going to Cozy's test level
    /*
    let buttonCozy // on controls
    //let buttonCozyText = this.game.add.text(this.game.world.centerX + 25, this.game.world.centerY - 150, "Cozy's Test Level", buttonTextStyle)
    // buttonCozy = this.game.add.button(this.game.world.centerX - 220, this.game.world.centerY - 230, 'MenuButton', moveToCozy, this, 1, 0, 2)
    buttonCozy = this.game.add.button(this.game.world.centerX - 375, this.game.world.centerY + 148, 'MenuButton', moveToLevel01, this, 1, 0, 2)

    // Setup button for going to Chris' test level
    let buttonChris // on credits
    //let buttonChrisText = this.game.add.text(this.game.world.centerX + 25, this.game.world.centerY - 25, "Chris' Test Level", buttonTextStyle)
    // buttonChris = this.game.add.button(this.game.world.centerX - 220, this.game.world.centerY - 105, 'MenuButton', moveToChris, this, 1, 0, 2)
    buttonChris = this.game.add.button(this.game.world.centerX - 110, this.game.world.centerY + 148, 'MenuButton', moveToLevel01, this, 1, 0, 2)

    // Setup button for going to Alex's test level
    let buttonAlex // on exit
    //let buttonAlexText = this.game.add.text(this.game.world.centerX + 25, this.game.world.centerY + 100, "Alex's Test Level", buttonTextStyle)
    // buttonAlex = this.game.add.button(this.game.world.centerX - 220, this.game.world.centerY + 20, 'MenuButton', moveToAlex, this, 1, 0, 2)
    buttonAlex = this.game.add.button(this.game.world.centerX - 110, this.game.world.centerY + 48, 'MenuButton', moveToTutorial, this, 1, 0, 2)

    // Setup button for going to the actual test level
    let buttonTest
    //let buttonTestText = this.game.add.text(this.game.world.centerX + 25, this.game.world.centerY + 225, "Test Level", buttonTextStyle)
    buttonTest = this.game.add.button(this.game.world.centerX + 140, this.game.world.centerY + 145, 'MenuButton', moveToTest, this, 1, 0, 2)
    */

    // added summer menu music
    if (!this.game.sounds.get('Funky_Chill_2_loop').isPlaying) {
      this.game.sounds.play('Funky_Chill_2_loop', config.MUSIC_VOLUME)
    }
  }
}

// Functions for moving to different game states
function moveToLevel01 () {
  this.state.start('Level01')
  this.game.sounds.stop('Funky_Chill_2_loop')
}

function moveToCredits () {
  this.state.start('CreditScreen')
}

function moveToControls () {
  this.state.start('ControlScreen')
}

function moveToTutorial () {
  this.state.start('Tutorial')
}

function moveToCozy () {
  this.state.start('CozyTest')
}

function moveToChris () { 
  this.state.start('ChrisTest')
}

function moveToTest () {
  this.state.start('TestLevel')
}

function moveToExit () {
  this.game.sounds.stop('Funky_Chill_2_loop')
  if (__NWJS__) {
    window.close()
  }  
}

// Expose the class StartScreen to other files
export default StartScreen
