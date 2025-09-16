import { types } from "pg";
import { config } from "../../config";
import { type Knex, knex } from "knex";

// Parse bigint values from Postgres to Int
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value, 10));
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));
types.setTypeParser(types.builtins.DATE, (value) =>
  new Date(value).toISOString()
);
types.setTypeParser(types.builtins.TIMESTAMP, (value) =>
  new Date(value).toISOString()
);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) =>
  new Date(value).toISOString()
);

types.setTypeParser(600 as never, (value) => {
  // POINT is sent as "(x, y)", so parse it
  const match = value.match(/\(([^,]+),([^)]+)\)/);
  if (!match) {
    throw new Error(`Invalid POINT format: ${value}`);
  }
  return [parseFloat(match[1]), parseFloat(match[2])] as [number, number];
});

let instance: Knex;

export const dbInstance = (newInstance?: Knex): Knex => {
  if (newInstance) instance = newInstance;
  if (!instance)
    instance = knex({
      client: "pg",
      connection: {
        connectionString: config.database.connection,
        ssl: (process.env.PGSSLMODE && { rejectUnauthorized: false }) || false
        // ssl: { rejectUnauthorized: false },
      },
      debug: false
    });

  return instance;
};
