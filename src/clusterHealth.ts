import { ElasticClient } from "./client";

export class ClusterHealth {
  private client;

  constructor(client: ElasticClient) {
    this.client = client.getInstance();
  }

  /**
   * Retrieves and logs the health of the Elasticsearch cluster.
   * @returns {Promise<string>} The cluster health status: 'green', 'yellow', or 'red'.
   */
  async getHealth(): Promise<string> {
    try {
      const health = await this.client.cluster.health();

      // Extract and log cluster status
      const status = health.status; // 'green', 'yellow', or 'red'
      console.log("Cluster Health:", status);

      // Warn if the cluster is not fully healthy
      if (status !== "green") {
        console.warn("Cluster is not healthy. Current status:", status);
      }

      return status;
    } catch (error) {
      console.error("Failed to retrieve cluster health:", error);

      // Re-throwing the error to allow the caller to handle it
      throw new Error("Unable to retrieve Elasticsearch cluster health.");
    }
  }
}
