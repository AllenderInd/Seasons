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
class ControlScreen extends Phaser.State {
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
    //this.bg= this.game.add.tileSprite(0, 0, this.game.stage.bounds.width, this.game.stage.bounds.height, 'assets/images/UI/Spring_GrassTile.png')
    var imageBG = this.game.add.sprite(0, 0, 'ControlBG')
    imageBG.scale.setTo(0.6, 0.6)

    // added summer menu music
    if (!this.game.sounds.get('Funky_Chill_2_loop').isPlaying) {
      this.game.sounds.play('Funky_Chill_2_loop', config.MUSIC_VOLUME)
    }

    // Setup the key objects
    this.setupKeyboard()
  }

  // Set up the keys to be used in game
  setupKeyboard () {
    // Register the keys
    // Continue through the screen
    this.nextKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E)

    // Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.E
    ])
  }

  // Runs every frame
  update () {
    if (this.nextKey.isDown)
    {
      this.state.start('StartScreen')
    }
  }
}

// Expose the class StartScreen to other files
export default ControlScreen
