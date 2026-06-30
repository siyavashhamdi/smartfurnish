import { APP_SETTING_KEY } from "../constants/app-setting.constant";
import { DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT } from "../constants/product-ai-preview.constants";
import { AppSettingValueType } from "../enums";
import { BaseMigration, registerMigration } from "./core";

const OPENROUTER_CONFIG_SETTING = {
  key: APP_SETTING_KEY.OPENROUTER_CONFIG,
  label: "تنظیمات OpenRouter (پیش‌نمایش هوشمند)",
  value: {
    apiKey: "",
    model: "sourceful/riverflow-v2.5-fast:free",
    placementPrompt: DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT,
  },
  valueType: AppSettingValueType.JSON,
  description:
    "تنظیمات تولید تصویر پیش‌نمایش هوشمند شامل کلید API و نام مدل OpenRouter",
  isActive: true,
} as const;

/**
 * Migration: Seed OpenRouter app setting for AI product preview.
 */
export class Migration003_SeedOpenRouterAppSetting extends BaseMigration {
  version = 3;
  name = "SeedOpenRouterAppSetting";

  async up(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const existingSetting = await appSettingsCollection.findOne({
      key: OPENROUTER_CONFIG_SETTING.key,
    });

    if (existingSetting) {
      console.log(
        `ℹ️  App setting ${OPENROUTER_CONFIG_SETTING.key} already exists, skipping`,
      );
      return;
    }

    await appSettingsCollection.insertOne({
      key: OPENROUTER_CONFIG_SETTING.key,
      label: OPENROUTER_CONFIG_SETTING.label,
      value: OPENROUTER_CONFIG_SETTING.value,
      valueType: OPENROUTER_CONFIG_SETTING.valueType,
      description: OPENROUTER_CONFIG_SETTING.description,
      isActive: OPENROUTER_CONFIG_SETTING.isActive,
      audit: {
        createdAt: new Date(),
      },
      deletedAt: null,
      deletedBy: null,
    });

    console.log(
      `✅ Migration ${this.version} (${this.name}) created ${OPENROUTER_CONFIG_SETTING.key}`,
    );
  }

  async down(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const result = await appSettingsCollection.deleteOne({
      key: OPENROUTER_CONFIG_SETTING.key,
    });

    console.log(
      `✅ Migration ${this.version} (${this.name}) rolled back - Removed ${result.deletedCount} setting(s)`,
    );
  }
}

registerMigration(Migration003_SeedOpenRouterAppSetting);
