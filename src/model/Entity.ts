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

    res.children = Array.from(this.children).map(child => child.save())
    if (this.parent) {
      res.parent = this.parent.id;
    }

    return res;
  }

  load(_: any): Entity {
    return this;
  }

  static loadNew(data: any): Entity {
    let entity = new Entity(
      data.id || undefined,
      data.updated || undefined,
      data.type || undefined,
    );

    switch (data.type || 'Entity') {
      case 'Ship':
        entity = new Ship(entity.id, entity.lastUpdated, entity.type);
        break;
        
      case 'Entity':
      default:
        break;
    }

    entity.name = data.name || entity.name;

    for (let child of data.children || []) {
      entity.children.add(Entity.loadNew(child));
    }

    return entity.load(data);
  }
}
