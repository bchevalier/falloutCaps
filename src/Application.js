
// devkit and module imports
import animate;
import device;
import ui.StackView as StackView;
// import ui.View as View;
import ui.TextView as TextView;
// import ui.ImageView as ImageView;
// import ui.SpriteView as SpriteView;
// import ui.ScoreView as ScoreView;
// import ui.ParticleEngine as ParticleEngine;

// game imports
import src.config as config;
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
import src.soundController as soundController;

/**
 * Application Class
 * ~ automatically instantiated by devkit
 * ~ handles game initialization and loop
 */
exports = Class(GC.Application, function () {

  /**
   * initUI
   * ~ called automatically by devkit
   * ~ initialize view hierarchy and game elements
   */
  this.initUI = function () {
    var titleScreen = new TitleScreen();
    var gameScreen = new GameScreen();

    this.view.style.backgroundColor = '#fff';

    // Add a new StackView to the root of the scene graph
    // create everything at a width of 320 with a 16:9 ratio
    // then scale to fit horizontally
    var rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: config.viewWidth,
      height: config.viewHeight,
      clip: true,
      scale: device.width / config.viewWidth
    });

    titleScreen.launchUI();
    rootView.push(titleScreen);

    var sound = soundController.getSound();


   /* Listen for an event dispatched by the loading screen.
    * When event received dispatch a custom event to the
    * game screen to start the game.
    */
    titleScreen.on('titleScreen:close', function () {
      sound.play('hollywoodTheme');

      // TODO: some transition animation?
      // Note to Dev: It looks like the transition is automatic, can it be overwritten?
      // I imagine that it is possible but could not find how to do it
      rootView.push(gameScreen);
      gameScreen.emit('gameScreen:start');
    });

   /* When the game screen has signalled that the game is over,
    * show the title screen so that the user may play the game again.
    */
    gameScreen.on('gameScreen:end', function () {
      sound.stop('hollywoodTheme');
      rootView.pop();
    });
  };
});


if (!Array.prototype.fill) {
  // A polyfill for "fill" (not universally supported)
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
  Array.prototype.fill = function (value) {
    var array = this;
    for (var i = 0; i < array.length; i += 1) {
        array[i] = value;
    }
    return array;
  }
}