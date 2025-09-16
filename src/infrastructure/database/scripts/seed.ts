import { readdirSync } from "fs";
import { join } from "path";
import { dbInstance } from "../db";

const seed = async () => {
  const dir = "../seeds";
  const filenames = readdirSync(join(__dirname, dir), "utf8");
  for (const file of filenames) {
    if (!file.endsWith(".ts")) continue;
    console.log(`Seeding ${file}`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const code = require(join(dir, file));
    await code.seed();
  }
};

async function start() {
  try {
    await seed();
  } catch (error) {
    console.error(error);
  }
  await dbInstance().destroy();
}

start();
