import animate;

import ui.View as View;
import ui.ImageView as ImageView;
import src.config as config;
import ui.resource.Image as Image;

var bgRedImage = new Image({url: 'resources/images/backgrounds/bgRed.png'});
var bgGreenImage = new Image({url: 'resources/images/backgrounds/bgGreen.png'});
var bgBlueImage = new Image({url: 'resources/images/backgrounds/bgBlue.png'});
var bgEffectImage = new Image({url: 'resources/images/backgrounds/bgScreenEffect.png'});

var MAX_SHAKE_AMPLITUDE = 4;

exports = Class(View, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);
    this.build();
  };

  this.build = function () {
    // Computing what should be image size with respect to view 
    this._height = config.viewHeight - config.gridTop + 2 * MAX_SHAKE_AMPLITUDE;
    this._width = bgRedImage.getWidth() * this._height / bgRedImage.getHeight();

    this.style.x = -(this._width - config.viewWidth) / 2;
    this.style.y = config.gridTop - MAX_SHAKE_AMPLITUDE;

    // Having 3 backgrounds representing the same image but with different hues
    // It allows for some special effects
    // Not really optimised for performance though because each background fill
    // the screen almost entirely.

    // Note to Dev: Had I the possibility to write my own WebGL post processing filter I would
    // be able to make better looking effects more effortlessly

    this._greenComponent = createComponent.call(this, bgGreenImage, 1.0);
    this._redComponent = createComponent.call(this, bgRedImage, 0.5);
    this._blueComponent = createComponent.call(this, bgBlueImage, 0.25);
    this._brightOverlay = createComponent.call(this, bgEffectImage, 0.0);
  };

  this._shakeComponent = function (component) {
    var direction = Math.random() * 2 * Math.PI;
    var amplitude = 0.5 * (Math.random() + 1) * MAX_SHAKE_AMPLITUDE;

    var x = amplitude * Math.cos(direction);
    var y = amplitude * Math.sin(direction);

    // Random timing, it smoothes the animation to have the different components
    // animated asynchronously (animation too aggressive otherwise)
    var d0 = Math.random() * 600 + 300;
    var d1 = Math.random() * 300 + 800;

    // Note to Dev: Here I would have rather used a noise method to do the shaking.
    // Would be nice to be able to set custom easings
    animate(component)
      .now({ x: 0, y: 0 }, 0)
      .then({ x: x, y: y }, d0, animate.easeOutElastic)
      .then({ x: 0, y: 0 }, d1, animate.easeOut);
  };

  this.shake = function () {
    this._shakeComponent(this._greenComponent);
    this._shakeComponent(this._redComponent);
    this._shakeComponent(this._blueComponent);
  };

  this.flash = function (strength) {
    var opacity = 0.2 * strength;
    animate(this._brightOverlay)
      .now({ opacity: 0.0 }, 0)
      .then({ opacity: opacity }, 200, animate.easeOut)
      .then({ opacity: 0.0 }, 800, animate.easeInOut)
  };
});

function createComponent(image, opacity) {
  return new ImageView({
    superview: this,
    image: image,
    x: 0,
    y: 0,
    width: this._width,
    height: this._height,
    opacity: opacity
  });
}