import { exec } from "child_process";
import { promisify } from "util";
import { Client } from "@elastic/elasticsearch";

const execAsync = promisify(exec);
const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://localhost:9200";

let elasticClient: Client | null = null;

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

async function initializeClient(): Promise<Client> {
  if (!elasticClient) {
    console.log("Initializing Elasticsearch client...");
    try {
      elasticClient = new Client({
        node: ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTIC_USERNAME!,
          password: process.env.ELASTIC_PASSWORD!,
        },
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

export async function setupElasticsearch(): Promise<Client> {
  const running = await isElasticsearchRunning();
  if (!running) {
    await startElasticsearch();
  }
  return initializeClient();
}

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

export { getClient }; // Ensure getClient is exported here
