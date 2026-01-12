import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { AppContext } from "../config";
import { createContextMiddleware } from "./middleware/context-middleware";
import { authMiddleware } from "./middleware/auth-middleware";
import { errorHandler } from "./middleware/error-handler";
import { telemetryMiddleware } from "./middleware/telemetry-middleware";
import { UserController } from "./controllers/user-controller";
import { AuthController } from "./controllers/auth-controller";
import { HonoEnv } from "./types";

// Register event handlers
import "../app/listeners";

export class App {
  private app: Hono<HonoEnv>;
  private ctx: AppContext;

  constructor() {
    this.app = new Hono<HonoEnv>();
    this.ctx = new AppContext();

    this.setupMiddleware();
    this.setupRoutes();
  }

  async initialize(): Promise<void> {
    await this.ctx.initialize();
    console.log("Database initialized successfully");

    // Start job processor from container
    // const jobProcessor = this.context.jobProcessor;
    // await jobProcessor.start();
    console.log("Job processor started successfully");
  }

  private setupMiddleware(): void {
    // OpenTelemetry tracing middleware (must be first for accurate timing)
    this.app.use("*", telemetryMiddleware({
      ignoreRoutes: ["/health", "/metrics"],
    }));

    this.app.use("*", logger());
    this.app.use(
      "*",
      cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
      })
    );

    // Create request context for each request (must be before auth)
    this.app.use("*", createContextMiddleware(this.ctx));

    // Auth middleware enriches the context with auth info
    this.app.use("*", authMiddleware);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (c) => {
      return c.json({ status: "healthy", timestamp: new Date().toISOString() });
    });

    // API routes
    const authController = new AuthController();
    this.app.route("/api/auth", authController.getRouter());

    const userController = new UserController();
    this.app.route("/api/users", userController.getRouter());

    // 404 handler
    this.app.notFound((c) => {
      return c.json({ success: false, error: "Route not found" }, 404);
    });

    // Centralized error handler
    this.app.onError(errorHandler);
  }

  getApp(): Hono<HonoEnv> {
    return this.app;
  }

  async close(): Promise<void> {
    await this.ctx.close();
  }
}
