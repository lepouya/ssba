import Entity from './Entity'

export default class Ship extends Entity {
  public baseMass = 0.;
  public x = 0.;
  public y = 0.;

  // size + shape?
  // components
  // center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Ship');
  }

  get mass() {
    // Add components mass
    return this.baseMass;
  }

  set mass(m: number) {
    this.baseMass = m;
  }

  save(): any {
    let res = super.save();

    res.mass = this.baseMass;
    res.x = this.x;
    res.y = this.y;

    return res;
  }

  load(data: any): Entity {
    this.baseMass = data.mass || 0.;
    this.x = data.x || 0.;
    this.y = data.y || 0.;

    return super.load(data);
  }
}
