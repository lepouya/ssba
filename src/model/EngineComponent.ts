import Component from "./Component";
import Entity from "./Entity";
import Shape from "./Shape";
import Ship from "./Ship";
import { PolarVector, Position } from "./Types";

const SPEED_TOLERANCE = 0.1;
const ANGLE_TOLERANCE = 0.001;
const DAMPEN = 0.9;

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
    let m = ship.getTotalMass();

    switch (action) {
      case "changeHeading":
        let a1 = params as number;
        let a0 = ship.angle;
        let dA = a1 - a0;

        let vA1 = (a1 - a0) * DAMPEN;
        let vA0 = ship.rotationSpeed;
        let dVA = vA1 - vA0;

        this.power.magnitude = Math.min(
          this.thrustLimit,
          Math.max(ANGLE_TOLERANCE, Math.abs(dVA)) * m * 1000,
        );

        if (dVA > ANGLE_TOLERANCE) {
          // Rotate clockwise
          this.power.angle = -Math.PI / 2;
        } else if (dVA < -ANGLE_TOLERANCE) {
          // Rotate counterclockwise
          this.power.angle = Math.PI / 2;
        } else {
          // Turn off the engines and coast
          this.power.magnitude = 0;
          if (Math.abs(dA) < ANGLE_TOLERANCE) {
            // Target achieved
            this.actions.set(action, null);
          }
        }

        break;

      case "changeSpeed":
        let v0 = ship.speed;
        let v1 = params as number;
        let dV = v1 - v0;

        this.power.magnitude = Math.min(
          this.thrustLimit,
          Math.max(SPEED_TOLERANCE, Math.abs(dV)) * m * DAMPEN,
        );

        if (dV > SPEED_TOLERANCE) {
          // Speed up
          this.power.angle = 0;
        } else if (dV < -SPEED_TOLERANCE) {
          // Slow down
          this.power.angle = Math.PI;
        } else {
          // Turn off the engines
          this.power.magnitude = 0;
          // Target achieved
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
