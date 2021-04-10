import Entity from "./Entity";
import Shape from "./Shape";
import Ship from "./Ship";
import { Position } from "./Types";

export default class Component extends Entity {
  static entityTypes = Entity.entityTypes.set("Component", Component);

  public readonly allowedActions = new Set<string>();
  protected actions = new Map<string, any>();

  constructor(
    id?: string,
    lastUpdated?: number,
    type?: string,
    public shape = new Shape(),
    public mass = 0,
  ) {
    super(id, lastUpdated, type || "Component");
  }

  getCenterOfMass(offset: Position = { x: 0, y: 0 }): Position {
    return this.shape.getCenterPosition(offset);
  }

  setAction(action: string, params: any): Component {
    if (this.allowedActions.has(action)) {
      this.actions.set(action, params);
    }

    return this;
  }

  protected performAction(
    _ship: Ship,
    _place: Position,
    _action: string,
    _params: any,
  ): void {}

  update(now?: number): number {
    let dt = super.update(now);
    if (dt <= 0) {
      return 0;
    }

    this.shape.update(now);

    // Specialized components to override their own update actions
    let place = Ship.getComponentPosition(this);
    if (this.parent instanceof Ship && place !== undefined) {
      this.actions.forEach((param, action) =>
        param !== null && param !== undefined
          ? this.performAction(this.parent! as Ship, place!, action, param)
          : param,
      );
    }

    return dt;
  }

  save(): any {
    let res = super.save();

    res.mass = this.mass;
    res.shape = this.shape.save();

    return res;
  }

  load(data: any): Entity {
    this.mass = data.mass || this.mass;

    if (data.shape) {
      this.shape = Entity.loadNew(data.shape) as Shape;
    }

    return super.load(data);
  }
}
