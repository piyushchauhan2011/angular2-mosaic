import { TILE_WIDTH, TILE_HEIGHT } from './const';

export class Lib {
  // fetch data from given url and returns a Promise
  static fetch(color: string) {
    return new Promise((resolve) => {
      resolve(`
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
          xmlns:xlink="http://www.w3.org/1999/xlink" width="${TILE_WIDTH}" height="${TILE_HEIGHT}">
            <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#${color}"></ellipse>
        </svg>
      `);
    });
  }

  // converts uint value to hex string
  // e.g. 125 => '7d'
  static componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  // converts rgb color values to hex string
  // e.g. [125, 70, 12] => '7d460c'
  static rgbToCustomHex(r: number, g: number, b: number) {
    return Lib.componentToHex(r) + Lib.componentToHex(g) + Lib.componentToHex(b);
  }

  // calculates the average of rgb pixel color values for a given image data
  // e.g. see tests.js
  static averageColor(imgData: ImageData) {
    let r, g, b, idx;
    idx = r = g = b = 0;
    // for each pixel as imgData is contains r,g,b,a on consecutive positions
    for (let i = TILE_HEIGHT * TILE_WIDTH; i > 0; i--) {
      // sum the colors
      r += imgData.data[idx++];
      g += imgData.data[idx++];
      b += imgData.data[idx++];
      idx++;
    }
    let total = idx / 4; // get the total count
    // calculate color average
    r /= total;
    g /= total;
    b /= total;

    return [r, g, b];
  }
}
