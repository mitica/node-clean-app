import { Hono } from "hono";
import { HonoEnv } from "../types";
import { asyncHandler } from "../middleware/error-handler";

export class UserController {
  private app: Hono<HonoEnv>;

  constructor() {
    this.app = new Hono<HonoEnv>();
    this.setupRoutes();
  }

  getRouter(): Hono<HonoEnv> {
    return this.app;
  }

  private setupRoutes(): void {
    // Get user by ID
    this.app.get("/:id", asyncHandler(async (c) => {
      // Get the per-request context from Hono's context
      const ctx = c.get("requestContext");

      const id = parseInt(c.req.param("id"), 10);
      const item = await ctx.repo.user.findById(id);

      return c.json({ success: true, data: item });
    }));
  }
}
