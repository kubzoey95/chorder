const KEY_TONE_MAPPING = {       "2": 1,       "3": 3,               "5": 6,       "6": 8,       "7": 10,         // black keys
                          "q": 0,       "w": 2,       "e": 4, "r": 5,       "t": 7,       "y": 9,        "u": 11} // white keys

let model = null;
let loadModel = async function(){
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');
  model.resetStates();
  console.log("Model loaded!");
  console.log(model);
}

loadModel()

let synth = 0;

let loadSynth = async function(){
  
  synth = new Tone.Sampler({
	urls: {
		A2: "A2.mp3",
		A4: "A4.mp3",
		A6: "A6.mp3",
		B1: "B1.mp3",
		B3: "B3.mp3",
		B5: "B5.mp3",
		B6: "B6.mp3",
		C3: "C3.mp3",
		C5: "C5.mp3",
		D2: "D2.mp3",
		D4: "D4.mp3",
		D6: "D6.mp3",
		D7: "D7.mp3",
		E1: "E1.mp3",
		E3: "E3.mp3",
		E5: "E5.mp3",
		F2: "F2.mp3",
		F4: "F4.mp3",
		F6: "F6.mp3",
		F7: "F7.mp3",
		G1: "G1.mp3",
		G3: "G3.mp3",
		G5: "G5.mp3"
	},
	baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/harp/"
})
  synth.volume.value = -30;
  synth.connect(new Tone.Freeverb({roomSize : 0.8 , dampening : 2000}).toMaster());
  console.log("Synth loaded!");
  console.log(synth);
}

loadSynth()

let noteStack = [];

let lastTime = performance.now();

let refreshTime = 0;

const canvas = document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    
	const scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(1, 1, 1);
	var catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(
        [BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(10, 1, 5),
        new BABYLON.Vector3(20, 16, 20),
        new BABYLON.Vector3(25, -21, 15),
        new BABYLON.Vector3(35, 30, 0)
        ],
        60,
        true);
	const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
	camera.attachControl(canvas, true);
	var catmullRomSpline = BABYLON.Mesh.CreateLines("catmullRom", catmullRom.getPoints(), scene);

	return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
	scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
	engine.resize();
});

let toneStarted = false;
const now = Tone.now();

let currentTone = null;

let currentChord = null;
let lastNotes = [0,0,0];

let playAndPush = function(toneToPlay){
  synth && synth.triggerAttackRelease(Math.pow(2, (toneToPlay + 3) / 12) * 440.0, 5, Tone.now());
  noteStack.push({tone: toneToPlay, time: 4000, close: 0});
}

let chooseRandomNumber = function(weights){
  let sum = 0;
  let weightsEntries = Array.from(weights.entries());
  weightsEntries.sort((e1, e2) => e1[1] - e2[1]);
  weightsEntries = weightsEntries.slice(weightsEntries.length - 4);
  weightsEntries = weightsEntries.map((e) => [e[0], (e[1] - weightsEntries[0][1]) / (weightsEntries[weightsEntries.length - 1][1] - weightsEntries[0][1])]);
  console.log(weightsEntries);
  let randomNumber = Math.random();
  for(let [index, weight] of weightsEntries){
    let newSum = sum + weight;
    if (randomNumber < newSum){
      return index;
    }
    sum = newSum;
  }
}

let goThroughModel = function(){
  let prediction = null;
  while(lastNotes.length > 2){
    let lastNotesTensor = tf.oneHot(tf.tensor2d([lastNotes.slice(0,3)], [1, 3], 'int32'), 26);
    prediction = model.predict([lastNotesTensor]);
    lastNotes = lastNotes.slice(1);
    prediction.print();
  }
  prediction && lastNotes.push(chooseRandomNumber(Array.from(prediction.reshape([26]).dataSync())));
}

$(document).keypress(async function(e){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  let keyPressed = String.fromCharCode(e.keyCode || e.which).toLowerCase();
  if (KEY_TONE_MAPPING.hasOwnProperty(keyPressed) && currentTone !== KEY_TONE_MAPPING[keyPressed]){
    let diff = KEY_TONE_MAPPING[keyPressed] - currentTone;
    if (Math.abs(diff) > 12){
      diff = KEY_TONE_MAPPING[keyPressed] - ((Math.floor(KEY_TONE_MAPPING[keyPressed] / 12) * 12) + (currentTone % 12));
    }
    currentTone += diff;
    playAndPush(currentTone);
    lastNotes.push(diff + 12 + 1);
    console.log(lastNotes);
  }

})

$(document).keyup(async function(e){
  let keyPressed = String.fromCharCode(e.keyCode || e.which).toLowerCase();
  console.log(keyPressed);
  if(typeof model === null){
    return
  }
  if (KEY_TONE_MAPPING.hasOwnProperty(keyPressed)){
  }
  else {
    if (lastNotes.length > 2){
      goThroughModel();
    }
    currentTone += lastNotes[lastNotes.length - 1] - 1 - 12;
    if (currentTone > 30){
      currentTone -= 12;
    }
    if (currentTone < -20){
      currentTone += 12;
    }
    playAndPush(currentTone);
  }
})
