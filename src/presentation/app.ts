import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { AppContext } from "../config";
import { authMiddleware } from "./middleware/auth-middleware";
import { UserController } from "./controllers/user-controller";

// Register event handlers
import "../application/listeners";

export class App {
  private app: Hono;
  private context: AppContext;

  constructor() {
    this.app = new Hono();
    this.context = new AppContext();

    this.setupMiddleware();
    this.setupRoutes();
  }

  async initialize(): Promise<void> {
    await this.context.initialize();
    console.log("Database initialized successfully");

    // Start job processor from container
    // const jobProcessor = this.context.jobProcessor;
    // await jobProcessor.start();
    console.log("Job processor started successfully");
  }

  private setupMiddleware(): void {
    this.app.use("*", logger());
    this.app.use(
      "*",
      cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      })
    );
    this.app.use("*", authMiddleware);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (c) => {
      return c.json({ status: "healthy", timestamp: new Date().toISOString() });
    });

    // API routes
    const userController = new UserController(this.context);
    this.app.route("/api/users", userController.getRouter());

    // 404 handler
    this.app.notFound((c) => {
      return c.json({ success: false, error: "Route not found" }, 404);
    });

    // Error handler
    this.app.onError((err, c) => {
      console.error("Unhandled error:", err);
      return c.json({ success: false, error: "Internal server error" }, 500);
    });
  }

  getApp(): Hono {
    return this.app;
  }

  async close(): Promise<void> {
    await this.context.close();
  }
}
