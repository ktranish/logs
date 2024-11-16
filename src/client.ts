import { Client } from "@elastic/elasticsearch";

interface ElasticClientOptions {
  username?: string;
  password?: string;
  apiKey?: string;
  ssl?: boolean;
}

export class ElasticClient {
  private client?: Client; // Optional property

  constructor(node: string, options: ElasticClientOptions = {}) {
    try {
      const auth = options.apiKey
        ? { apiKey: options.apiKey }
        : options.username && options.password
        ? { username: options.username, password: options.password }
        : undefined;

      this.client = new Client({
        node: options.ssl ? `https://${node}` : `http://${node}`,
        auth,
      });

      console.log(`Elasticsearch client initialized for node: ${node}`);
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  getInstance(): Client {
    if (!this.client) {
      throw new Error("Elasticsearch client is not initialized.");
    }
    return this.client;
  }

  private handleInitializationError(error: unknown): void {
    if (error instanceof Error) {
      console.error(
        "Failed to initialize Elasticsearch client:",
        error.message
      );
    } else {
      console.error(
        "Unknown error occurred during client initialization:",
        error
      );
    }
    throw new Error(
      "Elasticsearch client initialization failed. Check your configuration."
    );
  }
}
