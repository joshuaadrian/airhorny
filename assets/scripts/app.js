const {Howl, Howler} = require('howler');

// window.onload = init;
// var context;
// var bufferLoader;
//
// function init() {
//
//   context = new AudioContext();
//
//   bufferLoader = new BufferLoader(
//     context,
//     [
//         '../sounds/air-horn-1.mp3',
//         '../sounds/air-horn-2.mp3',
//         '../sounds/air-horn-3.mp3',
//         '../sounds/air-horn-4.mp3',
//         '../sounds/air-horn-5.mp3',
//         '../sounds/air-horn-6.mp3',
//         '../sounds/air-horn-7.mp3',
//     ],
//     finishedLoading
//   );
//
//   bufferLoader.load();
//
// }
var sounds = {};

sounds.penis = new Howl({
  src: ['./dist/sounds/air-horn-4.mp3']
});

sounds.butt = new Howl({
  src: ['./dist/sounds/air-horn-5.mp3']
});

sounds.boobs = new Howl({
  src: ['./dist/sounds/air-horn-6.mp3']
});

var button = document.querySelector('.button');
var curSound;
var prevSound;

button.addEventListener('click', function (event) {

	// If the clicked element doesn't have the right selector, bail
	//if (!event.target.matches('.click-me')) return;
  var airhornSelected = document.querySelector('input[name="airhorn"]:checked').value;

	// Don't follow the link
	event.preventDefault();

	// Log the clicked element in the console
	// console.log(event.target);
  // console.log(airhornSelected);

  //sounds[airhornSelected].fade(1, 0, 300, prevSound);
  prevSound = sounds[airhornSelected].play();

  //console.log(prevSound);

}, false);
