const fs = require('fs');

function inspectFbxBones(filePath) {
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString('ascii');
  
  // Look for Model declarations in FBX (ascii representations often contain "Model: " or similar, or node names are strings)
  // Let's find all occurrences of strings like "Head", "Hand", "Arm", "Shoulder", "Spine", "Hips"
  const regex = /[a-zA-Z0-9_]*(?:[Hh]ead|[Hh]and|[Aa]rm|[Ss]houlder|[Ss]pine|[Hh]ips|[Ff]ore[Aa]rm)[a-zA-Z0-9_]*/g;
  const matches = content.match(regex) || [];
  
  // De-duplicate
  const uniqueNames = Array.from(new Set(matches));
  console.log(`=== Unique bone-like names in ${filePath} ===`);
  uniqueNames.forEach(name => {
    // Filter out names that are too long or contain gibberish
    if (name.length < 50) {
      console.log(`- ${name}`);
    }
  });
}

inspectFbxBones('c:/Users/ashvi/Desktop/portfolio/public/character.fbx');
