/**
 * This file imports all migrations so they are automatically registered.
 * When you create a new migration, add an import statement here.
 */

// Import migrations in order (they will be sorted by version automatically)
export * from "./001-create-default-super-admin-users.migration";
export * from "./002-seed-default-app-settings.migration";
export * from "./003-seed-openrouter-app-setting.migration";
export * from "./004-add-openrouter-placement-prompt.migration";
export * from "./005-seed-ai-preview-staging-duration-setting.migration";

// Add more migrations here as you create them:
