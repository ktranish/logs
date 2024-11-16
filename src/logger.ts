import { ElasticClient } from "./client";

type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
  private client;
  private index: string;

  constructor(client: ElasticClient, index: string) {
    this.client = client.getInstance();
    this.index = index;
  }

  /**
   * Logs a message with a specific level and metadata to Elasticsearch.
   * @param {LogLevel} level - The log level ('info', 'warn', 'error', 'debug').
   * @param {string} message - The log message.
   * @param {Record<string, any>} metadata - Additional metadata for the log entry.
   * @returns {Promise<void>} - Resolves when the log is successfully sent.
   */
  async log(
    level: LogLevel,
    message: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.client.index({
        index: this.index,
        body: {
          level,
          message,
          metadata,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`[${level.toUpperCase()}] Logged successfully: ${message}`);
    } catch (error) {
      console.error(
        `Failed to log message: "${message}" with level: "${level}".`,
        error
      );
      throw new Error("Logging failed. Check Elasticsearch connection.");
    }
  }

  /**
   * Logs an informational message.
   * @param {string} message - The log message.
   * @param {Record<string, any>} [metadata] - Optional metadata for the log entry.
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    return this.log("info", message, metadata);
  }

  /**
   * Logs a warning message.
   * @param {string} message - The log message.
   * @param {Record<string, any>} [metadata] - Optional metadata for the log entry.
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    return this.log("warn", message, metadata);
  }

  /**
   * Logs an error message.
   * @param {string} message - The log message.
   * @param {Record<string, any>} [metadata] - Optional metadata for the log entry.
   */
  async error(message: string, metadata?: Record<string, any>): Promise<void> {
    return this.log("error", message, metadata);
  }

  /**
   * Logs a debug message.
   * @param {string} message - The log message.
   * @param {Record<string, any>} [metadata] - Optional metadata for the log entry.
   */
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    return this.log("debug", message, metadata);
  }
}
