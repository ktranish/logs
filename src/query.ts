import {
  SearchRequest,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { getClient } from "./setup";

/**
 * A utility class for querying Elasticsearch indices.
 */
export class Query<T = any> {
  private readonly client;
  private readonly index: string;

  /**
   * Creates an instance of the Query class.
   * @param {string} index - The Elasticsearch index to query.
   */
  constructor(index: string) {
    this.client = getClient(); // Retrieve the initialized Elasticsearch client
    this.index = index;
  }

  /**
   * Executes a search query on the specified Elasticsearch index.
   * @param {Omit<SearchRequest, "index">} query - The search query object.
   * @returns {Promise<SearchResponse<T>>} - The search response from Elasticsearch.
   * @throws {Error} - If the query fails or the index is unavailable.
   */
  async search(
    query: Omit<SearchRequest, "index">
  ): Promise<SearchResponse<T>> {
    try {
      console.log(`Executing search on index: ${this.index}`);
      const response = await this.client.search<T>({
        index: this.index,
        ...query,
      });

      // Log the search hits for debugging purposes
      console.log("Search results:", response.hits.hits);
      return response;
    } catch (error: any) {
      console.error(
        `Failed to execute search on index: ${this.index}. Error: ${
          error.message || error
        }`
      );
      throw new Error(
        "Search query failed. Verify the query syntax and index availability."
      );
    }
  }
}
