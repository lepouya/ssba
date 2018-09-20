import Entity from "./Entity";
import Component from "./Component";
import Shape from "./Shape";

export default class Ship extends Entity {
  public baseMass = 0.;
  public x = 0.;
  public y = 0.;

  public shape = new Shape();

  public readonly components = new Set<Component>();

  // center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Ship');
  }

  get mass() {
    return Array.from(this.components)
      .reduce((mass, component) => mass + component.mass, this.baseMass);
  }

  set mass(m: number) {
    this.baseMass = m;
  }

  save(): any {
    let res = super.save();

    res.mass = this.baseMass;

    res.x = this.x;
    res.y = this.y;

    res.shape = this.shape.save();

    if (this.components.size > 0) {
      res.components = Array.from(this.components)
        .map(component => component.save());
    }

    return res;
  }

  load(data: any): Entity {
    this.baseMass = data.mass || this.baseMass;

    this.x = data.x || this.x;
    this.y = data.y || this.y;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    this.components.clear();
    for (let component of data.components || []) {
      this.components.add(Entity.loadNew(component) as Component);
    }

    return super.load(data);
  }
}
