/*
 * The game screen is a singleton view that consists of
 * an interface (with score and a radio), the grid and a background
 */

import animate;
import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;
import src.config as config;
import src.Interface as Interface;
import src.Background as Background;
import src.BubbleGrid as BubbleGrid;
import ui.ParticleEngine as ParticleEngine;

from ui.filter import LinearAddFilter;
from event.input.dispatch import eventTypes;

var VIEW_WIDTH = config.viewWidth;
var BUBBLE_DIMENSION = config.bubbleDimension;

exports = Class(View, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);
    this.build();

    this.on('gameScreen:start', this.launchUI.bind(this));
  };

  this.build = function () {
    this._score = 0;

    this._background = new Background({ superview: this });
    this._bubbleGrid = new BubbleGrid({ superview: this });

    this._thrownBubble = null;
    this._canShoot = true;

    this._putBubbleInCannon(
      new ThrowableBubble({
        superview: this,
        x: config.cannonX,
        y: config.cannonY
      })
    );

    this._putBubbleInReserve(
      new ThrowableBubble({
        superview: this,
        x: config.reserveX,
        y: config.reserveY
      })
    );

    this._aimingLine = new AimingLine({
      superview: this,
      x: config.cannonX,
      y: config.cannonY
    });

    this._swapSign = new ImageView({
      superview: this,
      image: 'resources/images/ui/swap.png',
      x: config.swapSignX,
      y: config.swapSignY,
      width: BUBBLE_DIMENSION,
      height: BUBBLE_DIMENSION
    });

    this._particleEngine = new ParticleEngine({
      superview: this,
      width: 1,
      height: 1,
      initCount: 100
    });

    this._swapSign.onInputStart = bind(this, function(event, position) {
      this._swapBubbles();
      event.cancel();
    });

    // How long before dropping the next line
    this._nextLineDropDt = config.startingLineDropInterval;

    this._interface = new Interface({ superview: this });
  };

  this._putBubbleInCannon = function (bubble) {
    this._cannonBubble = bubble;
    animate(bubble)
      .now({ scale: 1.05, x: config.cannonX, y: config.cannonY, opacity: 1 }, 350, animate.easeOut);
  };

  this._putBubbleInReserve = function (bubble) {
    this._reserveBubble = bubble;
    animate(bubble)
      .now({ scale: 0.95, x: config.reserveX, y: config.reserveY, opacity: 1 }, 350, animate.easeOut);
  };

  this._swapBubbles = function () {
    var cannonBubble = this._cannonBubble;
    this._putBubbleInCannon(this._reserveBubble);
    this._putBubbleInReserve(cannonBubble);
  };


  this.onInputStart = function(event, position) {
    // Only possible to throw a bubble when no other bubble is being thrown
    if (this._canShoot) {
      this._canShoot = false;

      // Throwing bubble in the cannon in the direction of the aiming line
      this._thrownBubble = this._cannonBubble;
      this._cannonBubble.shoot(this._aimingLine.style.r);

      // Bubble in the reserve goes into the cannon
      this._putBubbleInCannon(this._reserveBubble);

      // Adding new bubble in the reserve
      this._putBubbleInReserve(
        new ThrowableBubble({
          superview: this,
          x: config.reserveX - config.bubbleSpace,
          y: config.reserveY + config.bubbleSpace
        })
      );
    }
  };

  this.onInputMove = function(event, position) {
    // Moving aiming dot
    var dx = position.x - config.cannonX;
    var dy = position.y - config.cannonY;

    var angle = Math.atan2(dy, dx);
    this._aimingLine.style.r = Math.min(config.maxAimingAngle, Math.max(config.minAimingAngle, angle));
  };

  this._dropALine = function () {
    var gameOver = this._bubbleGrid.addLine();

    if (gameOver) {
      this._interface.switchToUnhappyBoy();
      this._canShoot = false;
    } else {
      setTimeout(this._dropALine.bind(this), this._nextLineDropDt);

      // Lines dropping rate increase with time
      this._nextLineDropDt = (this._nextLineDropDt - config.minLineDropInterval) * 0.95 + config.minLineDropInterval;
   }
 };

  this.launchUI = function () {
    this._interface.launchUI();
    this._dropALine();
  }

  this.tick = function(dt) {
    // Normalizing the passage of time so that dt = 1 when at 60fps
    // Note to Dev: I always normalize dt in such a way
    // I feel it more convenient when the expected value for dt is 1 in every component.
    // It becomes more obvious when trying to make some exponential interpolations
    // that are time dependant such as:
    //    var progressPerTimeUnit = 0.3;
    //    var progress = 1 - Math.pow(1 - progressPerTimeUnit, dt);
    // (we use such interpolation for camera motions and it looks nice)
    // or update speeds based on accelerations:
    //    var fallingSpeed = fallingSpeed + g * (dt * (dt + 1) / 2);
    dt *= 60 / 1000;

    if (this._thrownBubble !== null) {
      this._thrownBubble.update(dt);

      var touchesGrid = this._bubbleGrid.isThrownBubbleTouchingGrid(this._thrownBubble);
      if (touchesGrid) {
        // Getting list of bubbles matching the thrown bubble
        // and the list of all the bubbles impacted by the collision
        var attachInfo = this._bubbleGrid.attachThrownBubble(this._thrownBubble);
        this._handleCollision(attachInfo);
        this._thrownBubble = null;

        // The player is now free to shoot again
        this._canShoot = true;
      }
    }

    this._particleEngine.runTick(dt);
  };

  this._handleCollision = function (attachInfo) {
    // Playing animation for collided bubbles
    // Physics inspired animation
    var collidedBubbles = attachInfo.collidedBubbles;
    var collisionX = this._thrownBubble.style.x - this._bubbleGrid.style.x;
    var collisionY = this._thrownBubble.style.y - this._bubbleGrid.style.y;
    var delay = 0;
    var d1 = 40;
    var d2 = 180;
    var force = 20000; // <- just a hug coefficient, magic number obtained through trial and errors
    for (var b = 0; b < collidedBubbles.length; b += 1) {
      var bubble = collidedBubbles[b];
      var x = bubble.style.x;
      var y = bubble.style.y;
      var dx = x - collisionX;
      var dy = y - collisionY;
      var d = Math.sqrt(dx * dx + dy * dy);
      var impact = force / Math.pow(d + config.bubbleDimension, 2);
      animate(bubble)
        .now({ x: x, y: y }, delay)
        .then({
          x: x + impact * dx / d,
          y: y + impact * dy / d
        }, d1, animate.easeOutQuad)
        .then({ x: x, y: y }, d2, animate.easeInOutQuad);
      delay += 4;
    }

    var matchingBubbles = attachInfo.matchingBubbles;
    setTimeout(bind(this, function() {
      if (matchingBubbles.length >= 3) {
        // At least 3 matching bubbles
        var fallingBubbles = this._bubbleGrid.removeBubbles(matchingBubbles);

        // Exploding the bubbles!
        for (var b = 0; b < matchingBubbles.length; b += 1) {
          this._generateBubbleExplosion(matchingBubbles[b]);
        }

        for (var b = 0; b < fallingBubbles.length; b += 1) {
          this._handleFallingBubble(fallingBubbles[b]);
        }

        // Making the falling bubbles merge the big cap!
        this._background.flash(matchingBubbles.length / 20);
        this._background.shake();
      }
    }), delay + d1);
  };

  this._handleFallingBubble = function (fallingBubble) {
    var points = 500;
    this._score += points;

    // Converting position to global space
    fallingBubble.style.x += this._bubbleGrid.style.x;
    fallingBubble.style.y += this._bubbleGrid.style.y;
    this._interface.addCap(fallingBubble, points);
  };

  this._generateBubbleExplosion = function (bubble) {
    // Converting position to global space
    bubble.style.x += this._bubbleGrid.style.x;
    bubble.style.y += this._bubbleGrid.style.y;

    var bubbleStyle = bubble.style;

    // Animation timing properties
    var delay = Math.random() * 100;
    var d1 = 70;
    var d2 = 150;

    // Particles
    var nbParticles = 5;
    for (var p = 0; p < nbParticles; p += 1) {
      var x = bubbleStyle.x + (Math.random() - 0.5) * config.bubbleDimension;
      var y = bubbleStyle.y + (Math.random() - 0.5) * config.bubbleDimension;
      var particle = new ImageView({
        superview: this,
        x: x,
        y: y,
        width: bubbleStyle.width,
        height: bubbleStyle.height,
        anchorX: bubbleStyle.anchorX,
        anchorY: bubbleStyle.anchorY,
        offsetX: bubbleStyle.offsetX,
        offsetY: bubbleStyle.offsetY,
        image: 'resources/images/caps/capGlow.png',
        scale: 0.3 + Math.random() * 0.2
      });

      var endX = x + 2 * (x - bubbleStyle.x);
      var endY = y + 2 * (y - bubbleStyle.y);
      var midX = (x + endX) * 0.5;
      var midY = (y + endY) * 0.5;
      var endR = (Math.random() - 0.5);

      var duration = 3 * (d1 + d2) * (1 + Math.random());
      animate(particle)
        .now({ x: x, y: y, opacity: 0 }, delay)
        .then({ x: x, y: y, opacity: 1.0, r: 0 }, 0)
        .then({ x: endX, y: endY, opacity: 0.0, r: endR }, duration, animate.easeOutQuad)
        .then(bind(particle, function () {
          this.removeFromSuperview();
        }));
    }
  
    // Bubble switches to this view
    this.addSubview(bubble);

    // Note to Dev: I am not sure how I should use filters
    // this does not seem to work
    // var filter = new LinearAddFilter({
    //   r: 255, g: 255, b: 255, a: 0.8
    // });
    // bubble.setFilter(filter);

    var bubbleGlow = new ImageView({
      superview: this,
      x: bubbleStyle.x,
      y: bubbleStyle.y,
      width: bubbleStyle.width,
      height: bubbleStyle.height,
      anchorX: bubbleStyle.anchorX,
      anchorY: bubbleStyle.anchorY,
      offsetX: bubbleStyle.offsetX,
      offsetY: bubbleStyle.offsetY,
      image: 'resources/images/caps/capGlow.png'
    });

    animate(bubble)
      .now({ scale: 1, opacity: 1 }, delay)
      .then({ scale: 0.8, opacity: 1 }, d1, animate.easeOut)
      .then({ scale: 1.25, opacity: 0 }, d2, animate.easeOut)
      .then(bind(bubble, function () {
        this.removeFromSuperview();
      }));

    animate(bubbleGlow)
      .now({ scale: 1, opacity: 0 }, delay)
      .then({ scale: 0.8, opacity: 1.0 }, d1, animate.easeOut)
      .then({ scale: 1.25, opacity: 0.3 }, d2, animate.easeOut)
      .then(bind(bubbleGlow, function () {
        this.removeFromSuperview();
      }));
  };
});


