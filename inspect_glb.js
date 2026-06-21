const fs = require('fs');

function printBonePositions(filePath) {
  const data = fs.readFileSync(filePath);
  const chunkLength = data.readUInt32LE(12);
  const jsonStr = data.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonStr);
  
  console.log(`=== Bone local positions in ${filePath} ===`);
  const nodes = gltf.nodes;
  nodes.forEach((node, index) => {
    if (['RightForeArm', 'RightHand', 'LeftForeArm', 'LeftHand', 'Head', 'headfront'].includes(node.name)) {
      console.log(`Node ${index}: name="${node.name}" translation=[${node.translation ? node.translation.join(', ') : '0, 0, 0'}]`);
    }
  });
}

printBonePositions('c:/Users/ashvi/Desktop/portfolio/public/character_animated.glb');
