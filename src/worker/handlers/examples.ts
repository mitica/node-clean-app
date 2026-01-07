import { TaskHandlerRegistration } from "../../domain/worker";

/**
 * Example email task handler
 * 
 * Usage:
 * ```typescript
 * await createWorkerTask(taskRepo, {
 *   type: "email:send",
 *   payload: {
 *     to: "user@example.com",
 *     subject: "Welcome!",
 *     template: "welcome",
 *     data: { name: "John" }
 *   }
 * });
 * ```
 */
export const emailSendHandler: TaskHandlerRegistration = {
  type: "email:send",
  timeout: 30000, // 30 seconds
  maxAttempts: 3,
  handler: async (context) => {
    const { task, isShuttingDown } = context;
    const { to, subject, template } = task.payload as {
      to: string;
      subject: string;
      template: string;
    };

    console.log(`[email:send] Sending email to ${to}`, { subject, template });

    // Check for shutdown during long operations
    if (isShuttingDown()) {
      return {
        success: false,
        error: new Error("Worker shutting down, task will be retried")
      };
    }

    // TODO: Implement actual email sending logic
    // Example with a mail service:
    // await mailService.send({ to, subject, template, data });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`[email:send] Email sent successfully to ${to}`);

    return {
      success: true,
      result: {
        sentAt: new Date().toISOString(),
        recipient: to
      }
    };
  }
};

/**
 * Example report generation handler
 */
export const reportGenerateHandler: TaskHandlerRegistration = {
  type: "report:generate",
  timeout: 300000, // 5 minutes
  maxAttempts: 2,
  handler: async (context) => {
    const { task, isShuttingDown } = context;
    const { reportType, params } = task.payload as {
      reportType: string;
      params: Record<string, unknown>;
    };

    console.log(`[report:generate] Generating ${reportType} report`, { params });

    // Simulate report generation with periodic shutdown checks
    for (let i = 0; i < 5; i++) {
      if (isShuttingDown()) {
        return {
          success: false,
          error: new Error("Worker shutting down, task will be retried")
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[report:generate] Report ${reportType} generated successfully`);

    return {
      success: true,
      result: {
        generatedAt: new Date().toISOString(),
        reportType,
        fileUrl: `/reports/${reportType}-${task.id}.pdf`
      }
    };
  }
};

/**
 * Example data sync handler
 */
export const dataSyncHandler: TaskHandlerRegistration = {
  type: "data:sync",
  timeout: 60000, // 1 minute
  maxAttempts: 5,
  handler: async (context) => {
    const { task } = context;
    const { source, target } = task.payload as {
      source: string;
      target: string;
    };

    console.log(`[data:sync] Syncing data from ${source} to ${target}`);

    // TODO: Implement actual sync logic

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      result: {
        syncedAt: new Date().toISOString(),
        source,
        target,
        recordsProcessed: 100
      }
    };
  }
};

/**
 * All example handlers
 */
export const exampleHandlers: TaskHandlerRegistration[] = [
  emailSendHandler,
  reportGenerateHandler,
  dataSyncHandler
];
