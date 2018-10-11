import Entity from "./Entity";
import Component from "./Component";
import Shape from "./Shape";

type ShipComponent = {
  x: number;
  y: number;
  component: Component;
}

export default class Ship extends Entity {
  static entityTypes = Entity.entityTypes.set('Ship', Ship);

  public baseMass = 0.;

  public x = 0.;
  public y = 0.;
  public angle = 0.;

  public dx = 0.;
  public dy = 0.;
  public da = 0.;

  public shape = new Shape();

  public readonly components = new Map<string, ShipComponent>();

  // TODO: center of mass

  constructor(id?: string, lastUpdated?: number, type?: string) {
    super(id, lastUpdated, type || 'Ship');
  }

  // Get the total mass of ship + components
  getTotalMass(): number {
    return Array.from(this.components.values())
      .reduce((mass, sc) => mass + sc.component.mass, this.baseMass);
  }

  // Add a component to the ship, placing it at given location.
  // Uses x,y in component if none supplied.
  // Returns true if placement was successful
  placeComponent(component: Component, x = 0, y = 0): boolean {
    // 1) Check if it it's already in components, remove it
    if (this.components.has(component.id)) {
      this.components.delete(component.id);
    }

    // 2) Check to see it fits in the ship
    let containedArea = this.shape.collisionArea(component.shape, x, y);
    if (containedArea != component.shape.getArea()) {
      return false;
    }

    // 3) Check collision with other components
    let collisionAreas = Array.from(this.components.values()).map(sc =>
      sc.component.shape.collisionArea(component.shape, x - sc.x, y - sc.y));
    if (collisionAreas.some(a => a != 0)) {
      return false;
    }

    // 4) Place
    this.components.set(component.id, {x, y, component});

    return true;
  }

  update(now?: number): number {
    let dt = super.update(now);
    this.shape.update(now);
    if (dt <= 0.) {
      return 0.;
    }

    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.angle += this.da * dt;

    return dt;
  }

  save(): any {
    let res = super.save();

    res.baseMass = this.baseMass;

    res.x = this.x;
    res.y = this.y;
    res.angle = this.angle;

    res.dx = this.dx;
    res.dy = this.dy;
    res.da = this.da;

    res.shape = this.shape.save();

    if (this.components.size > 0) {
      res.components = Array.from(this.components.values())
        .map(sc => {
          return {
            "x": sc.x,
            "y": sc.y,
            "component": sc.component.save(),
          };
        });
    }

    return res;
  }

  load(data: any): Entity {
    this.baseMass = data.baseMass || this.baseMass;

    this.x = data.x || this.x;
    this.y = data.y || this.y;
    this.angle = data.angle || this.angle;

    this.dx = data.dx || this.dx;
    this.dy = data.dy || this.dy;
    this.da = data.da || this.da;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    this.components.clear();
    for (let sc of data.components || []) {
      this.placeComponent(Entity.loadNew(sc.component) as Component, sc.x, sc.y);
    }

    return super.load(data);
  }
}
