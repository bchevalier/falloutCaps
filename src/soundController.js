import AudioManager;

exports.sound = null;
exports.getSound = function () {
  if (!exports.sound) {
    exports.sound = new AudioManager({
      path: 'resources/sounds',
      files: {
        hollywoodTheme: {
          path: 'musics',
          volume: 0.1,
          background: true,
          loop: true
        },
        // A TODO list for sound effects
        // that I will never have time to introduce
        throwing: {
          path: 'effects',
          background: false
        },
        bouncingOffWall: {
          path: 'effects',
          background: false
        },
        bouncingOffGround: {
          path: 'effects',
          background: false
        },
        explosion: {
          path: 'effects',
          background: false
        }
      }
    });
  }
  return exports.sound;
};