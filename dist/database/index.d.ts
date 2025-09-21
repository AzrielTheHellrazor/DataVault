import { DatabaseRecord } from '../types';
export declare class Database {
    private db;
    private run;
    private get;
    private all;
    constructor(dbPath: string);
    private initialize;
    insertRecord(record: DatabaseRecord): Promise<void>;
    queryRecords(filters?: any, sortBy?: string, sortOrder?: string, limit?: number, cursor?: string): Promise<{
        records: DatabaseRecord[];
        nextCursor?: string;
    }>;
    getRecordByTransactionId(transactionId: string): Promise<DatabaseRecord | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map