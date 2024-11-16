import { startElasticsearch } from "./setup";

const ELASTICSEARCH_URL = "http://localhost:9200";

export async function checkElasticsearch(): Promise<void> {
  console.log("Starting Elasticsearch check...");

  try {
    console.log("Fetching Elasticsearch health status...");
    const response = await fetch(`${ELASTICSEARCH_URL}/_cluster/health`);
    console.log("Received response:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "Elasticsearch is already running. Cluster health status:",
        data.status
      );
      return;
    }

    console.warn(
      "Elasticsearch health check returned a non-OK status:",
      response.status
    );
  } catch (error) {
    console.warn("Error occurred while fetching Elasticsearch health:", error);
    handleCheckError(error, "Elasticsearch is not running or unavailable.");
  }

  try {
    console.log("Attempting to start Elasticsearch...");
    await startElasticsearch();
    console.log("Elasticsearch started successfully.");
  } catch (startError) {
    console.error(
      "Failed to start Elasticsearch. Please check your Docker setup."
    );
    handleCheckError(startError, "Failed to start Elasticsearch.");
    throw new Error("Elasticsearch could not be started.");
  }

  console.log("Elasticsearch check complete.");
}

function handleCheckError(error: unknown, message: string): void {
  if (error instanceof Error) {
    console.error(`${message} Details: ${error.message}`);
  } else {
    console.error(`${message} Unknown error occurred:`, error);
  }
}
