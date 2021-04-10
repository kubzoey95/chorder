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

$(document).keypress(async function(e){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  let tone = KEY_TONE_MAPPING[String.fromCharCode(e.keyCode || e.which)];
  if (tone !== null && currentTone !== tone){
    synth && synth.triggerAttack(Math.pow(2, (tone + 3) / 12) * 440.0, now);
    currentTone = tone;
  }
})

$(document).keyup(async function(){
  synth.triggerRelease(now);
  currentTone = null;
})
