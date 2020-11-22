import "mocha";
import { expect } from "chai";

import Shape from "../Shape";
import Entity from "../Entity";

let screen = new Shape("screen", 0).setSize(10, 10);
let block = new Shape("block", 1).setSize(3, 3);
let plus = new Shape("plus", 3.14).setSize(3, 3);
let cross = new Shape("cross", 42).setSize(3, 3);

screen.blockCell(4, 4).blockCell(4, 5).blockCell(5, 4).blockCell(5, 5);

plus
  .allowCell(1, 0)
  .allowCell(0, 1)
  .allowCell(1, 1)
  .allowCell(2, 1)
  .allowCell(1, 2);

cross.blockCell(1, 0).blockCell(1, 2).blockCell(0, 1).blockCell(2, 1);

describe("Shape properties", () => {
  it("Basic info set up correctly", () => {
    expect(screen.w).to.equal(10);
    expect(screen.h).to.equal(10);

    expect(block.w).to.equal(3);
    expect(block.h).to.equal(3);
  });

  it("getArea returns correct size", () => {
    expect(screen.getArea()).to.equal(10 * 10 - 4);
    expect(block.getArea()).to.equal(3 * 3);
    expect(plus.getArea()).to.equal(5);
    expect(cross.getArea()).to.equal(5);
  });

  it("hasCell returns correct info", () => {
    expect(screen.hasCell(0, 0)).to.be.true;
    expect(screen.hasCell(1, 0)).to.be.true;
    expect(screen.hasCell(1, 9)).to.be.true;
    expect(screen.hasCell(10, 1)).to.be.false;
    expect(screen.hasCell(4, 4)).to.be.false;

    expect(block.hasCell(0, 0)).to.be.true;
    expect(block.hasCell(1, 0)).to.be.true;
    expect(block.hasCell(1, 9)).to.be.false;
    expect(block.hasCell(10, 1)).to.be.false;
    expect(block.hasCell(2, 2)).to.be.true;

    expect(plus.hasCell(0, 0)).to.be.false;
    expect(plus.hasCell(1, 0)).to.be.true;
    expect(plus.hasCell(2, 0)).to.be.false;
    expect(plus.hasCell(3, 0)).to.be.false;
    expect(plus.hasCell(0, 1)).to.be.true;
    expect(plus.hasCell(1, 1)).to.be.true;

    expect(cross.hasCell(0, 0)).to.be.true;
    expect(cross.hasCell(1, 0)).to.be.false;
    expect(cross.hasCell(2, 0)).to.be.true;
    expect(cross.hasCell(3, 0)).to.be.false;
    expect(cross.hasCell(0, 1)).to.be.false;
    expect(cross.hasCell(1, 1)).to.be.true;
  });

  it("hasCell and getArea return same value", () => {
    let sum = (s: Shape) =>
      Array.from(Array(12).keys()).reduce(
        (c, x) =>
          Array.from(Array(12).keys()).reduce(
            (d, y) => d + (s.hasCell(x - 1, y - 1) ? 1 : 0),
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
    expect(screen.collisionArea(block, 0, 0)).to.equal(9);
    expect(screen.collisionArea(block, 1, 6)).to.equal(9);
    expect(screen.collisionArea(block, 6, 6)).to.equal(9);
    expect(screen.collisionArea(block, 6, 1)).to.equal(9);

    expect(screen.collisionArea(plus, 0, 0)).to.equal(5);
    expect(screen.collisionArea(plus, 2, 6)).to.equal(5);
    expect(screen.collisionArea(plus, 6, 6)).to.equal(5);
    expect(screen.collisionArea(plus, 6, 2)).to.equal(5);

    expect(screen.collisionArea(cross, 0, 0)).to.equal(5);
    expect(screen.collisionArea(cross, 0, 6)).to.equal(5);
    expect(screen.collisionArea(cross, 6, 6)).to.equal(5);
    expect(screen.collisionArea(cross, 6, 0)).to.equal(5);

    expect(block.collisionArea(plus, 0, 0)).to.equal(5);
    expect(block.collisionArea(cross, 0, 0)).to.equal(5);
  });

  it("Partial containment", () => {
    expect(screen.collisionArea(block, -1, 0)).to.equal(6);
    expect(screen.collisionArea(plus, 9, 0)).to.equal(1);
    expect(screen.collisionArea(cross, 0, 9)).to.equal(2);

    expect(block.collisionArea(plus, -1, 0)).to.equal(4);
    expect(block.collisionArea(cross, 2, 2)).to.equal(1);
  });

  it("Not contained", () => {
    expect(screen.collisionArea(block, -5, 10)).to.equal(0);
    expect(block.collisionArea(plus, 2, 2)).to.equal(0);
    expect(plus.collisionArea(cross, 2, 0)).to.equal(0);
  });

  it("Partial collision", () => {
    expect(screen.collisionArea(block, 4, 4)).to.equal(5);
    expect(screen.collisionArea(plus, 4, 4)).to.equal(2);
    expect(screen.collisionArea(cross, 5, 5)).to.equal(4);

    expect(cross.collisionArea(plus, 0, 0)).to.equal(1);
    expect(plus.collisionArea(cross, 1, 0)).to.equal(3);
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
      1,
      1,
      true,
    );
    expect(newScreen).to.deep.equal(screen);
  });
});
