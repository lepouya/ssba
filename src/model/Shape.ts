import Entity from "./Entity";

export default class Shape extends Entity {

  // Size of each cell
  public cellW = 16;
  public cellH = 16;

  // Bounding box is (-w*cellW/2, -h*cellH/2) - (w*cellW/2, h*cellH/2)
  public w = 0;
  public h = 0;

  // Whitelist and blacklist of all the cells included in this shape
  public readonly allowedCells = new Set<[number, number]>();
  public readonly blockedCells = new Set<[number, number]>();

  // bg sprite, scaling, animation

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Shape');
  }

  // Calculations: area, hasCell, collision

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
