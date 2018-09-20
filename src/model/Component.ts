import Entity from "./Entity";
import Shape from "./Shape";

export default class Component extends Entity {
  public mass = 0.;
  public x = 0;
  public y = 0;

  public shape = new Shape();

  // TODO: center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Component');
  }

  save(): any {
    let res = super.save();

    res.mass = this.mass;

    res.x = this.x;
    res.y = this.y;

    res.shape = this.shape.save();

    return res;
  }

  load(data: any): Entity {
    this.mass = data.mass || this.mass;

    this.x = data.x || this.x;
    this.y = data.y || this.y;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    return super.load(data);
  }
}
