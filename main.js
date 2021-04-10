xd = async function(){
  const model = await tf.loadLayersModel('https://raw.githubusercontent.com/kubzoey95/chorder/main/model.json');

  console.log(model);
}

xd()
