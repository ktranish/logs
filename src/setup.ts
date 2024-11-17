import { Client } from "@elastic/elasticsearch";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://localhost:9200";

let elasticClient: Client | null = null;

/**
 * Ensures Docker is installed and accessible.
 */
async function ensureDocker(): Promise<void> {
  try {
    const { stdout } = await execAsync("docker --version");
    console.log(`✅ Docker is installed: ${stdout.trim()}`);
  } catch (error) {
    console.error("❌ Docker is required but not installed or not in PATH.");
    throw new Error(
      "Docker is required to run Elasticsearch locally. Please install Docker."
    );
  }
}

/**
 * Checks if Elasticsearch is running and accessible.
 * @returns {Promise<boolean>} True if Elasticsearch is running, false otherwise.
 */
async function isElasticsearchRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${ELASTICSEARCH_URL}/_cluster/health`);
    if (response.ok) {
      console.log("✅ Elasticsearch is already running.");
      return true;
    }
    console.warn(
      `⚠️ Elasticsearch health check failed with status: ${response.status}`
    );
  } catch (error) {
    console.warn("⚠️ Elasticsearch is not running or unreachable.");
  }
  return false;
}

/**
 * Starts Elasticsearch using Docker Compose.
 */
async function startElasticsearch(): Promise<void> {
  await ensureDocker();

  console.log("🚀 Starting Elasticsearch via Docker Compose...");
  try {
    const { stdout } = await execAsync("docker-compose up -d");
    console.log("✅ Elasticsearch started successfully.");
    console.log(stdout.trim());
  } catch (error) {
    console.error("❌ Failed to start Elasticsearch using Docker Compose.");
    throw error;
  }
}

/**
 * Initializes the Elasticsearch client with the configured node.
 * @returns {Promise<Client>} The Elasticsearch client instance.
 */
async function initializeClient(): Promise<Client> {
  if (!elasticClient) {
    console.log("Initializing Elasticsearch client...");
    try {
      elasticClient = new Client({
        node: ELASTICSEARCH_URL,
        auth:
          process.env.ELASTIC_USERNAME && process.env.ELASTIC_PASSWORD
            ? {
                username: process.env.ELASTIC_USERNAME!,
                password: process.env.ELASTIC_PASSWORD!,
              }
            : undefined,
        tls: ELASTICSEARCH_URL.startsWith("https")
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
      });
      console.log(
        `✅ Elasticsearch client initialized for node: ${ELASTICSEARCH_URL}`
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
 * Sets up Elasticsearch by checking if it is running, starting it if necessary,
 * and initializing the Elasticsearch client.
 * @returns {Promise<Client>} The Elasticsearch client instance.
 */
export async function setupElasticsearch(): Promise<Client> {
  const running = await isElasticsearchRunning();
  if (!running) {
    await startElasticsearch();
  }
  return initializeClient();
}

/**
 * Stops Elasticsearch by bringing down the Docker Compose setup.
 */
export async function stopElasticsearch(): Promise<void> {
  console.log("🛑 Stopping Elasticsearch via Docker Compose...");
  try {
    const { stdout } = await execAsync("docker-compose down");
    console.log("✅ Elasticsearch stopped successfully.");
    console.log(stdout.trim());
  } catch (error) {
    console.error("❌ Failed to stop Elasticsearch using Docker Compose.");
    throw error;
  }
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
