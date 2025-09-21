import { QueryOptions, QueryResult } from '../types';
export declare class IrysQuery {
    private client;
    constructor(gatewayUrl?: string);
    queryData(options: QueryOptions): Promise<{
        results: QueryResult[];
        nextCursor?: string;
    }>;
    private buildGraphQLQuery;
    private buildVariables;
    private buildFilters;
    private extractTags;
    getLatestVersion(datasetName: string, split?: string): Promise<QueryResult | null>;
    getVersions(datasetName: string, split?: string): Promise<QueryResult[]>;
}
//# sourceMappingURL=query.d.ts.map