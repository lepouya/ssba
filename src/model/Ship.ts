import Entity from "./Entity";
import Component from "./Component";
import Shape from "./Shape";

export default class Ship extends Entity {
  static entityTypes = Entity.entityTypes.set('Ship', Ship);

  public baseMass = 0.;
  public x = 0.;
  public y = 0.;

  public shape = new Shape();

  public readonly components = new Set<Component>();

  // TODO: center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Ship');
  }

  // Get the total mass of ship + components
  getTotalMass(): number {
    return Array.from(this.components)
      .reduce((mass, component) => mass + component.mass, this.baseMass);
  }

  // Add a component to the ship, placing it at given location.
  // Uses x,y in component if none supplied.
  // Returns true if placement was successful
  placeComponent(component: Component, x?: number, y?: number): boolean {
    let cx = x || component.x;
    let cy = y || component.y;

    // 1) Check if it it's already in components, remove it
    if (this.components.has(component)) {
      this.components.delete(component);
    }

    // 2) Check to see it fits in the ship
    let containedArea = this.shape.collisionArea(component.shape, cx, cy);
    if (containedArea != component.shape.getArea()) {
      return false;
    }

    // 3) Check collision with other components
    let collisionAreas = Array.from(this.components).map(other =>
      other.shape.collisionArea(component.shape, cx - other.x, cy - other.y));
    if (collisionAreas.some(a => a != 0)) {
      return false;
    }

    // 4) Place
    component.x = cx;
    component.y = cy;
    this.components.add(component);

    return true;
  }

  save(): any {
    let res = super.save();

    res.baseMass = this.baseMass;

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
    this.baseMass = data.baseMass || this.baseMass;

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
