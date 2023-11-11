// Load in dependencies
const Spritesmith = require('spritesmith');
const fs = require('fs');
const path = require('path');

// node scripts/build-tiles.js
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}
const buildItemName = 'tiles-v1';
const targetSize = 70;
const allImages = walk(path.resolve(__dirname, `../public/static/${buildItemName}`));
const rootStyle = `.sprites-${buildItemName} {
  background-image: url('../images/sprites-${buildItemName}.png');
  background-repeat: no-repeat;
}`;

console.log('allImages', allImages.length);
Spritesmith.run({ src: allImages, padding: 4 }, (err, result) => {
  if (err) throw err;

  const styles = [rootStyle];
  const tsMap = {};
  Object.entries(result.coordinates).forEach(([key, value], index) => {
    const tileValue = key
        .replace(/(.*)public\/static\//, '')
        .replace(/\//g, '-')
        .replace(/\.png/, '');
    const tsName = `${tileValue}`;

    const cssName = tsName.replace(/ /g, '-').replace(/\./g, '-');
    tsMap[tsName] = { x: value.x, y: value.y, width: value.width, height: value.height };
    let margin = '';
    if (value.width !== targetSize) {
      margin = `  margin:${(targetSize - value.height)/2}px 0 0 ${(targetSize - value.width)/2}px;\r\n`
    }
    const css = `.${cssName} {\r\n  background-position: ${-value.x}px ${-value.y}px;\r\n  height: ${value.height}px;\r\n  width: ${value.width}px;\r\n${margin}}`;
    styles.push(css);
  });

  fs.writeFileSync(path.resolve(__dirname, `../src/assets/images/sprites-${buildItemName}.png`), result.image);
  fs.writeFileSync(path.resolve(__dirname, `../src/assets/style/sprites-${buildItemName}.scss`), styles.join('\r\n'));
  console.log(result.coordinates, result.properties);
});
