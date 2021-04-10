let model;
xd = async function(){
  model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');
  console.log("Model loaded!");
  console.log(model);
}

xd()
