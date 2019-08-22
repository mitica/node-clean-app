import { DbCollectionName } from "./db-collection-name";

export default (db: Loki) => {
  if (!db.getCollection(DbCollectionName.USER)) {
    db.addCollection(DbCollectionName.USER);
  }
  db.getCollection(DbCollectionName.USER).ensureUniqueIndex("email");
};
