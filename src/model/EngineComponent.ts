import Component from "./Component";
import Entity from "./Entity";
import Shape from "./Shape";
import Ship from "./Ship";
import { PolarVector, Position } from "./Types";

const TOLERANCE = 1;

export default class EngineComponent extends Component {
  static entityTypes = Entity.entityTypes.set(
    "EngineComponent",
    EngineComponent,
  );

  public readonly allowedActions = new Set<string>([
    "changeHeading",
    "changeSpeed",
    "changeVelocity",
  ]);

  public power: PolarVector;

  constructor(
    id?: string,
    lastUpdated?: number,
    type?: string,
    public shape = new Shape(),
    public mass = 0,
    public thrustLimit = 0,
    public gimbalLimit = 0,
    public rcsPower = 0,
  ) {
    super(id, lastUpdated, type || "EngineComponent", shape, mass);
    this.power = { magnitude: 0, angle: 0 };
  }

  protected performAction(
    ship: Ship,
    _place: Position,
    action: string,
    params: any,
  ): void {
    switch (action) {
      case "changeHeading":
        break;

      case "changeSpeed":
        let targetSpeed = params as number;
        let currentSpeed = ship.speed;
        let dV = targetSpeed - currentSpeed;
        let m = ship.getTotalMass();

        if (dV > TOLERANCE) {
          // Speed up
          this.power = {
            magnitude: Math.max(TOLERANCE, Math.min(this.thrustLimit, dV * m)),
            angle: 0,
          };
        } else if (dV < -TOLERANCE) {
          // Slow down
          this.power = {
            magnitude: Math.max(TOLERANCE, Math.min(this.thrustLimit, dV * m)),
            angle: Math.PI,
          };
        } else {
          // Turn off the engines
          this.power = { magnitude: 0, angle: 0 };
          this.actions.set(action, null);
        }

        break;

      case "changeVelocity":
        break;
    }
  }

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    // See if we need to apply a force to the whole ship
    let place = this.getCenterOfMass(Ship.getComponentPosition(this));
    if (
      this.parent instanceof Ship &&
      this.power.magnitude > 0 &&
      place != undefined
    ) {
      // Apply reaction controls if needed
      if (
        this.rcsPower > 0 &&
        (this.power.magnitude <= this.rcsPower ||
          Math.abs(this.power.angle) > this.gimbalLimit)
      ) {
        this.parent.applyForceAbsolute(
          place,
          {
            magnitude: Math.min(this.power.magnitude, this.rcsPower),
            angle: this.power.angle + this.parent.angle,
          },
          dt,
        );
      }
      // Apply main engine
      else if (
        this.thrustLimit > 0 &&
        Math.abs(this.power.angle) <= this.gimbalLimit
      ) {
        this.parent.applyForceAbsolute(
          place,
          {
            magnitude: Math.min(this.power.magnitude, this.thrustLimit),
            angle: this.power.angle + this.parent.angle,
          },
          dt,
        );
      }
    }

    return dt;
  }

  save(): any {
    let res = super.save();

    res.thrustLimit = this.thrustLimit;
    res.gimbalLimit = this.gimbalLimit;
    res.rcsPower = this.rcsPower;

    return res;
  }

  load(data: any): Entity {
    this.thrustLimit = data.thrustLimit || this.thrustLimit;
    this.gimbalLimit = data.gimbalLimit || this.gimbalLimit;
    this.rcsPower = data.rcsPower || this.rcsPower;

    return super.load(data);
  }
}
