import Entity from "./Entity";

export default class Component extends Entity {
  public mass = 0.;
  public x = 0;
  public y = 0;

  // size + shape?
  // center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Component');
  }

  save(): any {
    let res = super.save();

    res.mass = this.mass;

    res.x = this.x;
    res.y = this.y;

    return res;
  }

  load(data: any): Entity {
    this.mass = data.mass || 0.;

    this.x = data.x || 0;
    this.y = data.y || 0;

    return super.load(data);
  }
}
