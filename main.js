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

$(document).keydown(function(){
  if(!toneStarted){
    await Tone.start();
    toneStarted = true;
  }
  synth.triggerAttackRelease('A3', '4n');
})
// synth.triggerAttackRelease(Math.pow(2, (currNote.keyProps[0].int_value - 57) / 12) *440.0, 0.4, now)
