import Entity from "./Entity";
import Component from "./Component";

export default class Ship extends Entity {
  public baseMass = 0.;
  public x = 0.;
  public y = 0.;

  public readonly components = new Set<Component>();

  // size + shape?
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

    if (this.components.size > 0) {
      res.components = Array.from(this.components)
        .map(component => component.save())
    }

    return res;
  }

  load(data: any): Entity {
    this.baseMass = data.mass || 0.;

    this.x = data.x || 0.;
    this.y = data.y || 0.;

    for (let component of data.components || []) {
      this.components.add(Entity.loadNew(component) as Component);
    }

    return super.load(data);
  }
}
