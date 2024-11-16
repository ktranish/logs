import { ElasticClient } from "./client";

export class RetentionPolicy {
  private client;

  constructor(client: ElasticClient) {
    this.client = client.getInstance();
  }

  /**
   * Enforces a retention policy by deleting logs older than the specified number of days.
   * @param {string} index - The Elasticsearch index to clean up.
   * @param {number} days - The number of days to retain logs.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  async enforceRetention(index: string, days: number): Promise<void> {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - days);

    try {
      console.log(
        `Enforcing retention policy for index "${index}" to retain logs newer than ${days} days.`
      );

      const response = await this.client.deleteByQuery({
        index,
        body: {
          query: {
            range: {
              timestamp: {
                lt: timestamp.toISOString(),
              },
            },
          },
        },
        conflicts: "proceed", // Allows partial deletions in case of conflicts
      });

      if (response.deleted === 0) {
        console.log(
          `No logs older than ${days} days found in index "${index}".`
        );
      } else {
        console.log(
          `Deleted ${response.deleted} logs older than ${days} days from index "${index}".`
        );
      }
    } catch (error) {
      console.error(
        `Failed to enforce retention policy on index "${index}":`,
        error
      );
      throw new Error(
        `Retention policy enforcement failed for index "${index}".`
      );
    }
  }
}
