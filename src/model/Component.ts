import Entity from "./Entity";
import Shape from "./Shape";
import { Position } from "./Types";

export default class Component extends Entity {
  static entityTypes = Entity.entityTypes.set("Component", Component);

  constructor(
    id?: string,
    lastUpdated?: number,
    type?: string,
    public mass = 0,
    public shape = new Shape(),
  ) {
    super(id, lastUpdated, type || "Component");
  }

  getCenterOfMass(position: Position = { x: 0, y: 0 }): Position {
    return this.shape.getCenterPosition(position);
  }

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    this.shape.update(now);

    // Nothing to update at the moment

    return dt;
  }

  save(): any {
    let res = super.save();

    res.mass = this.mass;
    res.shape = this.shape.save();

    return res;
  }

  load(data: any): Entity {
    this.mass = data.mass || this.mass;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    return super.load(data);
  }
}
