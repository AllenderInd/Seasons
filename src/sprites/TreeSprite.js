/* globals __DEV__ */

// Import the entire 'phaser' namespace
import Phaser from 'phaser'

class TreeSprite extends Phaser.Sprite {
  constructor (game, x, y, spriteKey, frame) {
    // Initialize object basics
    super(game, x, y, spriteKey, frame)
    this.name = 'Tree'

    // Create a P2 physics body for this sprite
    this.game.physics.p2.enable(this)
    this.body.debug = __DEV__
    this.body.static = true
  }
}

// Expose the MainPlayer class to other files
export default TreeSprite
