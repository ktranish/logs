import { Client } from "@elastic/elasticsearch";

let elasticClient: Client | null = null;

interface ElasticsearchConfig {
  url: string;
  username?: string;
  password?: string;
}

/**
 * Initializes the Elasticsearch client with the provided configuration.
 * @param {ElasticsearchConfig} config - Configuration options for Elasticsearch.
 * @returns {Promise<Client>} The Elasticsearch client instance.
 */
async function initializeClient(config: ElasticsearchConfig): Promise<Client> {
  if (!elasticClient) {
    console.log("Initializing Elasticsearch client...");
    try {
      elasticClient = new Client({
        node: config.url,
        auth:
          config.username && config.password
            ? { username: config.username, password: config.password }
            : undefined,
        tls: config.url.startsWith("https")
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
      });
      console.log(
        `✅ Elasticsearch client initialized for node: ${config.url}`
      );
    } catch (error) {
      console.error("❌ Elasticsearch client initialization failed:", error);
      throw new Error(
        "Failed to initialize Elasticsearch client. Check your configuration."
      );
    }
  }
  return elasticClient;
}

/**
 * Returns the existing Elasticsearch client instance.
 * Throws an error if the client is not initialized.
 */
function getClient(): Client {
  if (!elasticClient) {
    throw new Error(
      "Elasticsearch client is not initialized. Call setupElasticsearch() first."
    );
  }
  return elasticClient;
}

/**
 * Sets up Elasticsearch by initializing the Elasticsearch client.
 * Expects the consumer to ensure that Elasticsearch is running.
 * @param {ElasticsearchConfig} config - Configuration options for Elasticsearch.
 * @returns {Promise<Client>} The Elasticsearch client instance.
 */
export async function setupElasticsearch(
  config: ElasticsearchConfig
): Promise<Client> {
  return initializeClient(config);
}

/**
 * Applies default log retention by deleting logs older than the specified number of days.
 * @param {string[]} indices - The list of indices to apply retention to.
 * @param {number} retentionDays - The number of days to retain logs.
 */
export async function applyRetentionPolicy(
  indices: string[],
  retentionDays: number = 30
): Promise<void> {
  const client = getClient();
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - retentionDays);

  for (const index of indices) {
    try {
      console.log(
        `Applying retention policy for index "${index}" to retain logs newer than ${retentionDays} days.`
      );
      const response = await client.deleteByQuery({
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
        conflicts: "proceed",
      });

      if (response.deleted === 0) {
        console.log(
          `No logs older than ${retentionDays} days found in "${index}".`
        );
      } else {
        console.log(
          `Deleted ${response.deleted} logs older than ${retentionDays} days from "${index}".`
        );
      }
    } catch (error) {
      console.error(
        `❌ Failed to apply retention policy for index "${index}":`,
        error
      );
    }
  }
}

export { getClient };
