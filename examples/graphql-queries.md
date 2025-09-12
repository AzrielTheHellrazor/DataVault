# GraphQL Query Examples

This file contains example queries for querying data from the AI data repository using the Irys GraphQL API.

## Basic Query Structure

```graphql
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
```

## Example Queries

### 1. Get Latest Dataset Version

```graphql
query GetLatestDatasetVersion($datasetName: String!) {
  transactions(
    first: 1
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          and: [
            { name: { equalTo: "Dataset-Name" }, value: { equalTo: $datasetName } }
          ]
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

### 2. Get All Versions of a Specific Split

```graphql
query GetDatasetVersions($datasetName: String!, $split: String!) {
  transactions(
    first: 50
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          and: [
            { name: { equalTo: "Dataset-Name" }, value: { equalTo: $datasetName } },
            { name: { equalTo: "Split" }, value: { equalTo: $split } }
          ]
        }
      }
    }
  ) {
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
      }
      cursor
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

### 3. Get All Datasets of a Specific App

```graphql
query GetAppDatasets($app: String!) {
  transactions(
    first: 100
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          name: { equalTo: "App" }
          value: { equalTo: $app }
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

### 4. Get All Datasets of a Specific Owner

```graphql
query GetOwnerDatasets($owner: String!) {
  transactions(
    first: 100
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          name: { equalTo: "Owner" }
          value: { equalTo: $owner }
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

### 5. Get Datasets in a Specific Time Range

```graphql
query GetDatasetsByTimeRange($startTime: Int!, $endTime: Int!) {
  transactions(
    first: 100
    sort: BLOCK_HEIGHT_DESC
    filters: {
      block: {
        timestamp: {
          greaterThanOrEqualTo: $startTime
          lessThanOrEqualTo: $endTime
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

### 6. Get PyTorch Model Files

```graphql
query GetPyTorchModels {
  transactions(
    first: 50
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          name: { equalTo: "Content-Type" }
          value: { equalTo: "application/pytorch" }
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

### 7. Complex Filtering (Multiple Conditions)

```graphql
query GetComplexFilter($datasetName: String!, $split: String!, $contentType: String!) {
  transactions(
    first: 50
    sort: BLOCK_HEIGHT_DESC
    filters: {
      tags: {
        some: {
          and: [
            { name: { equalTo: "Dataset-Name" }, value: { equalTo: $datasetName } },
            { name: { equalTo: "Split" }, value: { equalTo: $split } },
            { name: { equalTo: "Content-Type" }, value: { equalTo: $contentType } }
          ]
        }
      }
    }
  ) {
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
      }
    }
  }
}
```

## Variable Examples

```json
{
  "datasetName": "mnist",
  "split": "train",
  "app": "my-ai-app",
  "owner": "user@example.com",
  "contentType": "application/pytorch",
  "startTime": 1640995200,
  "endTime": 1672531200
}
```

## Pagination

```graphql
query GetNextPage($first: Int!, $after: String!) {
  transactions(first: $first, after: $after, sort: BLOCK_HEIGHT_DESC) {
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
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

## Sorting Options

- `BLOCK_HEIGHT_DESC` - Newest first
- `BLOCK_HEIGHT_ASC` - Oldest first
- `CREATED_AT_DESC` - By creation time (newest first)
- `CREATED_AT_ASC` - By creation time (oldest first)

## Usage Tips

1. **Performance**: Limit page size using the `first` parameter for large datasets.
2. **Filtering**: Use as specific filters as possible.
3. **Pagination**: Check `pageInfo.hasNextPage` to retrieve all data.
4. **Timestamp**: Use Unix timestamp format for time ranges.
