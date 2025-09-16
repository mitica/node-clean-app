/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { dbInstance } from "../db";

const knex = dbInstance();

async function main() {
  const pair = process.argv[2].split(":");
  const section = pair[0];
  const subcommand = pair[1];

  const anyKnex: any = knex;

  if (!anyKnex[section]) {
    throw new Error(`Knex command "${section}" is invalid`);
  }
  if (!anyKnex[section][subcommand]) {
    throw new Error(`Knex sub command "${section}:${subcommand}" is invalid`);
  }
  if (!["migrate", "seed"].includes(section)) {
    throw new Error(`Unexpected section ${section}`);
  }

  const folder = section === "migrate" ? "migrations" : "seeds";
  const opts = {
    directory: path.resolve(__dirname, "..", folder),
    extension: "ts",
  };
  return subcommand === "make"
    ? anyKnex[section][subcommand](process.argv[3], opts)
    : anyKnex[section][subcommand](opts);
}

main()
  .then(async () => {
    await knex.destroy();
    return process.exit();
  })
  .catch(async error => {
    console.error(error);
    await knex.destroy();
    process.exit(1);
  });
