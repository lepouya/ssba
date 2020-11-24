import "mocha";
import { expect } from "chai";

import Shape from "../Shape";
import Entity from "../Entity";

let screen = new Shape("screen", 0, undefined, { w: 10, h: 10 });
let block = new Shape("block", 1, undefined, { w: 3, h: 3 });
let plus = new Shape("plus", 3.14, undefined, { w: 3, h: 3 });
let cross = new Shape("cross", 42, undefined, { w: 3, h: 3 });

screen
  .blockCell({ x: 4, y: 4 })
  .blockCell({ x: 4, y: 5 })
  .blockCell({ x: 5, y: 4 })
  .blockCell({ x: 5, y: 5 });

plus
  .allowCell({ x: 1, y: 0 })
  .allowCell({ x: 0, y: 1 })
  .allowCell({ x: 1, y: 1 })
  .allowCell({ x: 2, y: 1 })
  .allowCell({ x: 1, y: 2 });

cross
  .blockCell({ x: 1, y: 0 })
  .blockCell({ x: 1, y: 2 })
  .blockCell({ x: 0, y: 1 })
  .blockCell({ x: 2, y: 1 });

describe("Shape properties", () => {
  it("Basic info set up correctly", () => {
    expect(screen.size.w).to.equal(10);
    expect(screen.size.h).to.equal(10);

    expect(block.size.w).to.equal(3);
    expect(block.size.h).to.equal(3);
  });

  it("getArea returns correct size", () => {
    expect(screen.getArea()).to.equal(10 * 10 - 4);
    expect(block.getArea()).to.equal(3 * 3);
    expect(plus.getArea()).to.equal(5);
    expect(cross.getArea()).to.equal(5);
  });

  it("hasCell returns correct info", () => {
    expect(screen.hasCell({ x: 0, y: 0 })).to.be.true;
    expect(screen.hasCell({ x: 1, y: 0 })).to.be.true;
    expect(screen.hasCell({ x: 1, y: 9 })).to.be.true;
    expect(screen.hasCell({ x: 10, y: 1 })).to.be.false;
    expect(screen.hasCell({ x: 4, y: 4 })).to.be.false;

    expect(block.hasCell({ x: 0, y: 0 })).to.be.true;
    expect(block.hasCell({ x: 1, y: 0 })).to.be.true;
    expect(block.hasCell({ x: 1, y: 9 })).to.be.false;
    expect(block.hasCell({ x: 10, y: 1 })).to.be.false;
    expect(block.hasCell({ x: 2, y: 2 })).to.be.true;

    expect(plus.hasCell({ x: 0, y: 0 })).to.be.false;
    expect(plus.hasCell({ x: 1, y: 0 })).to.be.true;
    expect(plus.hasCell({ x: 2, y: 0 })).to.be.false;
    expect(plus.hasCell({ x: 3, y: 0 })).to.be.false;
    expect(plus.hasCell({ x: 0, y: 1 })).to.be.true;
    expect(plus.hasCell({ x: 1, y: 1 })).to.be.true;

    expect(cross.hasCell({ x: 0, y: 0 })).to.be.true;
    expect(cross.hasCell({ x: 1, y: 0 })).to.be.false;
    expect(cross.hasCell({ x: 2, y: 0 })).to.be.true;
    expect(cross.hasCell({ x: 3, y: 0 })).to.be.false;
    expect(cross.hasCell({ x: 0, y: 1 })).to.be.false;
    expect(cross.hasCell({ x: 1, y: 1 })).to.be.true;
  });

  it("hasCell and getArea return same value", () => {
    let sum = (s: Shape) =>
      Array.from(Array(12).keys()).reduce(
        (c, x) =>
          Array.from(Array(12).keys()).reduce(
            (d, y) => d + (s.hasCell({ x: x - 1, y: y - 1 }) ? 1 : 0),
            c,
          ),
        0,
      );

    expect(sum(screen)).to.equal(screen.getArea());
    expect(sum(block)).to.equal(block.getArea());
    expect(sum(plus)).to.equal(plus.getArea());
    expect(sum(cross)).to.equal(cross.getArea());
  });

  it("Load after save returns same object", () => {
    expect(Entity.loadNew(screen.save())).to.deep.equal(screen);
    expect(Entity.loadNew(block.save())).to.deep.equal(block);
    expect(Entity.loadNew(plus.save())).to.deep.equal(plus);
    expect(Entity.loadNew(cross.save())).to.deep.equal(cross);
  });
});

