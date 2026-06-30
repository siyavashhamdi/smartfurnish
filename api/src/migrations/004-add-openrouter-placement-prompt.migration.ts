import { APP_SETTING_KEY } from "../constants/app-setting.constant";
import { DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT } from "../constants/product-ai-preview.constants";
import { BaseMigration, registerMigration } from "./core";

/**
 * Migration: Add default AI preview placement prompt to existing OpenRouter settings.
 */
export class Migration004_AddOpenRouterPlacementPrompt extends BaseMigration {
  version = 4;
  name = "AddOpenRouterPlacementPrompt";

  async up(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const result = await appSettingsCollection.updateMany(
      {
        key: APP_SETTING_KEY.OPENROUTER_CONFIG,
        $or: [
          { "value.placementPrompt": { $exists: false } },
          { "value.placementPrompt": "" },
          { "value.placementPrompt": null },
        ],
      },
      {
        $set: {
          "value.placementPrompt": DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT,
        },
      },
    );

    console.log(
      `✅ Migration ${this.version} (${this.name}) updated ${result.modifiedCount} OpenRouter setting(s)`,
    );
  }

  async down(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const result = await appSettingsCollection.updateMany(
      {
        key: APP_SETTING_KEY.OPENROUTER_CONFIG,
        "value.placementPrompt": DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT,
      },
      {
        $unset: {
          "value.placementPrompt": "",
        },
      },
    );

    console.log(
      `✅ Migration ${this.version} (${this.name}) rolled back ${result.modifiedCount} OpenRouter setting(s)`,
    );
  }
}

registerMigration(Migration004_AddOpenRouterPlacementPrompt);
