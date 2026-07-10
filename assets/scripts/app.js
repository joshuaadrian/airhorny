const { Howl, Howler } = require('howler');
const { animate } = require('motion');

Howler.autoUnlock = false;

const DEFAULT_SOUND = 'butt';

const SOUND_PATHS = {
  penis: '/dist/sounds/air-horn-4.mp3',
  butt: '/dist/sounds/air-horn-5.mp3',
  boobs: '/dist/sounds/air-horn-6.mp3',
};

const sounds = {};
let soundsInitialized = false;
let audioUnlocked = false;
let armAnimation = null;
let blastSequenceId = 0;

function initSounds() {
  if (soundsInitialized) {
    return;
  }

  soundsInitialized = true;

  Object.keys(SOUND_PATHS).forEach(function (key) {
    var path = SOUND_PATHS[key];

    sounds[key] = new Howl({
      src: [path],
      preload: false,
      html5: false,
      onloaderror: function (_id, error) {
        console.error('Failed to load sound:', path, error);
      },
      onplayerror: function (soundId) {
        var howl = this;

        howl.once('unlock', function () {
          howl.play(soundId);
        });
      },
    });
  });
}

function unlockAudio() {
  initSounds();

  if (audioUnlocked && (!Howler.ctx || Howler.ctx.state === 'running')) {
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

function preloadOtherSounds(selected) {
  Object.keys(sounds).forEach(function (key) {
    if (key !== selected && sounds[key].state() === 'unloaded') {
      sounds[key].load();
    }
  });
}

function playSound(selected) {
  var sound = sounds[selected];

  if (sound.state() === 'unloaded') {
    sound.once('load', function () {
      sound.play();
    });
    sound.load();
    return;
  }

  sound.play();
}

var button = document.querySelector('.button');
var logoOrbit = document.getElementById('logo-orbit');
var logoArm = document.getElementById('logo-arm');
var logo = document.getElementById('logo');
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function getButtonRadiusPx() {
  if (window.innerWidth >= 800) {
    return window.innerHeight * 0.25;
  }

  return window.innerWidth * 0.3;
}

function getLogoHalfWidthPx() {
  if (logo && logo.offsetWidth) {
    return logo.offsetWidth / 2;
  }

  if (window.innerWidth >= 800) {
    return window.innerHeight * 0.26;
  }

  return window.innerWidth * 0.325;
}

function getOrbitRadius() {
  return getButtonRadiusPx() - 60 + getLogoHalfWidthPx();
}

function updateOrbitRadius() {
  if (!logoOrbit || prefersReducedMotion.matches) {
    return;
  }

  logoOrbit.style.setProperty('--orbit-radius', getOrbitRadius() + 'px');
}

function pauseOrbit() {
  if (logoOrbit) {
    logoOrbit.classList.add('is-orbit-paused');
  }
}

function resumeOrbit() {
  if (logoOrbit) {
    logoOrbit.classList.remove('is-orbit-paused');
  }
}

function stopArmAnimation() {
  if (armAnimation) {
    armAnimation.stop();
    armAnimation = null;
  }
}

function resetArmStyles() {
  if (!logoArm) {
    return;
  }

  stopArmAnimation();
  logoArm.style.transform = '';
  logoArm.style.opacity = '';
  logoArm.style.filter = '';
}

function isSuperseded(sequenceId) {
  return sequenceId !== blastSequenceId;
}

function finishBlastSequence(sequenceId) {
  if (isSuperseded(sequenceId)) {
    return;
  }

  resetArmStyles();
  updateOrbitRadius();
  resumeOrbit();
}

function triggerLogoBlast() {
  if (!logoArm || !logoOrbit || prefersReducedMotion.matches) {
    return;
  }

  var sequenceId = ++blastSequenceId;
  var orbitRadius = getOrbitRadius();
  var blastDistance = orbitRadius * 2.4;

  stopArmAnimation();
  pauseOrbit();
  resetArmStyles();

  var startY = -orbitRadius;

  armAnimation = animate(
    logoArm,
    {
      y: [startY, -blastDistance],
      scale: [1, 1.85],
      opacity: [1, 0],
      rotate: [0, 75],
      filter: ['blur(0px)', 'blur(10px)'],
    },
    {
      duration: 0.5,
      ease: [0.15, 0.9, 0.2, 1],
    }
  );

  armAnimation.finished
    .then(function () {
      if (isSuperseded(sequenceId)) {
        return Promise.reject({ superseded: true });
      }

      armAnimation = animate(
        logoArm,
        {
          y: -orbitRadius,
          scale: 1,
          opacity: 1,
          rotate: 0,
          filter: 'blur(0px)',
        },
        {
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }
      );

      return armAnimation.finished;
    })
    .then(function () {
      if (isSuperseded(sequenceId)) {
        return Promise.reject({ superseded: true });
      }

      finishBlastSequence(sequenceId);
    })
    .catch(function (error) {
      if (error && error.superseded) {
        return;
      }

      finishBlastSequence(sequenceId);
    });
}

function triggerHonkFeedback() {
  button.classList.add('is-honking');
  triggerLogoBlast();

  window.setTimeout(function () {
    button.classList.remove('is-honking');
  }, 150);
}

function playSelectedSound() {
  var selectedInput = document.querySelector('input[name="airhorn"]:checked');
  var selected = selectedInput ? selectedInput.value : DEFAULT_SOUND;

  triggerHonkFeedback();

  unlockAudio().then(function () {
    playSound(selected);
    preloadOtherSounds(selected);
  });
}

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

document.addEventListener('visibilitychange', function () {
  if (document.visibilityState !== 'visible') {
    return;
  }

  audioUnlocked = false;
});

window.addEventListener('resize', function () {
  if (!armAnimation) {
    updateOrbitRadius();
  }
});

function initOrbitLayout() {
  resumeOrbit();
  updateOrbitRadius();
}

initOrbitLayout();

if (logo) {
  if (logo.complete) {
    initOrbitLayout();
  } else {
    logo.addEventListener('load', initOrbitLayout);
  }
}

window.addEventListener('load', initOrbitLayout);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
      console.error('Service worker registration failed:', error);
    });
  });
}
