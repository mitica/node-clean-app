import DbFactory from "./db-factory";

export default class MemoryDbFactory implements DbFactory {
  constructor(private dbName: string = "noname.db") {}
  async create() {
    return new Loki(this.dbName);
  }
}
