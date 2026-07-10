const { Howl, Howler } = require('howler');

const SOUND_PATHS = {
  penis: '/dist/sounds/air-horn-4.mp3',
  butt: '/dist/sounds/air-horn-5.mp3',
  boobs: '/dist/sounds/air-horn-6.mp3',
};

const sounds = {};
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) {
    return Promise.resolve();
  }

  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    return Howler.ctx.resume().then(function () {
      audioUnlocked = true;
    });
  }

  audioUnlocked = true;
  return Promise.resolve();
}

Object.keys(SOUND_PATHS).forEach(function (key) {
  var path = SOUND_PATHS[key];

  sounds[key] = new Howl({
    src: [path],
    preload: true,
    html5: false,
    onloaderror: function (_id, error) {
      console.error('Failed to load sound:', path, error);
    },
    onplayerror: function (soundId) {
      var howl = this;

      howl.once('unlock', function () {
        howl.play(soundId);
      });

      if (Howler.ctx) {
        Howler.ctx.resume();
      }
    },
  });
});

function playSelectedSound() {
  var selected = document.querySelector('input[name="airhorn"]:checked').value;

  unlockAudio().then(function () {
    sounds[selected].play();
  });
}

var button = document.querySelector('.button');

button.addEventListener('pointerdown', function (event) {
  event.preventDefault();
  playSelectedSound();
});

button.addEventListener('click', function (event) {
  event.preventDefault();

  // Keyboard activation (Space/Enter) fires click without pointerdown.
  if (event.detail === 0) {
    playSelectedSound();
  }
});
