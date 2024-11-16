export interface IndexSettings {
  shards: number;
  replicas: number;
}

export interface Config {
  retentionDays: number;
  indexSettings: {
    development: IndexSettings;
    staging: IndexSettings;
    production: IndexSettings;
  };
}

export const defaultConfig: Config = {
  retentionDays: 30,
  indexSettings: {
    development: { shards: 1, replicas: 0 },
    staging: { shards: 2, replicas: 1 },
    production: { shards: 3, replicas: 2 },
  },
};
