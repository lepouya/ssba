import Entity from "./Entity";

export default class Shape extends Entity {
  static entityTypes = Entity.entityTypes.set("Shape", Shape);

  // Size of each cell
  public cellW = 16;
  public cellH = 16;

  // Bounding box is (-w*cellW/2, -h*cellH/2) - (w*cellW/2, h*cellH/2)
  public w = 0;
  public h = 0;

  // Whitelist and blacklist of all the cells included in this shape
  protected readonly allowedCells = new Set<string>();
  protected readonly blockedCells = new Set<string>();

  // Sprite information
  public bgKey?: string;
  public bgFrame?: string;

  // TODO: animation

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || "Shape");
  }

  setSize(width: number, height: number): Shape {
    this.w = width;
    this.h = height;
    return this;
  }

  // Allow only specific cells on this shape
  allowCell(x: number, y: number): Shape {
    let s = `(${x},${y})`; // Sets work really weird with tuple entries
    this.allowedCells.add(s);
    this.blockedCells.delete(s);
    return this;
  }

  // Block a cell from being in the shape
  blockCell(x: number, y: number): Shape {
    let s = `(${x},${y})`;
    this.allowedCells.delete(s);
    this.blockedCells.add(s);
    return this;
  }

  // Calculate the total area covered by this shape
  getArea(): number {
    let baseArea = this.w * this.h,
      whitelist = this.allowedCells.size,
      blacklist = this.blockedCells.size;
    return (whitelist > 0 ? whitelist : baseArea) - blacklist;
  }

  // Check if this shape has a cell at x,y
  hasCell(x: number, y: number): boolean {
    let s = `(${x},${y})`;
    if (x >= this.w || y >= this.h || x < 0 || y < 0) {
      return false;
    } else if (this.blockedCells.has(s)) {
      return false;
    } else if (this.allowedCells.has(s)) {
      return true;
    } else if (this.allowedCells.size == 0) {
      return true;
    } else {
      return false;
    }
  }

  // Check how much of this shape is covered by another shape
  collisionArea(other: Shape, dx = 0, dy = 0): number {
    let area = 0;

    // My box is ((0, 0), (w, h)), other box is ((dx, dy), (other.w + dx, other.h + dy))
    for (let x = Math.max(0, dx); x < Math.min(this.w, other.w + dx); x++) {
      for (let y = Math.max(0, dy); y < Math.min(this.h, other.h + dy); y++) {
        if (this.hasCell(x, y)) {
          if (other.hasCell(x - dx, y - dy)) {
            area++;
          }
        }
      }
    }

    return area;
  }

  loadMask(mask: string, startX = 0, startY = 0, block = false): Shape {
    mask = mask.toUpperCase().replace(/[^|\n_0.X1O]/g, "");
    let x = startX,
      y = startY;

    for (let ch of mask) {
      switch (ch) {
        case "|":
        case "\n":
          // Skip to next line
          if (x > startX) {
            y++;
            x = startX;
          }
          break;

        case "X":
        case "1":
        case "O":
          // insert a cell
          if (block) {
            this.blockCell(x, y);
          } else {
            this.allowCell(x, y);
          }
          if (x >= this.w) {
            this.w = x + 1;
          }
          if (y >= this.h) {
            this.h = y + 1;
          }
          x++;
          break;

        case "_":
        case "0":
        case ".":
          // skip a cell
          if (x >= this.w) {
            this.w = x + 1;
          }
          if (y >= this.h) {
            this.h = y + 1;
          }
          x++;
          break;
      }
    }

    return this;
  }

  save(): any {
    let res = super.save();

    res.cellW = this.cellW;
    res.cellH = this.cellH;

    res.w = this.w;
    res.h = this.h;

    res.bgKey = this.bgKey;
    res.bgFrame = this.bgFrame;

    if (this.allowedCells.size > 0) {
      res.allowedCells = Array.from(this.allowedCells);
    }

    if (this.blockedCells.size > 0) {
      res.blockedCells = Array.from(this.blockedCells);
    }

    return res;
  }

  load(data: any): Entity {
    this.cellW = data.cellW || this.cellW;
    this.cellH = data.cellH || this.cellH;

    this.w = data.w || this.w;
    this.h = data.h || this.h;

    if (data.bgKey) {
      this.bgKey = data.bgKey;
    }
    if (data.bgFrame) {
      this.bgFrame = data.bgFrame;
    }

    this.allowedCells.clear();
    for (let cell of data.allowedCells || []) {
      this.allowedCells.add(cell);
    }

    this.blockedCells.clear();
    for (let cell of data.blockedCells || []) {
      this.blockedCells.add(cell);
    }

    if (data.mask) {
      this.loadMask(data.mask);
    }

    return super.load(data);
  }
}
