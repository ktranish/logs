import { ElasticClient } from "./client";
import { defaultConfig, Config } from "./config";

export class IndexManager {
  private client;

  constructor(client: ElasticClient) {
    this.client = client.getInstance();
  }

  /**
   * Creates an index with optimized settings based on the environment.
   * @param {string} indexName - The name of the index to create.
   * @param {keyof Config["indexSettings"]} environment - The target environment ('development', 'staging', 'production').
   * @returns {Promise<any>} - The response from the Elasticsearch client.
   */
  async createOptimizedIndex(
    indexName: string,
    environment: keyof Config["indexSettings"]
  ): Promise<any> {
    if (!defaultConfig.indexSettings[environment]) {
      throw new Error(
        `Invalid environment "${environment}". Expected one of: ${Object.keys(
          defaultConfig.indexSettings
        ).join(", ")}`
      );
    }

    const settings = defaultConfig.indexSettings[environment];

    try {
      console.log(`Creating index "${indexName}" with settings:`, settings);
      const response = await this.client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: settings.shards,
            number_of_replicas: settings.replicas,
          },
        },
      });
      console.log(`Index "${indexName}" created successfully.`);
      return response;
    } catch (error) {
      console.error(`Failed to create index "${indexName}":`, error);
      throw new Error(`Error creating index "${indexName}".`);
    }
  }

  /**
   * Deletes an index.
   * @param {string} indexName - The name of the index to delete.
   * @returns {Promise<any>} - The response from the Elasticsearch client.
   */
  async deleteIndex(indexName: string): Promise<any> {
    try {
      console.log(`Deleting index "${indexName}"...`);
      const response = await this.client.indices.delete({ index: indexName });
      console.log(`Index "${indexName}" deleted successfully.`);
      return response;
    } catch (error) {
      console.error(`Failed to delete index "${indexName}":`, error);
      throw new Error(`Error deleting index "${indexName}".`);
    }
  }
}
