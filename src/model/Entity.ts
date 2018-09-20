import Component from "./Component";
import Shape from "./Shape";
import Ship from "./Ship";

export default class Entity {
  public name: string;

  private _parent?: Entity;
  public readonly children = new Set<Entity>();

  constructor(
    // Unique identifier for this entity
    public readonly id = Math.random().toString(36).substr(2, 9),
    // Last time vectors were calculated, [s]
    protected lastUpdated: number = Date.now() / 1000,
    // Type of this entity
    public readonly type = 'Entity',
  ) {
    this.name = id;
  }

  get parent() {
    return this._parent;
  }

  set parent(parent: Entity | undefined) {
    if (this._parent) {
      this._parent.children.delete(this);
    }

    if (parent && (parent != this)) {
      this._parent = parent;
    } else {
      this._parent = undefined;
    }

    if (this._parent) {
      this._parent.children.add(this);
    }
  }

  save(): any {
    let res: any = {};

    res.id = this.id;
    res.updated = this.lastUpdated;

    res.name = this.name;

    if (this.children.size > 0) {
      res.children = Array.from(this.children)
        .map(child => child.save());
    }

    if (this.parent) {
      res.parent = this.parent.id;
    }

    return res;
  }

  load(data: any): Entity {
    this.name = data.name || this.name;

    this.children.clear();
    for (let child of data.children || []) {
      this.children.add(Entity.loadNew(child));
    }

    return this;
  }

  static loadNew(data: any): Entity {
    let entity: Entity;

    switch (data.type || 'Entity') {
      case 'Shape':
        entity = new Shape(
          data.id || undefined,
          data.updated || undefined,
          data.type || undefined,
        );
        break;

      case 'Component':
        entity = new Component(
          data.id || undefined,
          data.updated || undefined,
          data.type || undefined,
        );
        break;

      case 'Ship':
        entity = new Ship(
          data.id || undefined,
          data.updated || undefined,
          data.type || undefined,
        );
        break;

      case 'Entity':
      default:
        entity = new Entity(
          data.id || undefined,
          data.updated || undefined,
          data.type || undefined,
        );
        break;
    }

    return entity.load(data);
  }
}
