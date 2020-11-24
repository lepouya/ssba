import Entity from "./Entity";
import { Size, Position } from "./Types";

export default class Shape extends Entity {
  static entityTypes = Entity.entityTypes.set("Shape", Shape);

  // Whitelist and blacklist of all the cells included in this shape
  protected readonly allowedCells = new Set<string>();
  protected readonly blockedCells = new Set<string>();

  // TODO: animation

  constructor(
    id?: string,
    lastUpdated?: number,
    type?: string,
    // Size of each cell
    public size: Size = { w: 0, h: 0 },
    // Pixel size of each cell in this shape
    public cellSize: Size = { w: 16, h: 16 },
    // Center of shape as a ratio within the bounding box
    public center: Position = { x: 0.5, y: 0.5 },
    // Sprite information
    public bgKey?: string,
    public bgFrame?: string,
  ) {
    super(id, lastUpdated, type || "Shape");
  }

  // Calculate this shape's center after offesting by the given cells
  getCenterPosition(offset: Position = { x: 0, y: 0 }): Position {
    return {
      x: (offset.x + this.center.x * this.size.w) * this.cellSize.w,
      y: (offset.y + this.center.y * this.size.h) * this.cellSize.h,
    };
  }

  // Allow only specific cells on this shape
  allowCell(p: Position): Shape {
    let s = JSON.stringify(p);
    this.allowedCells.add(s);
    this.blockedCells.delete(s);
    return this;
  }

  // Block a cell from being in the shape
  blockCell(p: Position): Shape {
    let s = JSON.stringify(p);
    this.allowedCells.delete(s);
    this.blockedCells.add(s);
    return this;
  }

  // Calculate the total area covered by this shape
  getArea(): number {
    let baseArea = this.size.w * this.size.h,
      whitelist = this.allowedCells.size,
      blacklist = this.blockedCells.size;
    return (whitelist > 0 ? whitelist : baseArea) - blacklist;
  }

  // Check if this shape has a cell at x,y
  hasCell(p: Position): boolean {
    let s = JSON.stringify(p);
    if (p.x >= this.size.w || p.y >= this.size.h || p.x < 0 || p.y < 0) {
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
  collisionArea(other: Shape, d: Position): number {
    let area = 0;

    // My box is ((0, 0), (w, h)), other box is ((dx, dy), (other.w + dx, other.h + dy))
    for (
      let x = Math.max(0, d.x);
      x < Math.min(this.size.w, other.size.w + d.x);
      x++
    ) {
      for (
        let y = Math.max(0, d.y);
        y < Math.min(this.size.h, other.size.h + d.y);
        y++
      ) {
        if (this.hasCell({ x, y })) {
          if (other.hasCell({ x: x - d.x, y: y - d.y })) {
            area++;
          }
        }
      }
    }

    return area;
  }

  loadMask(
    mask: string,
    start: Position = { x: 0, y: 0 },
    block = false,
  ): Shape {
    mask = mask.toUpperCase().replace(/[^|\n_0.X1O]/g, "");
    let x = start.x,
      y = start.y;

    for (let ch of mask) {
      switch (ch) {
        case "|":
        case "\n":
          // Skip to next line
          if (x > start.x) {
            y++;
            x = start.x;
          }
          break;

        case "X":
        case "1":
        case "O":
          // insert a cell
          if (block) {
            this.blockCell({ x, y });
          } else {
            this.allowCell({ x, y });
          }
          if (x >= this.size.w) {
            this.size.w = x + 1;
          }
          if (y >= this.size.h) {
            this.size.h = y + 1;
          }
          x++;
          break;

        case "_":
        case "0":
        case ".":
          // skip a cell
          if (x >= this.size.w) {
            this.size.w = x + 1;
          }
          if (y >= this.size.h) {
            this.size.h = y + 1;
          }
          x++;
          break;
      }
    }

    return this;
  }

  save(): any {
    let res = super.save();

    res.cellSize = this.cellSize;
    res.size = this.size;
    res.center = this.center;

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
    this.cellSize = data.cellSize || this.cellSize;
    this.size = data.size || this.size;
    this.center = data.center || this.center;

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
