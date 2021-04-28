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

let synth = null;

let loadSynth = async function(){
  synth = new Tone.Synth().toMaster();
  console.log("Synth loaded!");
  console.log(synth);
}

loadSynth()

let toneStarted = false;
const now = Tone.now();

let currentTone = null;

let currentChord = null;
let lastNotes = [0,0,0];

let chooseRandomNumber = function(weights){
  let sum = 0;
  let randomNumber = Math.random();
  for(let [index, weight] of weights.slice(1).entries()){
    let newSum = sum + weight;
    if (sum <= randomNumber < newSum){
      return index;
    }
  }
}

let goThroughModel = function(){
  let prediction = null;
  while(lastNotes.length > 2){
    let lastNotesTensor = tf.oneHot(tf.tensor2d([lastNotes.slice(0,3)], [1, 3], 'int32'), 13);
    prediction = model.predict([lastNotesTensor]);
    lastNotes = lastNotes.slice(1);
    prediction.print();
  }
  prediction && lastNotes.push(chooseRandomNumber(Array.from(prediction.reshape([13]).dataSync())));
//   return Array.from(tf.argMax().dataSync());
}

$(document).keypress(async function(e){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  let keyPressed = String.fromCharCode(e.keyCode || e.which).toLowerCase();
  if (KEY_TONE_MAPPING.hasOwnProperty(keyPressed) && currentTone !== KEY_TONE_MAPPING[keyPressed]){
    currentTone = KEY_TONE_MAPPING[keyPressed];
    synth && synth.triggerAttackRelease(Math.pow(2, (currentTone + 3) / 12) * 440.0, "8n", Tone.now());
    lastNotes.push(currentTone + 1);
    console.log(lastNotes);
  }

})

$(document).keyup(async function(e){
  let keyPressed = String.fromCharCode(e.keyCode || e.which).toLowerCase();
  console.log(keyPressed);
  if (KEY_TONE_MAPPING.hasOwnProperty(keyPressed)){
//     synth && synth.triggerRelease(now);
    currentTone = null;
  }
  else {
    if (lastNotes.length > 2){
      goThroughModel();
    }
    synth && synth.triggerAttackRelease(Math.pow(2, (lastNotes[lastNotes.length - 1] - 1 + 3) / 12) * 440.0, "8n", Tone.now());
  }
})
