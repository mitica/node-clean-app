export default interface DbFactory {
  create(): Promise<Loki>;
}
