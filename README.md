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

### Use Cases

#### 1. Local Development with Docker

If you're cloning this repository and setting up a local Elasticsearch instance:

1. Clone the repository:

```bash
git clone https://github.com/ktranish/logs.git
cd logs
```

2. Install dependencies:

```bash
pnpm install
```

3. Start Elasticsearch locally using Docker:

```bash
pnpm docker-up
```

4. Check the Elasticsearch setup and run the example script:

```bash
pnpm start
```

#### 2. Using a Managed Elasticsearch Service

If you want to connect to a managed Elasticsearch instance (e.g., AWS OpenSearch, Elastic Cloud):

1. Install the package using your favorite package manager:

```bash
# npm
npm install @your-scope/logs

# yarn
yarn add @your-scope/logs

# pnpm
pnpm add @your-scope/logs
```

2. Set up your environment: Create a .env file or directly set the following environment variables:

```bash
ELASTICSEARCH_URL=https://your-managed-elasticsearch.com
ELASTIC_USERNAME=your-username
ELASTIC_PASSWORD=your-password
```

3. Use the package in your project:

```tsx
import { ElasticClient } from "@ktranish/logs";

const client = new ElasticClient(process.env.ELASTICSEARCH_URL!, {
  username: process.env.ELASTIC_USERNAME,
  password: process.env.ELASTIC_PASSWORD,
  ssl: true,
});

const logger = new Logger(client, "application-logs");
logger.info("User signed in", { userId: 123 });
```

### Usage

#### 1. Initialize Elasticsearch Client

Create a client to interact with Elasticsearch:

```tsx
import { ElasticClient } from "@ktranish/logs";

const client = new ElasticClient("https://your-es-instance.com/", {
  username: "elastic",
  password: "changeme",
  ssl: true,
});
```

#### 2. Log Messages

Log structured messages into Elasticsearch:

```tsx
import { Logger } from "@ktranish/logs";

const logger = new Logger(client, "application-logs");

logger.info("User logged in", { userId: 123 });
logger.warn("Low disk space", { disk: "C:", available: "500MB" });
logger.error("Failed to process request", { error: "Timeout" });
```

#### 3. Query Logs

Search for logs using Elasticsearch queries:

```tsx
import { Query } from "@ktranish/logs";

const query = new Query(client, "application-logs");

const results = await query.search({
  query: {
    match: { level: "error" },
  },
});

console.log("Error Logs:", results.hits.hits);

```

#### 4. Enforce Retention Policies

```tsx
import { RetentionPolicy } from "@ktranish/logs";

const retention = new RetentionPolicy(client);

await retention.enforceRetention("application-logs", 30); // Retain logs for 30 days

```

### Docker Configuration

#### docker-compose.yml

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

### Available Scripts

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
