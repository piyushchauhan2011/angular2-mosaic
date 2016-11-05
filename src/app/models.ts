// Mosaic class to hold tiles as its children nodes
export class Mosaic {
  el: any;
  constructor() {
    this.el = <HTMLElement>document.createElement('div');
    this.el.innerHTML = '';
  }

  updateStyle(style: any) {
    this.el.style = style;
  }
}

// Tile class to create and hold reference to individual tiles
export class Tile {
  el: HTMLElement;
  constructor() {
    this.el = document.createElement('span');
    this.el.innerHTML = '';
  }

  updateHTML(innerHTML) {
    this.el.innerHTML = innerHTML;
  }
}
