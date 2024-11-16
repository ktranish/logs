import { Logger } from "./logger";

export class SystemLogger {
  private logger: Logger;

  constructor() {
    // Use the updated Logger class with the "system-logs" index
    this.logger = new Logger("system-logs");
  }

  /**
   * Logs the cluster health check result.
   * @param {string} status - The health status of the cluster ('green', 'yellow', 'red').
   * @returns {Promise<void>} - Resolves when the log is successfully sent.
   */
  async logHealthCheck(status: string): Promise<void> {
    try {
      await this.logger.log("info", "Cluster health check", { status });
      console.log("Health check logged successfully.");
    } catch (error) {
      this.handleLogError(error, "Failed to log health check.");
    }
  }

  /**
   * Logs the result of a retention policy run.
   * @param {string} index - The name of the index where the retention policy was applied.
   * @param {number} deleted - The number of logs deleted during the retention run.
   * @returns {Promise<void>} - Resolves when the log is successfully sent.
   */
  async logRetentionRun(index: string, deleted: number): Promise<void> {
    try {
      await this.logger.log("info", "Retention policy run", { index, deleted });
      console.log("Retention policy run logged successfully.");
    } catch (error) {
      this.handleLogError(error, "Failed to log retention policy run.");
    }
  }

  /**
   * Handles errors that occur during logging operations.
   * @param {unknown} error - The error thrown by the logger.
   * @param {string} message - A custom error message to log.
   */
  private handleLogError(error: unknown, message: string): void {
    if (error instanceof Error) {
      console.error(`${message} Details: ${error.message}`);
    } else {
      console.error(`${message} Unknown error occurred:`, error);
    }
  }
}
