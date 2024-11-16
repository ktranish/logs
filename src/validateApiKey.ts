import { ElasticClient } from "./client";

export async function validateApiKey(client: ElasticClient): Promise<boolean> {
  try {
    const response = await client.getInstance().security.getApiKey();

    if (!response.api_keys || response.api_keys.length === 0) {
      console.warn("No API keys found in Elasticsearch.");
      return false;
    }

    console.log("API keys are valid:", response.api_keys);
    return true;
  } catch (error) {
    handleApiKeyError(error);
    throw new Error(
      "API Key validation failed. Please check your credentials."
    );
  }
}

/**
 * Handles errors that occur during API key validation.
 * @param {unknown} error - The error thrown by the Elasticsearch client.
 */
function handleApiKeyError(error: unknown): void {
  if (error instanceof Error) {
    console.error("Elasticsearch API Key validation error:", error.message);
  } else if (typeof error === "object" && error !== null && "meta" in error) {
    const metaError = error as { meta: { body?: { error?: string } } };
    console.error(
      "Elasticsearch API Key validation error:",
      metaError.meta?.body?.error || "Unknown error."
    );
  } else {
    console.error(
      "An unknown error occurred during API Key validation:",
      error
    );
  }
}
