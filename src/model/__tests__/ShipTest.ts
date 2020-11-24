import "mocha";
import { expect } from "chai";

import Entity from "../Entity";
import Shape from "../Shape";
import Component from "../Component";
import Ship from "../Ship";

let arrow = new Shape("arrow", undefined, undefined, { w: 5, h: 8 });
let blockS = new Shape("small block", undefined, undefined, { w: 1, h: 1 });
let blockM = new Shape("medium block", undefined, undefined, { w: 2, h: 2 });
let blockL = new Shape("large block", undefined, undefined, { w: 3, h: 3 });

arrow.loadMask(
  " |_____\
    |_____\
    |_____\
    |X___X\
    |X___X\
    |X___X\
    |XX_XX\
    |XX_XX",
  undefined,
  true,
);

describe("Ship properties", () => {
  let ship: Ship;
  let c1: Component;
  let c2: Component;
  let c3: Component;

  beforeEach("Setup ship and components", () => {
    ship = new Ship("ship");
    c1 = new Component("c1");
    c2 = new Component("c2");
    c3 = new Component("c3");
  });

  it("Basic info set up correctly", () => {
    expect(ship.id).to.equal("ship");
    expect(ship.name).to.equal("ship");
    expect(ship.type).to.equal("Ship");
    expect(ship.position.x).to.equal(0);
    expect(ship.position.y).to.equal(0);
    expect(ship.baseMass).to.equal(0);

    expect(c1.id).to.equal("c1");
    expect(c1.name).to.equal("c1");
    expect(c1.type).to.equal("Component");
    expect(c1.mass).to.equal(0);
  });

  it("getTotalMass works with components", () => {
    expect(ship.getTotalMass()).to.equal(0);

    ship.components
      .set("c1", { position: { x: 0, y: 0 }, component: c1 })
      .set("c2", { position: { x: 0, y: 0 }, component: c2 })
      .set("c3", { position: { x: 0, y: 0 }, component: c3 });
    expect(ship.getTotalMass()).to.equal(0);

    ship.baseMass = 4;
    expect(ship.getTotalMass()).to.equal(4);

    c1.mass = 1;
    expect(ship.getTotalMass()).to.equal(5);

    c2.mass = 2;
    c3.mass = 3;
    expect(ship.getTotalMass()).to.equal(10);
  });

  it("Load after save returns same basic ship", () => {
    expect(Entity.loadNew(ship.save())).to.deep.equal(ship);
  });

  it("Load after save returns same basic component", () => {
    expect(Entity.loadNew(c1.save())).to.deep.equal(c1);
  });

  it("Load after save returns same composite ship", () => {
    c1.mass = 1;
    c2.mass = 2;
    c3.mass = 3;
    ship.baseMass = 4;
    ship.position = { x: 16, y: 1 };
    ship.components
      .set("c1", { position: { x: 1, y: 3 }, component: c1 })
      .set("c2", { position: { x: 4, y: 5 }, component: c2 })
      .set("c3", { position: { x: 9, y: 4 }, component: c3 });
    c1.parent = c2.parent = c3.parent = ship;

    expect(Entity.loadNew(ship.save())).to.deep.equal(ship);
  });
});

