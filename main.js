const KEY_TONE_MAPPING = {       "2": 1,       "3": 3,               "5": 6,       "6": 8,       "7": 10,         // black keys
                          "Q": 0,       "W": 2,       "E": 4, "R": 5,       "T": 7,       "Y": 9,        "U": 11} // white keys

let model = null;
let loadModel = async function(){
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');
  console.log("Model loaded!");
  console.log(model);
}

loadModel()

let synth = null;

let loadSynth = async function(){
//   await Tone.start();
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
  console.log(String.fromCharCode(e.keyCode || e.which));
  let tone = KEY_TONE_MAPPING[String.fromCharCode(e.keyCode || e.which)];
  if (tone && currentTone !== tone){
    synth && synth.triggerAttack(Math.pow(2, (tone + 3) / 12) * 440.0, now);
    currentTone = tone;
  }
})
// synth.triggerAttackRelease(Math.pow(2, (currNote.keyProps[0].int_value - 57) / 12) *440.0, 0.4, now)