var ThrowableBubble = Class(ImageView, function (supr) {
  this.init = function (opts) {
    this.type = getRandomBubbleType();

    var width = BUBBLE_DIMENSION;
    var height = BUBBLE_DIMENSION;
    var pivotX = width / 2;
    var pivotY = height / 2;
    opts = merge(opts, {
      image: config.bubbleImages[this.type],
      width: width,
      height: height,
      anchorX: width / 2,
      anchorY: height / 2,
      offsetX: -width / 2,
      offsetY: -height / 2
    });

    supr(this, 'init', [opts]);
  };

  this.shoot = function (angle) {
    // Computing velocity
    this.velocityX = Math.cos(angle) * config.shootingSpeed;
    this.velocityY = Math.sin(angle) * config.shootingSpeed;

    // Making sure the style is right
    this.style.scale = 1;
    this.style.opacity = 1;
  };

  this.update = function (dt) {
    // Updating and resolving position on x-axis
    var x = this.style.x + dt * this.velocityX;
    // If the bubble is out of bounds, putting it back within bounds and making it bounce
    if (x < BUBBLE_DIMENSION / 2) {
      x = BUBBLE_DIMENSION - x;
      this.velocityX *= -1;
    } else if (x > VIEW_WIDTH - BUBBLE_DIMENSION / 2) {
      x = 2 * VIEW_WIDTH - x - BUBBLE_DIMENSION;
      this.velocityX *= -1;
    }

    this.style.x = x;
    this.style.y = this.style.y + dt * this.velocityY;
  };
});

var AimingLine = Class(View, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);
    this.build();
  };

  this.build = function () {
    // Spacing dots are regular intervals
    var nbDots = config.nbAimingDots;
    var dotDimension = config.dotDimension;
    var spacing = config.aimingDotsSpacing;
    for (var d = 1; d <= nbDots; d += 1) {
      var dot = new ImageView({
        superview: this,
        image: 'resources/images/ui/aimingDot.png',
        x: spacing * d,
        y: 0,
        width: dotDimension,
        height: dotDimension,
        offsetX: -dotDimension / 2,
        offsetY: -dotDimension / 2
      });
    }

    // Starting off in the upright position
    this.style.r = -Math.PI / 2;
  }
});


function getRandomBubbleType() {
  return Math.floor(Math.random() * config.nbBubbleTypes);
}
