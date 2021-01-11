import Entity from "./Entity";
import Component from "./Component";
import Shape from "./Shape";
import { PolarVector, Position } from "./Types";

export default class Ship extends Entity {
  static entityTypes = Entity.entityTypes.set("Ship", Ship);

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
    public angle: number = 0,
    public velocity: Position = { x: 0, y: 0 },
    public rotationSpeed: number = 0,
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
        let componentCoM = sc.component.getCenterOfMass(sc.position);
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
      component.parent = undefined;
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
    component.parent = this;

    return true;
  }

  addVelocity(velocity: PolarVector): Ship {
    this.velocity.x += Math.sin(velocity.angle) * velocity.size;
    this.velocity.y -= Math.cos(velocity.angle) * velocity.size;

    return this;
  }

  applyForce(place: Position, force: PolarVector, dt: number): Ship {
    let mass = this.getTotalMass(),
      CoM = this.getCenterOfMass(),
      baseCoM = this.shape.getCenterPosition();

    // The change in velocity happens as if the force was applied to center
    this.addVelocity({ size: (force.size / mass) * dt, angle: force.angle });

    // Angular momentum is the cross product (place - center) X force
    let torque =
      (place.x - CoM.x) * (force.size * -Math.cos(force.angle - this.angle)) -
      (place.y - CoM.y) * (force.size * Math.sin(force.angle - this.angle));
    // Moment of intertia is sum of all particles (mass * distance^2)
    // We'll just estimate this using the radius of the ship shape
    // TODO: Maybe calculation of total mass should do this per component?
    let I_c = mass * baseCoM.x ** 2 + baseCoM.y ** 2;

    // The angular acceleration is torque / I_c
    this.rotationSpeed += (torque / I_c) * dt;

    return this;
  }

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    this.shape.update(now);
    this.components.forEach((sc) => sc.component.update(now));

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.angle += this.rotationSpeed * dt;

    return dt;
  }

  save(): any {
    let res = super.save();

    res.baseMass = this.baseMass;

    res.position = this.position;
    res.angle = this.angle;

    res.velocity = this.velocity;
    res.rotationSpeed = this.rotationSpeed;

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

    this.velocity = data.velocity || this.velocity;
    this.rotationSpeed = data.rotationSpeed || this.rotationSpeed;

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
