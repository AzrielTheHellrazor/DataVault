export { AIRepository } from './repository';
export { Database } from './database';
export { IrysUploader } from './irys/uploader';
export { IrysQuery } from './irys/query';
export { IrysFetcher } from './irys/fetcher';
export * from './types';

// Example usage
import { AIRepository } from './repository';
import { DatasetMetadata } from './types';
import dotenv from 'dotenv';

dotenv.config();

async function example() {
  const privateKey = process.env.IRYS_PRIVATE_KEY;
  const dbPath = process.env.DATABASE_PATH || './data/repository.db';

  if (!privateKey) {
    console.error('IRYS_PRIVATE_KEY environment variable is required');
    return;
  }

  const repository = new AIRepository(privateKey, dbPath);

  try {
    // Example: Upload a file
    const metadata: DatasetMetadata = {
      app: 'example-app',
      contentType: 'application/pytorch',
      datasetName: 'mnist',
      split: 'train',
      version: '1.0.0',
      owner: 'user@example.com',
      createdAt: new Date().toISOString()
    };

    // Upload file (uncomment to use)
    // const result = await repository.uploadFile('./example.pt', metadata, { receipt: true });
    // console.log('Upload result:', result);

    // Example: Query datasets
    const queryResults = await repository.queryData({
      filters: { datasetName: 'mnist' },
      limit: 10
    });
    console.log('Query results:', queryResults);

    // Example: Get latest version
    const latest = await repository.getLatestVersion('mnist', 'train');
    console.log('Latest version:', latest);

    // Example: Check balance
    const balance = await repository.getBalance();
    console.log('Balance:', balance);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await repository.close();
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  example();
}
