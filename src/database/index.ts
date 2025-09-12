import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { DatabaseRecord, DatasetMetadata } from '../types';

export class Database {
  private db: sqlite3.Database;
  private run: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private get: (sql: string, params?: any[]) => Promise<any>;
  private all: (sql: string, params?: any[]) => Promise<any[]>;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.run(`
      CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        transaction_id TEXT UNIQUE NOT NULL,
        timestamp INTEGER NOT NULL,
        tags TEXT NOT NULL,
        receipt TEXT,
        created_at TEXT NOT NULL
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_dataset_name ON datasets (
        json_extract(tags, '$.datasetName')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_split ON datasets (
        json_extract(tags, '$.split')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_version ON datasets (
        json_extract(tags, '$.version')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_content_type ON datasets (
        json_extract(tags, '$.contentType')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_app ON datasets (
        json_extract(tags, '$.app')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_owner ON datasets (
        json_extract(tags, '$.owner')
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON datasets (timestamp)
    `);
  }

  async insertRecord(record: DatabaseRecord): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO datasets 
       (id, transaction_id, timestamp, tags, receipt, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.transactionId,
        record.timestamp,
        JSON.stringify(record.tags),
        record.receipt,
        record.createdAt
      ]
    );
  }

  async queryRecords(filters: any = {}, sortBy = 'timestamp', sortOrder = 'desc', limit = 50, cursor?: string): Promise<{ records: DatabaseRecord[], nextCursor?: string }> {
    let whereClauses: string[] = [];
    let params: any[] = [];

    // Build WHERE clauses based on filters
    if (filters.datasetName) {
      whereClauses.push(`json_extract(tags, '$.datasetName') = ?`);
      params.push(filters.datasetName);
    }

    if (filters.split) {
      whereClauses.push(`json_extract(tags, '$.split') = ?`);
      params.push(filters.split);
    }

    if (filters.version) {
      whereClauses.push(`json_extract(tags, '$.version') = ?`);
      params.push(filters.version);
    }

    if (filters.contentType) {
      whereClauses.push(`json_extract(tags, '$.contentType') = ?`);
      params.push(filters.contentType);
    }

    if (filters.app) {
      whereClauses.push(`json_extract(tags, '$.app') = ?`);
      params.push(filters.app);
    }

    if (filters.owner) {
      whereClauses.push(`json_extract(tags, '$.owner') = ?`);
      params.push(filters.owner);
    }

    if (filters.startTime) {
      whereClauses.push(`timestamp >= ?`);
      params.push(new Date(filters.startTime).getTime());
    }

    if (filters.endTime) {
      whereClauses.push(`timestamp <= ?`);
      params.push(new Date(filters.endTime).getTime());
    }

    // Handle cursor-based pagination
    if (cursor) {
      const cursorCondition = sortOrder === 'desc' ? 'timestamp < ?' : 'timestamp > ?';
      whereClauses.push(cursorCondition);
      params.push(parseInt(cursor));
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    const limitClause = `LIMIT ${limit + 1}`; // +1 to check if there are more records

    const sql = `
      SELECT id, transaction_id, timestamp, tags, receipt, created_at
      FROM datasets 
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `;

    const rows = await this.all(sql, params);
    
    const hasMore = rows.length > limit;
    const records = hasMore ? rows.slice(0, limit) : rows;
    
    const nextCursor = hasMore && records.length > 0 
      ? records[records.length - 1].timestamp.toString()
      : undefined;

    return {
      records: records.map(row => ({
        id: row.id,
        transactionId: row.transaction_id,
        timestamp: row.timestamp,
        tags: JSON.parse(row.tags),
        receipt: row.receipt,
        createdAt: row.created_at
      })),
      nextCursor
    };
  }

  async getRecordByTransactionId(transactionId: string): Promise<DatabaseRecord | null> {
    const row = await this.get(
      'SELECT id, transaction_id, timestamp, tags, receipt, created_at FROM datasets WHERE transaction_id = ?',
      [transactionId]
    );

    if (!row) return null;

    return {
      id: row.id,
      transactionId: row.transaction_id,
      timestamp: row.timestamp,
      tags: JSON.parse(row.tags),
      receipt: row.receipt,
      createdAt: row.created_at
    };
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
