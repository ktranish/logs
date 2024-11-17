# Logs

>A lightweight, developer-friendly log management library built with Elasticsearch for effortless log capturing, querying, and storage.

## About

**Logs** is a flexible log management library designed to streamline the process of capturing, storing, and querying logs. Built with Elasticsearch integration, it provides developers with the tools to handle structured logging efficiently, whether in local development or production environments.

With built-in support for Docker, **Logs** ensures a seamless developer experience by allowing users to spin up a local Elasticsearch instance right out of the box.

## Features

- 🌟 **Unified API**: Simplifies logging, querying, and document management into a single utility.
- 🚀 **Elasticsearch Integration**: Out-of-the-box support for Elasticsearch with robust client management.
- 🛠 **Configurable**: Supports custom Elasticsearch setups with local or remote instances.
- 🌟 **Standalone or Integrated**: Use as a standalone library or integrate with other packages.
- 📦 **TypeScript Support**: Full TypeScript definitions for better developer experience.

## Getting Started

### Installation

Install Logs via your preferred package manager:

```bash
# npm
npm install @ktranish/logs

# yarn
yarn add @ktranish/logs

# pnpm
pnpm add @ktranish/logs
```

### Setup

1. Environment Configuration: Define Elasticsearch connection details in your `.env` file.
```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=changeme
```

2. Initialize Elasticsearch: Use the `setupElasticsearch` utility to start Elasticsearch locally (via Docker) or connect to a remote instance.

```tsx
import { setupElasticsearch } from "@ktranish/logs";

(async () => {
  await setupElasticsearch();
})();
```

## Usage

### 1. Logging

```tsx
import { Logs } from "@ktranish/logs";

// Initialize the utility for your index
const logs = new Logs("application-logs");

// Log a message
await logs.log("info", "User logged in", { userId: 12345 });
```

### 2. Querying Logs

```tsx
// Search for logs matching a query
const results = await logs.search({
  query: {
    match: {
      message: "error",
    },
  },
});

console.log("Search results:", results.hits.hits);
```

### 3. Count Logs

```tsx
const count = await logs.count({
  query: {
    match: {
      level: "info",
    },
  },
});

console.log(`Found ${count} info-level logs.`);
```

### 4. Document Management

#### Add a Document

```tsx
await logs.addDocument({
  message: "User signed up",
  level: "info",
  metadata: { userId: 67890 },
  timestamp: new Date().toISOString(),
});
```

#### Update a Document

```tsx
await logs.updateDocument("document-id", {
  level: "warn",
});
```

#### Delete a Document

```tsx
await logs.deleteDocument("document-id");
```

### 5. Bulk Operations

```tsx
await logs.bulk([
  { index: { _id: "1" } },
  { message: "Bulk log 1", level: "info", timestamp: new Date().toISOString() },
  { index: { _id: "2" } },
  { message: "Bulk log 2", level: "error", timestamp: new Date().toISOString() },
]);
```

### 6. Index Management

#### Check if Index Exists

```tsx
const exists = await logs.indexExists();
console.log(`Index exists: ${exists}`);
```

#### Create an Index

```tsx
await logs.createIndex({
  number_of_shards: 3,
  number_of_replicas: 1,
});
```

#### Delete an Index

```tsx
await logs.deleteIndex();
```

## Using with Next.js

### Example: Logging API Route

```tsx
// src/app/api/log/route.ts
import { Logs } from "@ktranish/logs";
import { setupElasticsearch } from "@ktranish/logs";

// Ensure Logs is initialized
await setupElasticsearch();

export async function POST(req: Request) {
  const logs = new Logs("application-logs");

  try {
    const { level, message, metadata } = await req.json();

    if (!level || !message) {
      return new Response(
        JSON.stringify({ error: "Missing 'level' or 'message'." }),
        { status: 400 }
      );
    }

    await logs.log(level, message, metadata || {});
    return new Response(JSON.stringify({ status: "Log created." }), {
      status: 200,
    });
  } catch (error) {
    console.error("Logging failed:", error);
    return new Response(JSON.stringify({ error: "Logging failed." }), {
      status: 500,
    });
  }
}
```

## API Reference

### Logs

A unified utility for interacting with Elasticsearch indices.

#### Constructor

```tsx
constructor(index: string)
```

| Parameter | Type     | Description                               |
| --------- | -------- | ----------------------------------------- |
| `index`   | `string` | The Elasticsearch index to interact with. |

#### Logging Methods

- `log(level, message, metadata)`

| Parameter    | Type                          | Description                     |
| ------------ | ----------------------------- | ------------------------------- |
| `level`      | `info | warn | error | debug` | Severity level                  |
| `message`    | `string`                      | Log message.                    |
| `metadata`   | `Record<string, any>`         | Additional metadata (optional). |

#### Querying Methods

- `search(query)`: Executes a search query on the index.
- `count(query)`: Counts documents matching a query.

#### Document Management

- `addDocument(document)`: Adds a document to the index.
- `updateDocument(id, partialDoc)`: Updates fields in an existing document.
- `deleteDocument(id)`: Deletes a document by its ID.

## Docker Configuration

### docker-compose.yml

For local development, ensure you have the following docker-compose.yml file:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elastic_data:/usr/share/elasticsearch/data

volumes:
  elastic_data:

```

## Available Scripts

- `pnpm start`: Check Elasticsearch health and start it if not running.
- `pnpm build`: Compile the TypeScript source code to JavaScript.
- `pnpm docker-up`: Start Elasticsearch using Docker Compose.
- `pnpm docker-down`: Stop Elasticsearch containers and clean up.
- `pnpm lint`: Run ESLint to check and fix code issues.
- `pnpm test`: Run unit tests using Jest.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