describe("Ship and component placement", () => {
  let ship: Ship;
  let c1: Component;
  let c2: Component;
  let c3: Component;

  let getComponent = (c: Component) =>
    ship.components.get(c.id) || {
      component: new Component(),
      position: { x: -5.123, y: -9.33 },
    };

  beforeEach("Setup ship and components", () => {
    ship = new Ship("ship");
    c1 = new Component("c1");
    c2 = new Component("c2");
    c3 = new Component("c3");

    ship.shape = arrow;
    c1.shape = blockS;
    c2.shape = blockM;
    c3.shape = blockL;
  });

  it("Out-of-bounds placements fail", () => {
    expect(ship.placeComponent(c3, { x: 0, y: 7 })).to.be.false;
    expect(ship.placeComponent(c3, { x: 0, y: 6 })).to.be.false;
    expect(ship.placeComponent(c3, { x: 0, y: 5 })).to.be.false;
    expect(ship.placeComponent(c3, { x: 0, y: 4 })).to.be.false;

    expect(ship.placeComponent(c2, { x: 2, y: 6 })).to.be.false;
    expect(ship.placeComponent(c3, { x: 0, y: -1 })).to.be.false;
  });

  it("Simple component placement", () => {
    expect(ship.placeComponent(c1, { x: 2, y: 7 })).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c1).position.x).to.equal(2);
    expect(getComponent(c1).position.y).to.equal(7);
  });

  it("Placing multiple components", () => {
    expect(ship.placeComponent(c1, { x: 2, y: 7 })).to.be.true;
    expect(ship.placeComponent(c2, { x: 2, y: 4 })).to.be.true;
    expect(ship.placeComponent(c3, { x: 1, y: 0 })).to.be.true;
    expect(ship.components.size).to.equal(3);
    expect(getComponent(c1).position.x).to.equal(2);
    expect(getComponent(c1).position.y).to.equal(7);
    expect(getComponent(c2).position.x).to.equal(2);
    expect(getComponent(c2).position.y).to.equal(4);
    expect(getComponent(c3).position.x).to.equal(1);
    expect(getComponent(c3).position.y).to.equal(0);
  });

  it("Moving a component", () => {
    expect(ship.placeComponent(c2, { x: 2, y: 3 })).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c2).position.x).to.equal(2);
    expect(getComponent(c2).position.y).to.equal(3);

    expect(ship.placeComponent(c2, { x: 1, y: 2 })).to.be.true;
    expect(ship.components.size).to.equal(1);
    expect(getComponent(c2).position.x).to.equal(1);
    expect(getComponent(c2).position.y).to.equal(2);
  });

  it("Component collisions", () => {
    expect(ship.placeComponent(c1, { x: 1, y: 1 })).to.be.true;

    expect(ship.placeComponent(c2, { x: 0, y: 0 })).to.be.false;
    expect(ship.components.size).to.equal(1);

    expect(ship.placeComponent(c3, { x: 1, y: 0 })).to.be.false;
    expect(ship.components.size).to.equal(1);

    expect(ship.placeComponent(c3, { x: 2, y: 0 })).to.be.true;
    expect(ship.components.size).to.equal(2);

    expect(ship.placeComponent(c2, { x: 2, y: 2 })).to.be.false;
    expect(ship.components.size).to.equal(2);

    expect(ship.placeComponent(c2, { x: 2, y: 3 })).to.be.true;
    expect(ship.components.size).to.equal(3);
  });
});

describe("Ship mass and acceleration", () => {
  let ship: Ship;
  let c1a: Component;
  let c1b: Component;
  let c2a: Component;
  let c2b: Component;
  let c3: Component;

  beforeEach("Setup ship and components", () => {
    ship = new Ship("ship", undefined, undefined, 10, arrow);
    c1a = new Component("c1a", undefined, undefined, 1, blockS);
    c1b = new Component("c1b", undefined, undefined, 1, blockS);
    c2a = new Component("c2a", undefined, undefined, 2, blockM);
    c2b = new Component("c2b", undefined, undefined, 2, blockM);
    c3 = new Component("c3", undefined, undefined, 5, blockL);

    arrow.center = { x: 0.5, y: 0.5 };
    blockS.center = { x: 0.5, y: 0.5 };
    blockM.center = { x: 0.5, y: 0.5 };
    blockL.center = { x: 0.5, y: 0.5 };
  });

  it("base center of mass with no components", () => {
    expect(ship.getCenterOfMass()).to.deep.equal({ x: 40, y: 64 });
  });

  it("lowered ship center of mass", () => {
    ship.shape.center = { x: 2.5 / 5, y: 2.5 / 8 };
    expect(ship.getCenterOfMass()).to.deep.equal({ x: 40, y: 40 });
  });

  it("center of mass with one component", () => {
    expect(ship.placeComponent(c3, { x: 1, y: 0 })).to.be.true;
    expect(ship.getCenterOfMass().x).to.equal(40);
    expect(ship.getCenterOfMass().y).to.be.approximately(50.666, 0.01);
  });

  it("symmetric center of mass", () => {
    expect(ship.placeComponent(c2a, { x: 0, y: 0 })).to.be.true;
    expect(ship.placeComponent(c2b, { x: 3, y: 0 })).to.be.true;
    expect(ship.placeComponent(c1a, { x: 2, y: 6 })).to.be.true;
    expect(ship.placeComponent(c1b, { x: 2, y: 7 })).to.be.true;
    expect(ship.getCenterOfMass().x).to.be.approximately(40, 0.01);
    expect(ship.getCenterOfMass().y).to.be.approximately(58, 0.01);
  });

  it("asymmetric center of mass", () => {
    expect(ship.placeComponent(c3, { x: 0, y: 0 })).to.be.true;
    expect(ship.placeComponent(c2a, { x: 1, y: 4 })).to.be.true;
    expect(ship.placeComponent(c1a, { x: 4, y: 1 })).to.be.true;
    expect(ship.placeComponent(c1b, { x: 2, y: 7 })).to.be.true;
    expect(ship.getCenterOfMass().x).to.be.approximately(36.632, 0.01);
    expect(ship.getCenterOfMass().y).to.be.approximately(56, 0.01);
  });
});
