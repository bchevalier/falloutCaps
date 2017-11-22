import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import src.config as config;
import ui.resource.Image as Image;
import math.geom.Point as Point;

// Dropping all the images on the closure of this file
// If I was to develop this game further I would put the images somewhere
// that I know they would be garbage collected.
// (I guess I do not really care about garbage collection and memory sticking around
// considering it is a very small demo)
var prettyBoyImage = new Image({url: 'resources/images/vaultBoys/idle.png'});
var charismaticBoyImage = new Image({url: 'resources/images/vaultBoys/charisma.png'});
var unhappyBoyImage = new Image({url: 'resources/images/vaultBoys/unhappy.png'});
var aimingBotImage = new Image({url: 'resources/images/ui/aimingDot.png'});
var headerBgImage = new Image({url: 'resources/images/ui/headerBg.png'});
var musicNoteImage = new Image({url: 'resources/images/ui/musicNote.png'});
var radioImage = new Image({url: 'resources/images/ui/radio.png'});
var redLineImage = new Image({url: 'resources/images/ui/redLine.png'});
var swapImage = new Image({url: 'resources/images/ui/swap.png'});
var bigCapImage = new Image({url: 'resources/images/caps/originalCap.png'});
var bigCapGlowImage = new Image({url: 'resources/images/caps/originalCapGlow.png'});

// TODO: if enough time, add charisma gauge + mechanic
// var charismaGaugeFillerImage = new Image({url: 'resources/images/ui/charismaGaugeFilling.png'});
// var charismaGaugeBgImage = new Image({url: 'resources/images/ui/charismaGaugeBg.png'});
// var charismaTextImage = new Image({url: 'resources/images/ui/charismaText.png'});

