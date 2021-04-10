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
let lastFourChords = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

$(document).keypress(async function(e){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  let tone = KEY_TONE_MAPPING[String.fromCharCode(e.keyCode || e.which)];
  if (tone !== undefined && currentTone !== tone){
    let noteTensor = tf.oneHot(tf.tensor2d([[tone + 1]], [1, 1], 'int32'), 13);
    noteTensor = noteTensor.reshape([1, 13, 1]);
    let chordTensor = tf.oneHot(tf.tensor3d([lastFourChords], [1, 4, 4], 'int32'), 13);
    let prediction = await model.predict([chordTensor, noteTensor]);
    currentChord = prediction.map(e => Array.from(tf.argMax(e.reshape([13])).dataSync()));
    
    synth && synth.triggerAttack(Math.pow(2, (tone + 3) / 12) * 440.0, now);
    currentTone = tone;
  }
})

$(document).keyup(async function(){
  synth.triggerRelease(now);
  if (currentTone !== null && currentChord !== null){
    lastFourChords = lastFourChords.slice(1);
    lastFourChords.push(currentChord);
    lastFourChords[lastFourChords.length - 1].push(currentTone + 1)
  }
  currentTone = null;
  currentChord = null;
  console.log(lastFourChords);
})
