import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

/**
 * Ensures Docker is installed and accessible in the system.
 * @returns {Promise<void>} - Resolves if Docker is installed, rejects otherwise.
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
 * Ensures Docker Compose is installed and accessible in the system.
 * @returns {Promise<void>} - Resolves if Docker Compose is installed, rejects otherwise.
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
 * Resolves the path to the `docker-compose.yml` file.
 * - Checks the consumer's project directory.
 * - Falls back to the default file bundled with the package.
 * @returns {string} - Path to the `docker-compose.yml` file.
 * @throws {Error} - If no `docker-compose.yml` file is found.
 */
function resolveDockerComposePath(): string {
  const consumerPath = path.resolve(process.cwd(), "docker-compose.yml");

  console.log(
    "Checking for consumer-provided docker-compose.yml at:",
    consumerPath
  );

  if (fs.existsSync(consumerPath)) {
    console.log("ℹ️ Using consumer-provided `docker-compose.yml`.");
    return consumerPath;
  }

  try {
    const packagePath = path.dirname(
      require.resolve("@ktranish/logs/package.json")
    );
    const defaultPath = path.join(packagePath, "docker-compose.yml");

    console.log(
      "Checking for package default docker-compose.yml at:",
      defaultPath
    );

    if (fs.existsSync(defaultPath)) {
      console.log("ℹ️ Using default `docker-compose.yml` from package.");
      return defaultPath;
    }
  } catch (error) {
    console.warn("❌ Unable to resolve package path for `docker-compose.yml`.");
  }

  throw new Error(
    "❌ No `docker-compose.yml` file found. Ensure one is present in the consumer project or the package."
  );
}

/**
 * Starts Elasticsearch using Docker Compose.
 * @returns {Promise<void>} - Resolves when Elasticsearch starts successfully, rejects otherwise.
 */
export async function startElasticsearch(): Promise<void> {
  // Ensure Docker and Docker Compose are installed
  await checkDockerInstalled();
  await checkDockerComposeInstalled();

  const dockerComposePath = resolveDockerComposePath();

  console.log("🚀 Starting Elasticsearch via Docker Compose...");

  try {
    const { stdout } = await execAsync(
      `docker-compose -f ${dockerComposePath} up -d`
    );
    console.log("✅ Elasticsearch started successfully.");
    console.log(stdout.trim());
  } catch (error) {
    handleExecError(
      error,
      "Failed to start Elasticsearch using Docker Compose."
    );
    throw new Error(
      "❌ Failed to start Elasticsearch. Check your Docker setup."
    );
  }
}

/**
 * Stops Elasticsearch using Docker Compose.
 * @returns {Promise<void>} - Resolves when Elasticsearch stops successfully, rejects otherwise.
 */
export async function stopElasticsearch(): Promise<void> {
  const dockerComposePath = resolveDockerComposePath();

  console.log("🛑 Stopping Elasticsearch via Docker Compose...");

  try {
    const { stdout } = await execAsync(
      `docker-compose -f ${dockerComposePath} down`
    );
    console.log("✅ Elasticsearch stopped successfully.");
    console.log(stdout.trim());
  } catch (error) {
    handleExecError(
      error,
      "Failed to stop Elasticsearch using Docker Compose."
    );
    throw new Error(
      "❌ Failed to stop Elasticsearch. Check your Docker setup."
    );
  }
}

/**
 * Handles errors during execution and logs them appropriately.
 * @param {unknown} error - The error thrown during execution.
 * @param {string} message - Custom message to provide context.
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
