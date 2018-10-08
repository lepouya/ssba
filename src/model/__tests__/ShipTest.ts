import 'mocha';
import { expect } from 'chai';

import Entity from "../Entity";
import Shape from "../Shape";
import Component from "../Component";
import Ship from "../Ship";

let arrow = new Shape('arrow').setSize(5, 8);
let blockS = new Shape('small block').setSize(1, 1);
let blockM = new Shape('medium block').setSize(2, 2);
let blockL = new Shape('large block').setSize(3, 3);

arrow
  .blockCell(0,7).blockCell(1,7).blockCell(3,7).blockCell(4,7)
  .blockCell(0,6).blockCell(1,6).blockCell(3,6).blockCell(4,6)
  .blockCell(0,5).blockCell(4,5)
  .blockCell(0,4).blockCell(4,4)
  .blockCell(0,3).blockCell(4,3);


describe('Ship properties', () => {
  let ship: Ship;
  let c1: Component;
  let c2: Component;
  let c3: Component;

  beforeEach('Setup ship and components', () => {
    ship = new Ship('ship');
    c1 = new Component('c1');
    c2 = new Component('c2');
    c3 = new Component('c3');
  });

  it('Basic info set up correctly', () => {
    expect(ship.id).to.equal('ship');
    expect(ship.name).to.equal('ship');
    expect(ship.type).to.equal('Ship');
    expect(ship.x).to.equal(0);
    expect(ship.y).to.equal(0);
    expect(ship.baseMass).to.equal(0);

    expect(c1.id).to.equal('c1');
    expect(c1.name).to.equal('c1');
    expect(c1.type).to.equal('Component');
    expect(c1.mass).to.equal(0);
  });

  it('getTotalMass works with components', () => {
    expect(ship.getTotalMass()).to.equal(0);

    ship.components
      .set('c1', {x:0, y:0, component: c1})
      .set('c2', {x:0, y:0, component: c2})
      .set('c3', {x:0, y:0, component: c3});
    expect(ship.getTotalMass()).to.equal(0);

    ship.baseMass = 4;
    expect(ship.getTotalMass()).to.equal(4);

    c1.mass = 1;
    expect(ship.getTotalMass()).to.equal(5);

    c2.mass = 2;
    c3.mass = 3;
    expect(ship.getTotalMass()).to.equal(10);
  });

  it('Load after save returns same basic ship', () => {
    expect(Entity.loadNew(ship.save())).to.deep.equal(ship);
  });

  it('Load after save returns same basic component', () => {
    expect(Entity.loadNew(c1.save())).to.deep.equal(c1);
  });

  it('Load after save returns same composite ship', () => {
    c1.mass = 1;
    c2.mass = 2;
    c3.mass = 3;
    ship.baseMass = 4; ship.x = 16; ship.y = 1;
    ship.components
      .set('c1', {x:1, y:3, component: c1})
      .set('c2', {x:4, y:5, component: c2})
      .set('c3', {x:9, y:4, component: c3});

    expect(Entity.loadNew(ship.save())).to.deep.equal(ship);
  });
});


describe('Ship and component placement', () => {
  let ship: Ship;
  let c1: Component;
  let c2: Component;
  let c3: Component;

  let getComponent = (c: Component) =>
    ship.components.get(c.id) ||
    {x: -5.123, y: -9.33, component: new Component()}

  beforeEach('Setup ship and components', () => {
    ship = new Ship('ship');
    c1 = new Component('c1');
    c2 = new Component('c2');
    c3 = new Component('c3');

    ship.shape = arrow;
    c1.shape = blockS;
    c2.shape = blockM;
    c3.shape = blockL;
  });

  it('Out-of-bounds placements fail', () => {
    expect(ship.placeComponent(c3,0,7)).to.be.false;
    expect(ship.placeComponent(c3,0,6)).to.be.false;
    expect(ship.placeComponent(c3,0,5)).to.be.false;
    expect(ship.placeComponent(c3,0,4)).to.be.false;

    expect(ship.placeComponent(c2,2,6)).to.be.false;
    expect(ship.placeComponent(c3,0,-1)).to.be.false;
  });

  it('Simple component placement', () => {
    expect(ship.placeComponent(c1,2,7)).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c1).x).to.equal(2);
    expect(getComponent(c1).y).to.equal(7);
  });

  it('Placing multiple components', () => {
    expect(ship.placeComponent(c1,2,7)).to.be.true;
    expect(ship.placeComponent(c2,2,4)).to.be.true;
    expect(ship.placeComponent(c3,1,0)).to.be.true;
    expect(ship.components.size).to.equal(3);
    expect(getComponent(c1).x).to.equal(2);
    expect(getComponent(c1).y).to.equal(7);
    expect(getComponent(c2).x).to.equal(2);
    expect(getComponent(c2).y).to.equal(4);
    expect(getComponent(c3).x).to.equal(1);
    expect(getComponent(c3).y).to.equal(0);
  });

  it('Moving a component', () => {
    expect(ship.placeComponent(c2,2,3)).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c2).x).to.equal(2);
    expect(getComponent(c2).y).to.equal(3);

    expect(ship.placeComponent(c2,1,2)).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c2).x).to.equal(1);
    expect(getComponent(c2).y).to.equal(2);
  });

  it('Component collisions', () => {
    expect(ship.placeComponent(c1,1,1)).to.be.true;

    expect(ship.placeComponent(c2,0,0)).to.be.false;
    expect(ship.components.size).to.equal(1);

    expect(ship.placeComponent(c3,1,0)).to.be.false;
    expect(ship.components.size).to.equal(1);

    expect(ship.placeComponent(c3,2,0)).to.be.true;
    expect(ship.components.size).to.equal(2);

    expect(ship.placeComponent(c2,2,2)).to.be.false;
    expect(ship.components.size).to.equal(2);

    expect(ship.placeComponent(c2,2,3)).to.be.true;
    expect(ship.components.size).to.equal(3);
  });
});
