import Component from "./Component";
import Entity from "./Entity";
import Shape from "./Shape";
import Ship from "./Ship";
import { PolarVector } from "./Types";

export default class EngineComponent extends Component {
  static entityTypes = Entity.entityTypes.set(
    "EngineComponent",
    EngineComponent,
  );

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

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    // See if we need to apply a force to the whole ship
    let place = Ship.getComponentPosition(this);
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
        this.parent.applyForce(
          place,
          {
            magnitude: Math.min(this.power.magnitude, this.rcsPower),
            angle: this.power.angle,
          },
          dt,
        );
      }
      // Apply main engine
      else if (
        this.thrustLimit > 0 &&
        Math.abs(this.power.angle) <= this.gimbalLimit
      ) {
        this.parent.applyForce(
          place,
          {
            magnitude: Math.min(this.power.magnitude, this.thrustLimit),
            angle: this.power.angle,
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
