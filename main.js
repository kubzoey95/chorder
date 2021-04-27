const KEY_TONE_MAPPING = {       "2": 1,       "3": 3,               "5": 6,       "6": 8,       "7": 10,         // black keys
                          "q": 0,       "w": 2,       "e": 4, "r": 5,       "t": 7,       "y": 9,        "u": 11} // white keys

let model = null;
let loadModel = async function(){
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');
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

$(document).keypress(async function(e){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  let keyPressed = String.fromCharCode(e.keyCode || e.which);
  if (KEY_TONE_MAPPING.hasOwnProperty(keyPressed) && currentTone != KEY_TONE_MAPPING[keyPressed]){
    currentTone = KEY_TONE_MAPPING[keyPressed];
    synth && synth.triggerAttack(Math.pow(2, (tone + 3) / 12) * 440.0, now);
    lastNotes.push(tone + 1);
    console.log(lastNotes);
  }
//   let noteTensor = tf.oneHot(tf.tensor2d([[tone + 1]], [1, 1], 'int32'), 13);
//   noteTensor = noteTensor.reshape([1, 13, 1]);
//   let chordTensor = tf.oneHot(tf.tensor3d([lastNotes], [1, 4, 4], 'int32'), 13);
//   let prediction = model.predict([chordTensor]);
//   prediction.print();
//   currentChord = Array.from(tf.argMax(prediction.reshape([3, 13]), -1).dataSync());
})

$(document).keyup(async function(){
  synth.triggerRelease(now);
  currentTone = null;
  console.log(lastNotes);
})
