import { eventBus } from "../../config";
// import "../../domain/entity/user.events";

/**
 * User event handlers
 */

eventBus.on("user:created", (event) => {
  const { entity } = event.payload;
  console.log(`[user:created] ${entity.email}`, { userId: entity.id });

  // TODO: Send welcome email, create default settings, etc.
});

eventBus.on("user:updated", (event) => {
  const { entity, data } = event.payload;
  console.log(`[user:updated] ${entity.email}`, {
    userId: entity.id,
    fields: Object.keys(data).filter((k) => k !== "id"),
  });

  // TODO: Send email verification if email changed, etc.
});

eventBus.on("user:deleted", (event) => {
  const { entity } = event.payload;
  console.log(`[user:deleted] ${entity.email}`, { userId: entity.id });

  // TODO: Archive data, send confirmation, cleanup resources
});

eventBus.on("user:preDelete", (event) => {
  const userId = event.payload;
  console.log(`[user:preDelete]`, { userId });

  // TODO: Validate deletion, prepare cascade deletes
});
