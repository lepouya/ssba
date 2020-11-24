import Entity from "./Entity";
import Component from "./Component";
import Shape from "./Shape";
import { Angle, Position } from "./Types";

export default class Ship extends Entity {
  static entityTypes = Entity.entityTypes.set("Ship", Ship);

  public dx = 0;
  public dy = 0;
  public da = 0;

  public readonly components = new Map<
    string,
    {
      component: Component;
      position: Position;
    }
  >();

  constructor(
    id?: string,
    lastUpdated?: number,
    type?: string,
    public baseMass = 0,
    public shape = new Shape(),
    public position: Position = { x: 0, y: 0 },
    public angle: Angle = 0,
  ) {
    super(id, lastUpdated, type || "Ship");
  }

  // Get the total mass of ship + components
  getTotalMass(): number {
    return Array.from(this.components.values()).reduce(
      (mass, sc) => mass + sc.component.mass,
      this.baseMass,
    );
  }

  // Get the center of mass of ship + components
  getCenterOfMass(): Position {
    let totalMass = this.getTotalMass();
    let baseCoM = this.shape.getCenterPosition();

    return Array.from(this.components.values()).reduce(
      (CoM, sc) => {
        let componentCoM = sc.component.shape.getCenterPosition(sc.position);
        return {
          x: CoM.x + componentCoM.x * (sc.component.mass / totalMass),
          y: CoM.y + componentCoM.y * (sc.component.mass / totalMass),
        };
      },
      {
        x: baseCoM.x * (this.baseMass / totalMass),
        y: baseCoM.y * (this.baseMass / totalMass),
      },
    );
  }

  // Add a component to the ship, placing it at given location.
  // Uses x,y in component if none supplied.
  // Returns true if placement was successful
  placeComponent(
    component: Component,
    position: Position = { x: 0, y: 0 },
  ): boolean {
    // 1) Check if it it's already in components, remove it
    if (this.components.has(component.id)) {
      this.components.delete(component.id);
    }

    // 2) Check to see it fits in the ship
    let containedArea = this.shape.collisionArea(component.shape, position);
    if (containedArea != component.shape.getArea()) {
      return false;
    }

    // 3) Check collision with other components
    let collisionAreas = Array.from(this.components.values()).map((sc) =>
      sc.component.shape.collisionArea(component.shape, {
        x: position.x - sc.position.x,
        y: position.y - sc.position.y,
      }),
    );
    if (collisionAreas.some((a) => a != 0)) {
      return false;
    }

    // 4) Place
    this.components.set(component.id, { component, position });

    return true;
  }

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    this.shape.update(now);
    this.components.forEach((sc) => sc.component.update(now));

    this.position.x += this.dx * dt;
    this.position.y += this.dy * dt;
    this.angle += this.da * dt;

    return dt;
  }

  save(): any {
    let res = super.save();

    res.baseMass = this.baseMass;

    res.position = this.position;
    res.angle = this.angle;

    res.dx = this.dx;
    res.dy = this.dy;
    res.da = this.da;

    res.shape = this.shape.save();

    if (this.components.size > 0) {
      res.components = Array.from(this.components.values()).map((sc) => {
        return {
          component: sc.component.save(),
          position: sc.position,
        };
      });
    }

    return res;
  }

  load(data: any): Entity {
    this.baseMass = data.baseMass || this.baseMass;

    this.position = data.position || this.position;
    this.angle = data.angle || this.angle;

    this.dx = data.dx || this.dx;
    this.dy = data.dy || this.dy;
    this.da = data.da || this.da;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    this.components.clear();
    for (let sc of data.components || []) {
      this.placeComponent(
        Entity.loadNew(sc.component) as Component,
        sc.position,
      );
    }

    return super.load(data);
  }
}
