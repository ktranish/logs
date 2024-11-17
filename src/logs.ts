import {
  IndexRequest,
  SearchRequest,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { getClient } from "./setup";

type LogLevel = "info" | "warn" | "error" | "debug";

export class Logs<T = any> {
  private readonly client;
  private readonly index: string;

  /**
   * Initializes the Logs for a specific index.
   * @param {string} index - The Elasticsearch index to interact with.
   */
  constructor(index: string) {
    this.client = getClient();
    this.index = index;
  }

  // ------------------------------
  // Logging Methods
  // ------------------------------

  /**
   * Logs a message to the specified index.
   * @param {LogLevel} level - The log level ('info', 'warn', 'error', 'debug').
   * @param {string} message - The log message.
   * @param {Record<string, any>} metadata - Optional metadata for the log.
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

  // ------------------------------
  // Querying Methods
  // ------------------------------

  /**
   * Executes a search query on the specified Elasticsearch index.
   * @param {Omit<SearchRequest, "index">} query - The search query object.
   * @returns {Promise<SearchResponse<T>>} - The search response from Elasticsearch.
   * @throws {Error} - If the query fails or the index is unavailable.
   */
  async search(
    query: Omit<SearchRequest, "index">
  ): Promise<SearchResponse<T>> {
    try {
      console.log(`Executing search on index: ${this.index}`);
      const response = await this.client.search<T>({
        index: this.index,
        ...query,
      });
      console.log("Search successful:", response.hits.hits);
      return response;
    } catch (error) {
      console.error(`Failed to execute search on index: ${this.index}.`, error);
      throw new Error(
        "Search query failed. Verify the query syntax and index availability."
      );
    }
  }

  /**
   * Counts the number of documents matching the query.
   * @param {Omit<SearchRequest, "index">} query - The query to filter documents.
   * @returns {Promise<number>} - The count of matching documents.
   */
  async count(query: Omit<SearchRequest, "index">): Promise<number> {
    try {
      const response = await this.client.count({
        index: this.index,
        body: query,
      });
      console.log(`Count query successful. Found ${response.count} documents.`);
      return response.count;
    } catch (error) {
      console.error("Count query failed:", error);
      throw new Error("Failed to execute count query.");
    }
  }

  // ------------------------------
  // Document Management Methods
  // ------------------------------

  /**
   * Adds a document directly to the Elasticsearch index.
   * @param {IndexRequest<T>} document - The document to be added.
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async addDocument(document: IndexRequest<T>): Promise<any> {
    try {
      const response = await this.client.index({
        index: this.index,
        body: document,
      });
      console.log(`Document added successfully to index: ${this.index}`);
      return response;
    } catch (error) {
      console.error(`Failed to add document to index: ${this.index}.`, error);
      throw new Error("Failed to add document. Check the index or payload.");
    }
  }

  /**
   * Updates a document in the Elasticsearch index.
   * @param {string} id - The document ID to update.
   * @param {Partial<T>} partialDoc - The partial document with fields to update.
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async updateDocument(id: string, partialDoc: Partial<T>): Promise<any> {
    try {
      const response = await this.client.update({
        index: this.index,
        id,
        body: {
          doc: partialDoc,
        },
      });
      console.log(
        `Document ${id} updated successfully in index: ${this.index}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to update document ${id}:`, error);
      throw new Error(`Error updating document ${id}.`);
    }
  }

  /**
   * Deletes a document from the Elasticsearch index.
   * @param {string} id - The document ID to delete.
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async deleteDocument(id: string): Promise<any> {
    try {
      const response = await this.client.delete({
        index: this.index,
        id,
      });
      console.log(
        `Document ${id} deleted successfully from index: ${this.index}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      throw new Error(`Error deleting document ${id}.`);
    }
  }

  // ------------------------------
  // Index Management Methods
  // ------------------------------

  /**
   * Checks if the Elasticsearch index exists.
   * @returns {Promise<boolean>} - True if the index exists, false otherwise.
   */
  async indexExists(): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index: this.index });
      console.log(`Index "${this.index}" exists:`, exists);
      return exists;
    } catch (error) {
      console.error(`Failed to check if index "${this.index}" exists:`, error);
      throw new Error("Error checking index existence.");
    }
  }

  /**
   * Creates an Elasticsearch index with optional settings.
   * @param {object} settings - Custom settings for the index (e.g., shards, replicas).
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async createIndex(settings: object = {}): Promise<any> {
    try {
      const response = await this.client.indices.create({
        index: this.index,
        body: { settings },
      });
      console.log(`Index "${this.index}" created successfully.`);
      return response;
    } catch (error) {
      console.error(`Failed to create index "${this.index}":`, error);
      throw new Error("Error creating index.");
    }
  }

  /**
   * Deletes the Elasticsearch index.
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async deleteIndex(): Promise<any> {
    try {
      const response = await this.client.indices.delete({ index: this.index });
      console.log(`Index "${this.index}" deleted successfully.`);
      return response;
    } catch (error) {
      console.error(`Failed to delete index "${this.index}":`, error);
      throw new Error("Error deleting index.");
    }
  }

  /**
   * Performs bulk operations (e.g., index, update, delete) on Elasticsearch.
   * @param {Array<object>} operations - An array of bulk operation objects.
   * @returns {Promise<any>} - The response from Elasticsearch.
   */
  async bulk(operations: Array<object>): Promise<any> {
    try {
      const response = await this.client.bulk({
        index: this.index,
        body: operations,
      });
      console.log(`Bulk operation completed for index: ${this.index}`);
      return response;
    } catch (error) {
      console.error(`Failed to perform bulk operation:`, error);
      throw new Error("Bulk operation failed. Check the operations and index.");
    }
  }
}
