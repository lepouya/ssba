export default class Entity {
  public name: string;

  private _parent?: Entity;
  public readonly children = new Set<Entity>();

  constructor(
    // Unique identifier for this entity
    public readonly id = Math.random().toString(36).substr(2, 9),
    // Last time vectors were calculated, [s]
    public lastUpdated: number = Date.now() / 1000,
    // Type of this entity
    public readonly type = "Entity",
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

    if (parent && parent != this) {
      this._parent = parent;
    } else {
      this._parent = undefined;
    }

    if (this._parent) {
      this._parent.children.add(this);
    }
  }

  update(now = Date.now() / 1000): number {
    let dt = now - this.lastUpdated;
    if (dt <= 0) {
      return 0;
    }

    this.children.forEach((entity) => entity.update(now));
    this.lastUpdated = now;
    return dt;
  }

  save(): any {
    let res: any = {};

    res.type = this.type;
    res.id = this.id;
    res.updated = this.lastUpdated;

    res.name = this.name;

    if (this.children.size > 0) {
      res.children = Array.from(this.children).map((child) => child.save());
    }

    return res;
  }

  load(data: any): Entity {
    this.name = data.name || this.name;

    this.children.clear();
    for (let child of data.children || []) {
      Entity.loadNew(child).parent = this;
    }

    return this;
  }

  cache(): Map<string, Entity> {
    Entity.allEntities.set(this.id, this);

    return Entity.allEntities;
  }

  static allEntities = new Map<string, Entity>();
  static entityTypes = new Map<string, typeof Entity>().set("Entity", Entity);

  static loadNew(data: any): Entity {
    // Copy the entity if it's already present in the cache
    let name = data.toString() as string;
    if (Entity.allEntities.has(name)) {
      let entity = Entity.allEntities.get(name);
      if (entity) {
        data = entity.save();
        data.id = undefined;
        data.name = name;
      }
    }

    let entityType = Entity.entityTypes.get(data.type || "Entity") || Entity;
    let entity = new entityType(data.id, data.updated, data.type);

    return entity.load(data);
  }
}
