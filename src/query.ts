import { ElasticClient } from "./client";
import {
  SearchRequest,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";

export class Query<T = any> {
  private client;
  private index: string;

  constructor(client: ElasticClient, index: string) {
    this.client = client.getInstance();
    this.index = index;
  }

  /**
   * Searches the Elasticsearch index with the provided query.
   * @param {SearchRequest} query - The search query object.
   * @returns {Promise<SearchResponse<T>>} - The search response from Elasticsearch.
   */
  async search(
    query: Omit<SearchRequest, "index">
  ): Promise<SearchResponse<T>> {
    try {
      const response = await this.client.search<T>({
        index: this.index,
        ...query,
      });
      console.log("Search successful:", response.hits.hits);
      return response;
    } catch (error) {
      console.error("Search query failed:", error);
      throw new Error(
        "Failed to execute search query. Check the query syntax or index availability."
      );
    }
  }
}
