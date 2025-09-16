import { AppContext } from "../../config";
import { Hono } from "hono";

export class UserController {
  private app: Hono;
  private context: AppContext;

  constructor(context: AppContext) {
    this.app = new Hono();
    this.context = context;
    this.setupRoutes();
  }

  getRouter(): Hono {
    return this.app;
  }

  private setupRoutes(): void {
    // Get user by ID
    this.app.get("/:id", async (c) => {
      try {
        const id = parseInt(c.req.param("id"), 10);

        const item = await this.context.repo.user.findById(id);

        return c.json({ success: true, data: item });
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ success: false, error: error.message }, 400);
        }
        console.error("Error getting user:", error);
        return c.json({ success: false, error: "Internal server error" }, 500);
      }
    });
  }
}
