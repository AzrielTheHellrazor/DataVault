import { GraphQLClient } from 'graphql-request';
import { QueryOptions, QueryResult } from '../types';

export class IrysQuery {
  private client: GraphQLClient;
  private gatewayUrl: string;

  constructor(gatewayUrl: string = 'https://gateway.irys.xyz') {
    this.gatewayUrl = gatewayUrl;
    this.client = new GraphQLClient(`${gatewayUrl}/graphql`);
  }

  async queryData(options: QueryOptions): Promise<{ results: QueryResult[], nextCursor?: string }> {
    try {
      const query = this.buildGraphQLQuery(options);
      const variables = this.buildVariables(options);

      const data = await this.client.request(query, variables) as any;
      
      const results: QueryResult[] = data.transactions.edges.map((edge: any) => {
        const node = edge.node;
        const tags = this.extractTags(node.tags);
        
        return {
          id: node.id,
          timestamp: node.block?.timestamp || 0,
          tags,
          receipt: node.receipt?.signature,
          cursor: edge.cursor
        };
      });

      const nextCursor = data.transactions.pageInfo.hasNextPage 
        ? data.transactions.edges[data.transactions.edges.length - 1]?.cursor
        : undefined;

      return { results, nextCursor };
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildGraphQLQuery(options: QueryOptions): string {
    const filters = this.buildFilterConditions(options.filters);
    const sortField = options.sortBy === 'timestamp' ? 'block' : 'createdAt';
    const sortOrder = options.sortOrder?.toUpperCase() || 'DESC';

    return `
      query GetTransactions($first: Int, $after: String, $sort: TransactionSort, $filters: TransactionFilters) {
        transactions(first: $first, after: $after, sort: $sort, filters: $filters) {
          edges {
            node {
              id
              block {
                timestamp
              }
              tags {
                name
                value
              }
              receipt {
                signature
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;
  }

  private buildVariables(options: QueryOptions): any {
    const sortField = options.sortBy === 'timestamp' ? 'BLOCK_HEIGHT' : 'CREATED_AT';
    const sortOrder = options.sortOrder?.toUpperCase() || 'DESC';

    return {
      first: options.limit || 50,
      after: options.cursor,
      sort: `${sortField}_${sortOrder}`,
      filters: this.buildFilters(options.filters)
    };
  }

  private buildFilters(filters?: any): any {
    if (!filters) return {};

    const tagFilters: any[] = [];

    if (filters.datasetName) {
      tagFilters.push({
        name: { equalTo: 'Dataset-Name' },
        value: { equalTo: filters.datasetName }
      });
    }

    if (filters.split) {
      tagFilters.push({
        name: { equalTo: 'Split' },
        value: { equalTo: filters.split }
      });
    }

    if (filters.version) {
      tagFilters.push({
        name: { equalTo: 'Version' },
        value: { equalTo: filters.version }
      });
    }

    if (filters.contentType) {
      tagFilters.push({
        name: { equalTo: 'Content-Type' },
        value: { equalTo: filters.contentType }
      });
    }

    if (filters.app) {
      tagFilters.push({
        name: { equalTo: 'App' },
        value: { equalTo: filters.app }
      });
    }

    if (filters.owner) {
      tagFilters.push({
        name: { equalTo: 'Owner' },
        value: { equalTo: filters.owner }
      });
    }

    const result: any = {};

    if (tagFilters.length > 0) {
      result.tags = { some: { or: tagFilters } };
    }

    if (filters.startTime || filters.endTime) {
      result.block = {};
      
      if (filters.startTime) {
        result.block.timestamp = { ...result.block.timestamp, greaterThanOrEqualTo: new Date(filters.startTime).getTime() / 1000 };
      }
      
      if (filters.endTime) {
        result.block.timestamp = { ...result.block.timestamp, lessThanOrEqualTo: new Date(filters.endTime).getTime() / 1000 };
      }
    }

    return result;
  }

  private buildFilterConditions(filters?: any): string {
    if (!filters) return '';

    const conditions: string[] = [];

    if (filters.datasetName) {
      conditions.push(`tags: { name: { equalTo: "Dataset-Name" }, value: { equalTo: "${filters.datasetName}" } }`);
    }

    if (filters.split) {
      conditions.push(`tags: { name: { equalTo: "Split" }, value: { equalTo: "${filters.split}" } }`);
    }

    if (filters.version) {
      conditions.push(`tags: { name: { equalTo: "Version" }, value: { equalTo: "${filters.version}" } }`);
    }

    if (filters.contentType) {
      conditions.push(`tags: { name: { equalTo: "Content-Type" }, value: { equalTo: "${filters.contentType}" } }`);
    }

    if (filters.app) {
      conditions.push(`tags: { name: { equalTo: "App" }, value: { equalTo: "${filters.app}" } }`);
    }

    if (filters.owner) {
      conditions.push(`tags: { name: { equalTo: "Owner" }, value: { equalTo: "${filters.owner}" } }`);
    }

    return conditions.join(', ');
  }

  private extractTags(tags: Array<{ name: string; value: string }>): any {
    const result: any = {};
    
    tags.forEach(tag => {
      switch (tag.name) {
        case 'App':
          result.app = tag.value;
          break;
        case 'Content-Type':
          result.contentType = tag.value;
          break;
        case 'Dataset-Name':
          result.datasetName = tag.value;
          break;
        case 'Split':
          result.split = tag.value;
          break;
        case 'Version':
          result.version = tag.value;
          break;
        case 'Owner':
          result.owner = tag.value;
          break;
        case 'Created-At':
          result.createdAt = tag.value;
          break;
      }
    });

    return result;
  }

  async getLatestVersion(datasetName: string, split?: string): Promise<QueryResult | null> {
    const options: QueryOptions = {
      filters: {
        datasetName,
        ...(split && { split })
      },
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: 1
    };

    const { results } = await this.queryData(options);
    return results.length > 0 ? results[0] : null;
  }

  async getVersions(datasetName: string, split?: string): Promise<QueryResult[]> {
    const options: QueryOptions = {
      filters: {
        datasetName,
        ...(split && { split })
      },
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };

    const { results } = await this.queryData(options);
    return results;
  }
}
