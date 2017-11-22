/*
 * The fake loading screen consists of a whistling vault bo
 * and a loading message.
 * When the associated start button is pressed, an event is emitted,
 * which is listened for in the top-level application.
 * When that happens, the loading screen is removed,
 * and the game screen shown.
 */

import animate;
import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import src.config as config;
import ui.resource.Image as Image;

/* The loading screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
exports = Class(ImageView, function (supr) {
  this.init = function (opts) {
    opts = merge(opts, {
      x: 0,
      y: 0,
      image: 'resources/images/titleScreen/bg.png'
    });

    supr(this, 'init', [opts]);
    this.build();
  };

  this.build = function () {
    this.initSplashScreenBg();
    this.initLogo();
    this.initWhistlingBoy();
    this.initLoadingMessages();

    // Considering it is a fake loading screen,
    // we are just waiting for the user to tap anywhere on the screen to trigger the emission.
    // The whole view is a button
    this.on('InputSelect', bind(this, function () {
      this.stopUI();
      this.emit('titleScreen:close');
    }));
  };

  this.initSplashScreenBg = function () {
    var width = 230;
    var height = 340;
    var pivotX = width * 0.5;
    var pivotY = height * 0.5;
    this._splashScreenBg = new ImageView({
      superview: this,
      image: 'resources/images/titleScreen/splashScreenBg.png',
      x: config.viewCenterX,
      y: config.viewCenterY,
      width: width,
      height: height,
      offsetX: -pivotX,
      offsetY: -pivotY,
      anchorX: pivotX,
      anchorY: pivotY
    });
  };

  this.initLogo = function () {
    var logoImage = new Image({url: 'resources/images/titleScreen/logo.png'});

    var width = 210;
    var height = logoImage.getHeight() * width / logoImage.getWidth();
    var pivotX = width * 0.5;
    var pivotY = height * 0.5;
    var y = config.viewCenterY - 130;

    this._logo = new ImageView({
      superview: this,
      image: logoImage,
      x: config.viewCenterX,
      y: y,
      width: width,
      height: height,
      offsetX: -pivotX,
      offsetY: -pivotY,
      anchorX: pivotX,
      anchorY: pivotY
    });

    // Note to Dev: There seems to be a bug where setting an opacity
    // higher than 1.0 makes the element slightly transparent (not very noticeable)
    // this._logo.style.opacity = 1.8;
  };

  this.initWhistlingBoy = function () {
    // Fading whistling boy in
    // Note to Dev: It looks like there is no way to play two animations simultaneously on the same view!
    // Therefore a parent is created for the whistling boy.
    // This parent's scale and opacity will be animated independantly from the whistling boy
    var pivotRatioX = 0.5;
    var pivotRatioY = 0.8;
    this._whistlingBoyContainer = new View({
      superview: this,
      x: config.viewCenterX,
      y: config.viewCenterY + 35,
      width: 1,
      height: 1,
      offsetX: -pivotRatioX,
      offsetY: -pivotRatioY,
      anchorX: pivotRatioX,
      anchorY: pivotRatioY
    });

    var width = 150;
    var height = 150;
    var pivotX = width * pivotRatioX;
    var pivotY = height * pivotRatioY;
    this._whistlingBoy = new ImageView({
      superview: this._whistlingBoyContainer,
      image: 'resources/images/vaultBoys/whistling.png',
      x: 0,
      y: 0,
      width: width,
      height: height,
      offsetX: -pivotX,
      offsetY: -pivotY,
      anchorX: pivotX,
      anchorY: pivotY
    });
  };

  this.initLoadingMessages = function () {
    var y = config.viewCenterY + 105;
    var width = 210;
    var size = 24;

    // "Loading" text message
    this._loadingText = new TextView({
      superview: this,
      text: 'Loading',
      color: 'black',
      fontWeight: 'bold',
      x: config.viewCenterX,
      y: y - 30,
      wrap: true,
      width: width,
      height: size,
      size: size,
      offsetX: -width / 2
    });

    // Loading messages
    this._loadingMessages = new TextView({
      superview: this,
      text: '',
      color: 'black',
      x: config.viewCenterX,
      y: y,
      wrap: true,
      width: width,
      height: 2 * size,
      size: size,
      offsetX: -width / 2
    });
  };

  this.launchUI = function() {
    // Launch of the splash screen consists in a series of animations
    animate(this._splashScreenBg)
      .now({ scale: 0.7, opacity: 0.2 }, 0)
      .then({ scale: 1.0, opacity: 0.8 }, 600, animate.easeOutBack);

    var logoY = this._logo.style.y;
    animate(this._logo)
      // Adding temporisation to start animating a short while after splash screen bg
      .now({ y: logoY - 20, opacity: 0.0 }, 0)
      .then({ y: logoY - 20, opacity: 0.0 }, 350)
      .then({ y: logoY - 20, opacity: 0.3 }, 0)
      .then({ y: logoY, opacity: 1.0 }, 350, animate.easeOut);
        
    // Dramatic entrance for vault boy
    animate(this._whistlingBoyContainer)
        // Adding temporisation to start animating a short while after splash screen bg
        .now({ scale: 0.0, opacity: 0.0 }, 0)
        .then({ scale: 0.0, opacity: 0.0 }, 700)
        .then({ scale: 0.6, opacity: 0.3 }, 0)
        // Note to Dev: Because of opacity issue, the animation does not look right
        .then({ scale: 1.0, opacity: 1.0 }, 600, animate.easeOutBack);

    // Animating the whistling boy in a loop
    // Note to Dev: Here I would have liked a simpler way to make loops
    // e.g animate(this._whistlingBoy).loop().now().then()...
    function rockBackAndForth () {
      animate(this)
        .now({ r: -0.18 }, 0)
        // Note to Dev: Here I would have liked to tweak the animation a bit.
        // I noticed that simplified versions of "Robert Penner's easing functions"
        // were implemented in Game Closure (with no parameters).
        // I agree that some of them had too many parameters (like elastic method)
        // but as an animator I like to have some degree of freedom
        .then({ r: 0.18 }, 1100, animate.easeInOut)
        .then({ r: -0.18 }, 1100, animate.easeInOut)
        .then(rockBackAndForth.bind(this));
    }
    rockBackAndForth.call(this._whistlingBoy);

    // Fading in the "Loading" text
    animate(this._loadingText)
      .now({ opacity: 0.0 }, 0)
      .wait(500)
      .then({ opacity: 1.0 }, 400);

    function fadeCurrentMessageOut() {
      var y = this.style.y;
      animate(this)
        // Adding temporisation to start animating a short while after splash screen bg
        .now({ y: y, opacity: 0.3 }, 0)
        .then({ y: y + 20, opacity: 0.0 }, 260, animate.easeOut)
        .then(fadeNextMessageIn.bind(this));
    }

    var loadingMessagesStack = [
      'Polishing caps',
      'Rationing supplies',
      'Trying on some wasteland gears',
      '(Still loading by the way)',
      'Decontaminating water',
      'Applying to the brotherhood of steel',
      'Dealing with mole rat infestation',
      '(Still prentending to prepare important stuff)',
      '(Actually there is nothing to load)',
      'Done pretending',
      'Tap to start!'
    ].reverse();

    var loadingText = this._loadingText;
    function fadeNextMessageIn() {
      // Popping a new message to show
      var y = this.style.y;
      this.setText(loadingMessagesStack.pop());
      var animation = animate(this)
        .then({ y: y, opacity: 0.0 }, 0)
        .then({ y: y - 20, opacity: 1.0 }, 400, animate.easeOut)
        .wait(2000);
        
      if (loadingMessagesStack.length === 0) {
        // End of the message stack
        // Fading out loading text
        animate(loadingText).then({ opacity: 0.0 }, 400);
      } else {
        animation.then(fadeCurrentMessageOut.bind(this));
      }
    }

    var loadingMessagesY = this._loadingMessages.style.y;
    animate(this._loadingMessages)
      // Adding temporisation to start animating a short while after splash screen bg
      .now({ y: loadingMessagesY + 20, opacity: 0.0 }, 0)
      .wait(700)
      .then(fadeNextMessageIn.bind(this._loadingMessages));
  };

  this.stopUI = function () {
    // Stopping the looping animation manually
    // Note to Dev: It was looping even when the view it belongs to was popped from the stack
    // (Luckly, I was able to notice it thanks to my incredible perception skills)
    // Is it the intended behavior? Is there any way to debug which animations may still be running?
    animate(this._whistlingBoy).clear();
    animate(this._loadingMessages).clear();
  };
});