exports = Class(View, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);
    this.build();
  };

  this.build = function () {
    // Instanciating all the visual elements of the view
    var headerBg = new ImageView({
      superview: this,
      image: headerBgImage,
      x: 0,
      y: 0,
      width: config.viewWidth,
      height: config.gridTop
    });

    var bigCapDimension = config.viewWidth * 0.2;
    var bigCapPivotX = bigCapDimension * 0.5;
    var bigCapPivotY = bigCapDimension * 0.5;
    this._bigCap = new ImageView({
      superview: this,
      image: bigCapImage,
      x: bigCapDimension / 2 + 20,
      y: bigCapDimension / 2 + 10,
      width: bigCapDimension,
      height: bigCapDimension,
      anchorX: bigCapPivotX,
      anchorY: bigCapPivotY,
      offsetX: -bigCapPivotX,
      offsetY: -bigCapPivotY
    });

    this._bigCapGlow = new ImageView({
      superview: this,
      image: bigCapGlowImage,
      x: bigCapDimension / 2 + 20,
      y: bigCapDimension / 2 + 10,
      width: bigCapDimension,
      height: bigCapDimension,
      anchorX: bigCapPivotX,
      anchorY: bigCapPivotY,
      offsetX: -bigCapPivotX,
      offsetY: -bigCapPivotY,
      opacity: 0
    });

    this._limitLine = new ImageView({
      superview: this,
      image: redLineImage,
      x: -10,
      y: config.gridBottom,
      width: redLineImage.getWidth() * 0.5,
      height: redLineImage.getHeight() * 0.5,
      opacity: 0.4
    });

    var idleBoyWidth = config.viewWidth * 0.4;
    var idleBoyHeight = prettyBoyImage.getHeight() * idleBoyWidth / prettyBoyImage.getWidth();
    var idleBoyPivotX = idleBoyWidth * 0.5;
    var idleBoyPivotY = idleBoyHeight * 0.9;
    var idleBoyY = config.viewHeight + 10;
    this._idleBoy = new ImageView({
      superview: this,
      image: prettyBoyImage,
      x: config.viewWidth * 0.85,
      y: idleBoyY,
      width: idleBoyWidth,
      height: idleBoyHeight,
      offsetX: -idleBoyPivotX,
      offsetY: -idleBoyPivotY,
      anchorX: idleBoyPivotX,
      anchorY: idleBoyPivotY
    });

    var radioWidth = config.viewWidth * 0.2;
    var radioHeight = radioImage.getHeight() * radioWidth / radioImage.getWidth();
    this._radio = new ImageView({
      superview: this,
      image: radioImage,
      x: config.viewWidth - radioWidth - 10,
      // x: undefined, // Note to Dev: for funkiness, uncomment and play a game (<- may be indication of underlying bug or is it normal behavior?)
      y: (config.gridTop - radioHeight) / 2,
      width: radioWidth,
      height: radioHeight,
      anchorX: radioWidth * 0.5,
      anchorY: radioHeight * 0.7,
      opacity: 1.0
    });


    // TODO: Add a few music notes
    // for (var n = 0; n < 5; n += 1) {
    //   var note = new ImageView({
    //   });
    // }

    var scoreFontSize = 36;
    this._score = new TextView({
      superview: this,
      text: '0',
      color: 'white',
      fontFamily: 'Impact',
      horizontalAlign: 'left',
      x: this._bigCap.style.x + this._bigCap.style.width / 2 + 10,
      y: this._bigCap.style.y - scoreFontSize / 2,
      width: config.viewWidth,
      height: scoreFontSize,
      size: scoreFontSize
    });

    this._displayedScore = 0;
  };

  this.addCap = function (cap, score) {
    var destinationX = this._bigCap.style.x;
    var destinationY = this._bigCap.style.y;

    this.addSubview(cap);

    var duration = 400 + Math.random() * 300;
    animate(cap)
      .now({ x: cap.style.x, y: cap.style.y }, 0)
      .then({ x: destinationX, y: destinationY }, duration, animate.easeInBack)
      .then(bind(this, function () {
        animate(this._bigCap)
          .now({ scale: 1 }, 0)
          .then({ scale: 1.2 }, 50)
          .then({ scale: 1 }, 400, animate.easeOut);

        animate(this._bigCapGlow)
          .now({ scale: 1, opacity: 0 }, 0)
          .then({ scale: 1.2, opacity: 0.5 }, 50)
          .then({ scale: 1, opacity: 0 }, 400, animate.easeOut);

        this._displayedScore += score;
        this._score.setText(this._displayedScore);
        animate(this._score)
          .now({ scale: 1 }, 0)
          .then({ scale: 1.1 }, 50)
          .then({ scale: 1 }, 400, animate.easeOut);
      }))
      .then({ scale: 1.3, opacity: 0 }, 200, animate.easeOut)
      .then(bind(cap, function () {
        this.removeFromSuperview();
      }));
  };

  this.launchUI = function () {
    // Making the screen happier
    // by animating the interface

    function rockTheRadio() {
      animate(this)
        .now({ r: 0.1 }, 1000, animate.easeInOut)
        .then({ r: -0.1 }, 1000, animate.easeInOut)
        .then(rockTheRadio.bind(this));
    }
    rockTheRadio.call(this._radio);

    function rockTheIdleBoy() {
      // Note to Dev: Here again I could not animate the element the way I wanted to
      // I would have needed 2 simultaneous animations on the same element
      var y = this.style.y;
      animate(this)
        .now({ y: y - 3, r: 0.04 }, 500, animate.easeIn)
        .then({ y: y, r: 0.15 }, 500, animate.easeOut)
        .then({ y: y - 3, r: 0.04 }, 500, animate.easeIn)
        .then({ y: y, r: -0.07 }, 500, animate.easeOut)
        .then(rockTheIdleBoy.bind(this));
    }
    rockTheIdleBoy.call(this._idleBoy);
  };

  this.switchToUnhappyBoy = function () {
      this._idleBoy.setImage(unhappyBoyImage)
  };

  this.stopUI = function () {
    animate(this._radio).clear();
    animate(this._idleBoy).clear();
  };

  this.updateScore = function (score) {
    this._score.setText(score.toString(10));
  };

});