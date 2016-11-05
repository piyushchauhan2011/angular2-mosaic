import { Component, OnInit } from '@angular/core';

import { TILE_HEIGHT, TILE_WIDTH } from './const';
import { Lib } from './lib';
import { Mosaic, Tile } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  container: Element;
  form: HTMLFormElement;
  el: any;
  canvas: any;
  ctx: CanvasRenderingContext2D;
  mosaicBtn: HTMLElement;
  dragEl: HTMLElement;
  imageName: HTMLElement;
  fr: FileReader;
  img: HTMLImageElement;
  mosaic: Mosaic;

  tiles: Array<any>;
  promises: Array<any>;

  ngOnInit() {
    // Main container element
    this.container = document.getElementById('container');

    // Mosaic form for image file
    this.form = <HTMLFormElement>document.getElementById('mosaicForm');
    this.form.reset(); // clear out files
    this.form.onsubmit = (ev) => {
      ev.preventDefault(); // prevent submission when mosaic button is clicked
    };

    // elements
    this.el = document.getElementById('image');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.mosaicBtn = document.getElementById('createMosaic');
    this.dragEl = document.getElementById('imageDrag');
    this.imageName = document.getElementById('imageName');

    // Image events
    this.el.addEventListener('change', this.onChange.bind(this));
    this.mosaicBtn.addEventListener('click', this.createMosaic.bind(this));

    this.fr = new FileReader(); // For storing the image file data
    this.img = new Image(); // For storing the canvas image element
    this.mosaic = new Mosaic(); // Mosaic for keeping tiles

    this.container.appendChild(this.mosaic.el); // Render a blank mosaic element

    this.imageName.textContent = 'or drop files here '; // drag and drop text box message

    // File drop events
    this.dragEl.addEventListener('dragover', this.fileDragHover.bind(this), false);
    this.dragEl.addEventListener('dragleave', this.fileDragHover.bind(this), false);
    this.dragEl.addEventListener('drop', this.fileSelectHandler.bind(this), false);
  }

  // Clear mosaic and canvas elements when file or route is changed
  clearUI() {
    this.mosaic.updateStyle('');
    this.mosaic.el.innerHTML = '';
    this.canvas.style = `
          display: block;
        `;
  }

  // file drag hover
  fileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type === 'dragover' ? 'hover' : '');
  }

  // file selection
  fileSelectHandler(e) {
    this.clearUI();
    // cancel event and hover styling
    this.fileDragHover(e);
    // fetch FileList object
    let files = e.target.files || e.dataTransfer.files;
    // process all File objects
    for (let i = 0, f; f = files[i]; i++) {
      this.readFile(f);
    }
  }

  // called when file is selected or changed
  onChange() {
    this.clearUI();
    let file = this.el.files[0];
    this.readFile(file);
  }

  // read the selected file and start loading the image
  readFile(file) {
    this.form.reset();
    this.imageName.textContent = file.name;
    this.fr.onload = this.loadImage.bind(this);
    this.fr.readAsDataURL(file);
  }

  // trigger the image load
  loadImage() {
    this.img.onload = this.imageLoaded.bind(this);
    this.img.src = this.fr.result;
  }

  // Render the image on canvas
  imageLoaded() {
    this.tiles = new Array();
    this.promises = new Array();

    this.canvas.width = this.img.width;
    this.canvas.height = this.img.height;
    this.ctx.drawImage(this.img, 0, 0);
  }

  // trigger the creation of mosaic
  // called when create mosaic button is clicked
  createMosaic() {
    // Hide canvas image
    this.canvas.style = `
          display: none;
        `;

    // Show mosaic image
    let style = `
          width: ${this.canvas.width}px;
          height: ${this.canvas.height}px;
        `;
    this.mosaic.updateStyle(style);

    // fetch and render the svg tiles from server to canvas
    this.fetch(this.ctx, this.mosaic, this.canvas.height, this.canvas.width);
    this.renderRow(this.promises, 0);
  }

  fetch(ctx, mosaic, height, width) {
    // Loop over height and width of image as per tile size
    for (let y = 0; y < height; y += TILE_HEIGHT) {
      let localTiles = new Array();
      let localPromises = new Array();
      for (let x = 0; x < width; x += TILE_WIDTH) {
        // Blank tiles rendered to reduce the load
        // while making request and only updating the innerHTML
        let tile = new Tile();
        localTiles.push(tile);
        mosaic.el.appendChild(tile.el);

        // Get the data for the given width & height tile as Uint8 Array
        const imgData = ctx.getImageData(x, y, TILE_WIDTH, TILE_HEIGHT);
        let r, g, b;
        // Average over the color values for rgb channel
        [r, g, b] = Lib.averageColor(imgData);

        // Set up and push the promises for svg tiles fetched from server
        localPromises.push(
          Lib.fetch(
            Lib.rgbToCustomHex(Math.floor(r), Math.floor(g), Math.floor(b))
          )
        );
      }
      // Store tiles and promises for later processing
      this.tiles.push(localTiles);
      // Promise all keeps row to render fully
      this.promises.push(Promise.all(localPromises));
    }
  }

  // Render row from top to bottom while
  // keeping the row invisible until all the data is fetched for given row
  renderRow(promises, idx) {
    if (promises.length === 0) {
      return;
    }
    // Remove the promise in FIFO manner
    promises.shift().then((responses) => {
      let localTiles = this.tiles[idx];
      // For all tiles in a row, patch the innerHTML
      responses.forEach((response, i) => {
        localTiles[i].el.innerHTML = response;
      });
      // Jump to render cycle of next row
      this.renderRow(promises, idx + 1);
    });
  }
}
