import DbFactory from "./db-factory";
import initDbCollections from "./init-db-collections";

export default class FileDbFactory implements DbFactory {
  constructor(private dbName: string) {}
  async create() {
    return new Promise<Loki>((resolve, reject) => {
      const db: Loki = new Loki(this.dbName, {
        autoload: true,
        autoloadCallback: error => {
          if (error) reject(error);
          else {
            initDbCollections(db);
            resolve(db);
          }
        },
        autosave: true,
        autosaveInterval: 4000
      });
    });
  }
}
