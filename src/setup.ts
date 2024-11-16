import { exec } from "child_process";
import { promisify } from "util";

// Promisify the `exec` function for cleaner async/await usage
const execAsync = promisify(exec);

/**
 * Checks if Docker is installed and accessible in the system.
 * @returns {Promise<void>} - Resolves if Docker is found, rejects otherwise.
 */
async function checkDockerInstalled(): Promise<void> {
  try {
    const { stdout } = await execAsync("docker --version");
    console.log(`✅ Docker found: ${stdout.trim()}`);
  } catch (error) {
    handleExecError(error, "Docker is not installed or not in PATH.");
    throw new Error(
      "❌ Docker is required to run this package. Please install Docker and ensure it's in your PATH."
    );
  }
}

/**
 * Checks if Docker Compose is installed and accessible in the system.
 * @returns {Promise<void>} - Resolves if Docker Compose is found, rejects otherwise.
 */
async function checkDockerComposeInstalled(): Promise<void> {
  try {
    const { stdout } = await execAsync("docker-compose --version");
    console.log(`✅ Docker Compose found: ${stdout.trim()}`);
  } catch (error) {
    handleExecError(error, "Docker Compose is not installed or not in PATH.");
    throw new Error(
      "❌ Docker Compose is required to run this package. Please install Docker Compose and ensure it's in your PATH."
    );
  }
}

/**
 * Starts Elasticsearch using Docker Compose.
 * @returns {Promise<void>} - Resolves when Elasticsearch starts successfully, rejects otherwise.
 */
export async function startElasticsearch(): Promise<void> {
  // Ensure Docker and Docker Compose are installed before proceeding
  await checkDockerInstalled();
  await checkDockerComposeInstalled();

  console.log("🚀 Starting Elasticsearch via Docker Compose...");

  try {
    const { stdout } = await execAsync("docker-compose up -d");
    console.log("✅ Elasticsearch started successfully:");
    console.log(stdout.trim());
  } catch (error) {
    handleExecError(
      error,
      "Failed to start Elasticsearch using Docker Compose."
    );
    throw new Error(
      "❌ Failed to start Elasticsearch using Docker Compose. Please check your Docker setup."
    );
  }
}

/**
 * Stops Elasticsearch and cleans up using Docker Compose.
 * @returns {Promise<void>} - Resolves when Elasticsearch stops successfully, rejects otherwise.
 */
export async function stopElasticsearch(): Promise<void> {
  console.log("🛑 Stopping Elasticsearch via Docker Compose...");

  try {
    const { stdout } = await execAsync("docker-compose down");
    console.log("✅ Elasticsearch stopped successfully:");
    console.log(stdout.trim());
  } catch (error) {
    handleExecError(
      error,
      "Failed to stop Elasticsearch using Docker Compose."
    );
    throw new Error(
      "❌ Failed to stop Elasticsearch using Docker Compose. Please check your Docker setup."
    );
  }
}

/**
 * Safely handles and logs errors from exec calls.
 * @param {unknown} error - The error thrown by execAsync.
 * @param {string} message - A custom error message to log.
 */
function handleExecError(error: unknown, message: string): void {
  if (error instanceof Error) {
    console.error(`❌ ${message} Details: ${error.message}`);
  } else if (typeof error === "object" && error !== null && "stderr" in error) {
    console.error(`❌ ${message} Details: ${(error as any).stderr}`);
  } else {
    console.error(`❌ ${message} Unknown error occurred:`, error);
  }
}
