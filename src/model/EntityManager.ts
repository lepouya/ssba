import Entity from "../model/Entity";
import Ship from "../model/Ship";
import Component from "../model/Component";
import EngineComponent from "../model/EngineComponent";
import Shape from "../model/Shape";

export default class EntityManager {
  static load(data: any): Entity {
    return Entity.loadNew(data);
  }

  static fetch(name: string): Entity | undefined {
    return Entity.allEntities.get(name);
  }

  static loadAll(data: any): Map<string, Entity> {
    // Make sure all entity types are initialized
    Entity.entityTypes;
    Ship.entityTypes;
    Component.entityTypes;
    EngineComponent.entityTypes;
    Shape.entityTypes;

    for (let item in data) {
      let entity = Entity.loadNew(data[item]);
      entity.name = item;
      Entity.allEntities.set(item, entity);
    }

    return Entity.allEntities;
  }

  static saveAll(): any {
    let data: { [k: string]: any } = {};
    Entity.allEntities.forEach((value, key) => (data[key] = value.save()));

    return data;
  }

  static resetAll() {
    Entity.allEntities.clear();
  }

  static lastUpdate = 0;
  static minDT = 1 / 60;
  static stepDT = 1 / 10;

  static updateAll(now = Date.now() / 1000): boolean {
    // Bootstrap
    if (EntityManager.lastUpdate == 0 || EntityManager.lastUpdate >= now) {
      EntityManager.lastUpdate = now;
      Entity.allEntities.forEach((entity) => entity.update(now));
      return true;
    }

    // Make sure at least minDT has passed before updating entities
    let dt = now - EntityManager.lastUpdate;
    if (dt < EntityManager.minDT) {
      return false;
    }

    // Step through, each time doing no more than a stepDT time increment
    for (
      let time = EntityManager.lastUpdate;
      time < now;
      time += EntityManager.stepDT
    ) {
      Entity.allEntities.forEach((entity) => entity.update(time));
    }

    Entity.allEntities.forEach((entity) => entity.update(now));
    return true;
  }
}
