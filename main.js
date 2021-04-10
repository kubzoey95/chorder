import "./Tone.js"

let model = null;
loadModel = async function(){
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');
  console.log("Model loaded!");
  console.log(model);
}

loadModel()

let synth = null;

loadSynth = async function(){
  await Tone.start();
  synth = new Tone.Synth().toMaster();
  console.log("Synth loaded!");
  console.log(synth);
}

// synth.triggerAttackRelease(Math.pow(2, (currNote.keyProps[0].int_value - 57) / 12) *440.0, 0.4, now)
