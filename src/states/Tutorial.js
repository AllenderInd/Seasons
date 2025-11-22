/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'
import config from '../config'
/**
 * The CreditScreen game state. This game state shows the credits for the developers
 * of this game.
 *
 * See Phaser.State for more about game states.
 */
class Tutorial extends Phaser.State {
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
    this.tutBG = this.game.add.sprite(0, 0, 'TutorialOne')
    this.tutBG.scale.setTo(0.6, 0.6)

    // added summer menu music
    if (!this.game.sounds.get('Funky_Chill_2_loop').isPlaying) {
      this.game.sounds.play('Funky_Chill_2_loop', config.MUSIC_VOLUME)
    }

    // Setup the key objects
    this.setupKeyboard()

    // Setup counter for the tutorial slides
    this.tutorialNumber = 0
    this.keyStillDown = false
  }

  // Set up the keys to be used in game
  setupKeyboard () {
    // Register the keys
    // Continue through the screen
    this.nextKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    // Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.SPACEBAR
    ])
  }

  // Run through the tutorial slides
  changeScreen ()
  {
    this.tutorialNumber++

    if (this.tutorialNumber === 1)
    {
      this.tutBG.loadTexture('TutorialTwo')
    }
    else if (this.tutorialNumber === 2)
    {
      this.tutBG.loadTexture('TutorialThree')
    }
    else if (this.tutorialNumber === 3)
    {
      this.tutBG.loadTexture('TutorialFour')
    }
    else if (this.tutorialNumber === 4)
    {
      this.game.sounds.stop('Funky_Chill_2_loop')
      this.state.start('Level01')
    }
  }

  // Runs every frame
  update () {
    if (this.nextKey.justPressed()) {
      this.changeScreen()
    }
  }
}

// Expose the class StartScreen to other files
export default Tutorial
