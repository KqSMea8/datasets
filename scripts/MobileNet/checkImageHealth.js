const fs = require('fs');
const path = require('path');
const request = require('request');
const DATA_PATH = path.resolve(__dirname, '../../data/MobileNet');
const imagesAll = require(`${DATA_PATH}/all-images.json`);
let imageHealth;
const IMAGE_HEALTH_PATH = `${DATA_PATH}/image-health.json`;
try {
  imageHealth = require(IMAGE_HEALTH_PATH);
} catch(err) {
  imageHealth = {};
}
const getType = type => {
  if (type === 'image/jpeg' || type === 'image/jpg') {
    return 'jpg';
  } else if (type === 'image/png') {
    return 'png';
  } else if (type === 'image/gif') {
    return 'gif';
  }

  return null;
};

const check = (uri) => new Promise((resolve, reject) => {
  let resolved = false;

  setTimeout(() => {
    if (resolved === false) {
      reject(`Timeout error for ${uri}`);
    }
  }, 10000);
  request.head(uri, (err, res) => {
    if (!res) {
      resolved = true;
      return reject(`No res found for: ${uri}`);
    }
    const type = getType(res.headers['content-type']);
    if (!type) {
      resolved = true;
      return reject(`Invalid type: ${type} for URL: ${uri}`);
    }

    request(uri).on('response', () => {
      resolved = true;
      resolve();
    }).on('close', () => {
      if (resolved === false) {
        resolved = true;
        resolve();
      }
    }).on('error', (err) => {
      resolved = true;
      reject(err);
    });

  });
});

(async function() {
  const entries = Object.entries(imagesAll);
  for (let i = 0; i < entries.length; i++) {
    const [
      key,
      values,
    ] = entries[i];

    if (!imageHealth[key]) {
      imageHealth[key] = {};
    }

    for (let j = 0; j < values.length; j++) {
      if (imageHealth[key][j] === undefined) {
        console.log(key, j);
        const url = values[j];
        try {
          await check(url);
          imageHealth[key] = {
            ...imageHealth[key],
            [j]: 1,
          };
        } catch(err) {
          console.error(err);
          imageHealth[key] = {
            ...imageHealth[key],
            [j]: 0,
          };
        }
      }

      fs.writeFileSync(
        IMAGE_HEALTH_PATH,
        JSON.stringify(imageHealth)
      );
    }
  }
})();
