import "dotenv/config";

export const config = {
  port: parseInt(process.env["PORT"] || "3000", 10),
  nodeEnv: process.env["NODE_ENV"] || "development",
  apiKey: process.env["API_KEY"] || "",
  youtubeApiKey: process.env["YOUTUBE_API_KEY"] || "",
  database: {
    connection: process.env["DB_CONNECTION"] || "",
  },
  redis: {
    url: process.env["REDISCLOUD_URL"] || "",
  },
  jobs: {
    concurrency: parseInt(process.env["JOB_CONCURRENCY"] || "5", 10),
    timeout: parseInt(process.env["JOB_TIMEOUT"] || "300000", 10),
  },
  openai: {
    apiKey: process.env["OPENAI_API_KEY"] || "",
    orgId: process.env["OPENAI_ORG_ID"] || "",
    project: process.env["OPENAI_PROJECT"] || "",
    model: process.env["OPENAI_MODEL"] || "gpt-4o-mini",
  },
};

if (config.nodeEnv !== "development" && !config.apiKey) {
  throw new Error("API_KEY is required in non-development environments");
}
