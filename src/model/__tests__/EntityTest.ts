import 'mocha';
import { expect } from 'chai';

import Entity from "../Entity";


describe('Entity properties', () => {
  it('Basic info set up correctly', () => {
    let entity = new Entity();

    expect(entity).to.not.be.undefined;
    expect(entity.id).to.not.be.undefined;
    expect(entity.type).to.equal('Entity');

    expect(entity.name).to.equal(entity.id);
    expect(entity.parent).to.be.undefined;
    expect(entity.children).to.be.empty;
  });

  it('Custom construction set up correctly', () => {
    let entity = new Entity('test', 1, 'my entity type');
    entity.name = 'new entity';

    expect(entity.id).to.equal('test');
    expect(entity.type).to.equal('my entity type');
    expect(entity.name).to.equal('new entity');
    expect(entity.lastUpdated).to.equal(1);
  });

  it('Parent-child relationship set up correctly', () => {
    let entity = new Entity();
    let entity2 = new Entity();

    entity.name = 'parent';
    entity2.name = 'child';
    entity2.parent = entity;

    expect(entity.children).to.not.be.empty;
    expect(entity.children).to.include(entity2);
    expect(entity2.parent).to.equal(entity);
  });
});


describe('Entity load and save', () => {
  let pEntity: Entity;
  let c1Entity: Entity;
  let c2Entity: Entity;
  let gcEntity: Entity;

  beforeEach('Setup entities', () => {
    pEntity = new Entity('pid');
    c1Entity = new Entity('cid1');
    c2Entity = new Entity('cid2');
    gcEntity = new Entity('gcid');

    c1Entity.parent = pEntity;
    c2Entity.parent = pEntity;
    gcEntity.parent = c1Entity;
  });

  it('Basic entity save', () => {
    let save = gcEntity.save();

    expect(save).to.include({'id': 'gcid'});
    expect(save).to.include({'name': 'gcid'});
    expect(save).to.include({'type': 'Entity'});
  });

  it('Full hierarchy saving', () => {
    let save = pEntity.save();

    expect(save).to.include({'id': 'pid'});
    expect(save).to.include({'name': 'pid'});
    expect(save).to.include({'type': 'Entity'});

    expect(save).to.nested.include({'children[0].id': 'cid1'});
    expect(save).to.nested.include({'children[1].id': 'cid2'});
    expect(save).to.nested.include({'children[0].children[0].id': 'gcid'});
  });

  it('Basic entity load', () => {
    let load = Entity.loadNew({
      type: "Entity",
      id: "test id",
      updated: 42,
      name: "test name",
    })

    expect(load.id).to.equal('test id');
    expect(load.type).to.equal('Entity');
    expect(load.name).to.equal('test name');
    expect(load.lastUpdated).to.equal(42);
  });

  it('Full hierarchy loading', () => {
    let load = Entity.loadNew({
      type: "Entity",
      id: "test id",
      updated: 42,
      name: "test name",
      children: [
        {
          type: "Entity",
          id: "child id",
          name: "child name",
          children: [
            {
              id: "grandchild id",
              name: "grandchild name"
            },
          ],
        },
      ],
    })

    expect(load.id).to.equal('test id');
    expect(load.type).to.equal('Entity');
    expect(load.name).to.equal('test name');
    expect(load.lastUpdated).to.equal(42);
    expect(load.children).to.not.be.empty;

    let child = load.children.values().next().value;
    expect(child.id).to.equal('child id');
    expect(child.type).to.equal('Entity');
    expect(child.name).to.equal('child name');
    expect(child.children).to.not.be.empty;

    let gchild = child.children.values().next().value;
    expect(gchild.id).to.equal('grandchild id');
    expect(gchild.type).to.equal('Entity');
    expect(gchild.name).to.equal('grandchild name');
    expect(gchild.children).to.be.empty;
  });

  it('Load after save', () => {
    let save = pEntity.save();
    let nEntity = Entity.loadNew(save);

    expect(nEntity).to.deep.equal(pEntity);
  });
});