import { redisInstance } from "../redis";

const instance = redisInstance();

instance
  .flushall()
  .then(() => console.info(`Redis db dropped`))
  .catch(console.error)
  .finally(() => instance.quit());