describe("Shape collisions", () => {
  it("Clean containment", () => {
    expect(screen.collisionArea(block, { x: 0, y: 0 })).to.equal(9);
    expect(screen.collisionArea(block, { x: 1, y: 6 })).to.equal(9);
    expect(screen.collisionArea(block, { x: 6, y: 6 })).to.equal(9);
    expect(screen.collisionArea(block, { x: 6, y: 1 })).to.equal(9);

    expect(screen.collisionArea(plus, { x: 0, y: 0 })).to.equal(5);
    expect(screen.collisionArea(plus, { x: 2, y: 6 })).to.equal(5);
    expect(screen.collisionArea(plus, { x: 6, y: 6 })).to.equal(5);
    expect(screen.collisionArea(plus, { x: 6, y: 2 })).to.equal(5);

    expect(screen.collisionArea(cross, { x: 0, y: 0 })).to.equal(5);
    expect(screen.collisionArea(cross, { x: 0, y: 6 })).to.equal(5);
    expect(screen.collisionArea(cross, { x: 6, y: 6 })).to.equal(5);
    expect(screen.collisionArea(cross, { x: 6, y: 0 })).to.equal(5);

    expect(block.collisionArea(plus, { x: 0, y: 0 })).to.equal(5);
    expect(block.collisionArea(cross, { x: 0, y: 0 })).to.equal(5);
  });

  it("Partial containment", () => {
    expect(screen.collisionArea(block, { x: -1, y: 0 })).to.equal(6);
    expect(screen.collisionArea(plus, { x: 9, y: 0 })).to.equal(1);
    expect(screen.collisionArea(cross, { x: 0, y: 9 })).to.equal(2);

    expect(block.collisionArea(plus, { x: -1, y: 0 })).to.equal(4);
    expect(block.collisionArea(cross, { x: 2, y: 2 })).to.equal(1);
  });

  it("Not contained", () => {
    expect(screen.collisionArea(block, { x: -5, y: 10 })).to.equal(0);
    expect(block.collisionArea(plus, { x: 2, y: 2 })).to.equal(0);
    expect(plus.collisionArea(cross, { x: 2, y: 0 })).to.equal(0);
  });

  it("Partial collision", () => {
    expect(screen.collisionArea(block, { x: 4, y: 4 })).to.equal(5);
    expect(screen.collisionArea(plus, { x: 4, y: 4 })).to.equal(2);
    expect(screen.collisionArea(cross, { x: 5, y: 5 })).to.equal(4);

    expect(cross.collisionArea(plus, { x: 0, y: 0 })).to.equal(1);
    expect(plus.collisionArea(cross, { x: 1, y: 0 })).to.equal(3);
  });
});

describe("Mask loading", () => {
  it("Mask entity loading returns same thing", () => {
    expect(
      Entity.loadNew({
        type: "Shape",
        id: "plus",
        updated: 3.14,
        mask: "_X_|XXX|_X_",
      }),
    ).to.deep.equal(plus);
  });

  it("Mask loading can block right cells", () => {
    let newScreen = new Shape("screen", 0);
    newScreen.loadMask(
      "\
      |\
      .........\
      |000000000\
      |.........\
      |...Xx0000\
      |___1o....\
      |.........|\
      |.........|\
      |_________|\
      |.........|\
      ",
      { x: 1, y: 1 },
      true,
    );
    expect(newScreen).to.deep.equal(screen);
  });
});
