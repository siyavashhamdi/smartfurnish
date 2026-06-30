import { APP_SETTING_KEY } from "../constants/app-setting.constant";
import { DEFAULT_AI_PREVIEW_STAGING_DURATION_SECONDS } from "../constants/product-ai-preview.constants";
import { AppSettingValueType } from "../enums";
import { BaseMigration, registerMigration } from "./core";

const AI_PREVIEW_STAGING_DURATION_SETTING = {
  key: APP_SETTING_KEY.AI_PREVIEW_STAGING_DURATION_SECONDS,
  label: "مدت زمان تولید پیش‌نمایش هوشمند",
  value: DEFAULT_AI_PREVIEW_STAGING_DURATION_SECONDS,
  valueType: AppSettingValueType.NUMBER,
  description:
    "میانگین زمان تولید پیش‌نمایش هوشمند (ثانیه). این مقدار پس از هر تولید موفق توسط سامانه به‌روزرسانی می‌شود.",
  isActive: true,
} as const;

/**
 * Migration: Seed AI preview staging duration app setting.
 */
export class Migration005_SeedAiPreviewStagingDurationSetting extends BaseMigration {
  version = 5;
  name = "SeedAiPreviewStagingDurationSetting";

  async up(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const existingSetting = await appSettingsCollection.findOne({
      key: AI_PREVIEW_STAGING_DURATION_SETTING.key,
    });

    if (existingSetting) {
      console.log(
        `ℹ️  App setting ${AI_PREVIEW_STAGING_DURATION_SETTING.key} already exists, skipping`,
      );
      return;
    }

    await appSettingsCollection.insertOne({
      key: AI_PREVIEW_STAGING_DURATION_SETTING.key,
      label: AI_PREVIEW_STAGING_DURATION_SETTING.label,
      value: AI_PREVIEW_STAGING_DURATION_SETTING.value,
      valueType: AI_PREVIEW_STAGING_DURATION_SETTING.valueType,
      description: AI_PREVIEW_STAGING_DURATION_SETTING.description,
      isActive: AI_PREVIEW_STAGING_DURATION_SETTING.isActive,
      audit: {
        createdAt: new Date(),
      },
      deletedAt: null,
      deletedBy: null,
    });

    console.log(
      `✅ Migration ${this.version} (${this.name}) created ${AI_PREVIEW_STAGING_DURATION_SETTING.key}`,
    );
  }

  async down(): Promise<void> {
    if (!this.connection?.db) {
      throw new Error("Database connection not available");
    }

    const appSettingsCollection = this.connection.db.collection("app_settings");
    const result = await appSettingsCollection.deleteOne({
      key: AI_PREVIEW_STAGING_DURATION_SETTING.key,
    });

    console.log(
      `✅ Migration ${this.version} (${this.name}) rolled back - Removed ${result.deletedCount} setting(s)`,
    );
  }
}

registerMigration(Migration005_SeedAiPreviewStagingDurationSetting);
