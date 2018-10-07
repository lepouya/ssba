export default class Entity {
  public name: string;

  private _parent?: Entity;
  public readonly children = new Set<Entity>();

  constructor(
    // Unique identifier for this entity
    public readonly id = Math.random().toString(36).substr(2, 9),
    // Last time vectors were calculated, [s]
    public lastUpdated: number = Date.now() / 1000.,
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

    res.type = this.type;
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
      Entity.loadNew(child).parent = this;
    }

    return this;
  }

  cache(): Map<string, Entity> {
    Entity.allEntities.set(this.id, this);

    return Entity.allEntities;
  }

  static allEntities = new Map<string, Entity>();
  static entityTypes = new Map<string, typeof Entity>()
    .set('Entity', Entity);

  static loadNew(data: any): Entity {
    // Copy the entity if it's already present in the cache
    if (Entity.allEntities.has(data.toString())) {
      let entity = Entity.allEntities.get(data.toString());
      if (entity) {
        data = entity.save();
      }
    }

    let entityType = Entity.entityTypes.get(data.type || 'Entity') || Entity;
    let entity = new entityType(data.id, data.updated, data.type);

    return entity.load(data);
  }

  static loadAll(data: any): Map<string, Entity> {
    for (let item in data) {
      Entity.allEntities.set(item, Entity.loadNew(data[item]));
    }

    return Entity.allEntities;
  }

  static saveAll(): any {
    let data: {[k: string]: any} = {};
    Entity.allEntities.forEach((value, key) => data[key] = value.save());

    return data;
  }

  static resetAll() {
    Entity.allEntities.clear();
  }
}
