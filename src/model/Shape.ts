import Entity from "./Entity";

export default class Shape extends Entity {
  static entityTypes = Entity.entityTypes.set('Shape', Shape);

  // Size of each cell
  public cellW = 16;
  public cellH = 16;

  // Bounding box is (-w*cellW/2, -h*cellH/2) - (w*cellW/2, h*cellH/2)
  public w = 0;
  public h = 0;

  // Whitelist and blacklist of all the cells included in this shape
  public readonly allowedCells = new Set<[number, number]>();
  public readonly blockedCells = new Set<[number, number]>();

  // TODO: bg sprite, scaling, animation

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Shape');
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
    if ((x >= this.w) || (y >= this.h) || (x < 0) || (y < 0)) {
      return false;
    } else if (this.blockedCells.has([x, y])) {
      return false;
    } else if (this.allowedCells.has([x, y])) {
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
      for (let y = Math.max(0, dy); y < Math.min(this.h, other.h + dy); x++) {
        if (this.hasCell(x, y)) {
          if (other.hasCell(x - dx, y - dy)) {
            area++;
          }
        }
      }
    }

    return area;
  }

  save(): any {
    let res = super.save();

    res.cellW = this.cellW;
    res.cellH = this.cellH;

    res.w = this.w;
    res.h = this.h;

    if (this.allowedCells.size > 0) {
      res.allowedCells = Array.from(this.allowedCells)
        .map(cell => {x: cell[0]; y: cell[1]});
    }

    if (this.blockedCells.size > 0) {
      res.blockedCells = Array.from(this.blockedCells)
        .map(cell => {x: cell[0]; y: cell[1]});
    }

    return res;
  }

  load(data: any): Entity {
    this.cellW = data.cellW || this.cellW;
    this.cellH = data.cellH || this.cellH;

    this.w = data.w || this.w;
    this.h = data.h || this.h;

    this.allowedCells.clear();
    for (let cell of data.allowedCells || []) {
      this.allowedCells.add([cell.x || 0, cell.y || 0]);
    }

    this.blockedCells.clear();
    for (let cell of data.blockedCells || []) {
      this.blockedCells.add([cell.x || 0, cell.y || 0]);
    }

    return super.load(data);
  }
}
