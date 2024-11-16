# Logs

>A lightweight, developer-friendly log management library built with Elasticsearch for effortless log capturing, querying, and storage.

## About

**Logs** is a flexible log management library designed to streamline the process of capturing, storing, and querying logs. Built with Elasticsearch integration, it provides developers with the tools to handle structured logging efficiently, whether in local development or production environments.

With built-in support for Docker, **Logs** ensures a seamless developer experience by allowing users to spin up a local Elasticsearch instance right out of the box.

## Features

- ⚡ **Elasticsearch Integration**: Effortless logging and querying with Elasticsearch.
- 🔧 **Built-in Docker Support**: Spin up a local Elasticsearch instance with zero manual setup.
- 🛠️ **Utility-first Design**: Simplified APIs for managing indices, ingesting logs, and querying data.
- 🌟 **Standalone or Integrated**: Use as a standalone library or integrate with other packages.
- 📦 **TypeScript Support**: Full TypeScript definitions for better developer experience.

## Getting Started

### Installation

Install the package using your favorite package manager:

```bash
# npm
npm install @your-scope/logs

# yarn
yarn add @your-scope/logs

# pnpm
pnpm add @your-scope/logs
```

### Usage

#### Basic Setup

1. Create an instance of the Elasticsearch client.
2. Set up an index manager to handle indices.
3. Use the logger to capture and store logs.
4. Query logs for debugging or analysis.

```tsx
import { ElasticClient } from "@your-scope/logs";
import { IndexManager } from "@your-scope/logs";
import { Logger } from "@your-scope/logs";
import { Query } from "@your-scope/logs";

// Initialize Elasticsearch client
const client = new ElasticClient("http://localhost:9200");

// Create an index manager
const indexManager = new IndexManager(client);
await indexManager.createIndex("my-app-logs");

// Log events
const logger = new Logger(client, "my-app-logs");
await logger.log("info", "Application started", { userId: 123 });

// Query logs
const query = new Query(client, "my-app-logs");
const logs = await query.search({
  query: {
    match: { "metadata.userId": 123 },
  },
});

console.log(logs.hits.hits);

```

### Built-in Docker Support

If you don't have Elasticsearch installed, use the built-in Docker configuration to spin up an instance.

#### Start Elasticsearch

```bash
npm run setup
```

#### Stop Elasticsearch

```bash
npm run teardown
```

The library automatically detects if Elasticsearch is running and starts it when necessary.

## Developer Guide

### Project Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/logs.git
cd logs
```

2. Install dependencies:

```bash
npm install
```

3. Run the project:

```bash
npm start
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
