export const FILE_CONTENT_CACHE_IDB_NAME = "smart-furnish-file-content-cache";
export const FILE_CONTENT_CACHE_IDB_STORE = "sqlite";
export const FILE_CONTENT_CACHE_IDB_KEY = "db";
export const SQL_JS_WASM_IDB_KEY = "sql-wasm";

export const FILE_CONTENT_CACHE_TABLE = "file_content_cache";

export const APOLLO_CACHE_TABLE = "apollo_cache_snapshot";
export const GQL_QUERY_CACHE_TABLE = "gql_query_cache";
export const APOLLO_CACHE_STORAGE_KEY = "smart-furnish:apollo-cache";
export const APOLLO_CACHE_LEGACY_STORAGE_KEYS = [
  APOLLO_CACHE_STORAGE_KEY,
  "smart-furnish:apollo-cache-sync",
] as const;

export const FILE_CONTENT_CACHE_PERSIST_DEBOUNCE_MS = 750;
