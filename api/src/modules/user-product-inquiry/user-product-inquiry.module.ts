import { Module } from "@nestjs/common";

import { AppSettingsModule } from "../app-settings";
import { DatabaseModule } from "../database";
import { ProductModule } from "../product";
import { ProductAiPreviewModule } from "../product-ai-preview";
import { UserModule } from "../user";
import {
  UserProductInquiryPreviewSubmitMutation,
  UserProductInquiryContactSubmitMutation,
} from "./graphql/mutations";
import { UserProductInquiryListQuery } from "./graphql/queries";
import { UserProductInquiryService } from "./user-product-inquiry.service";

@Module({
  imports: [
    DatabaseModule,
    AppSettingsModule,
    UserModule,
    ProductModule,
    ProductAiPreviewModule,
  ],
  providers: [
    UserProductInquiryService,
    UserProductInquiryPreviewSubmitMutation,
    UserProductInquiryContactSubmitMutation,
    UserProductInquiryListQuery,
  ],
  exports: [UserProductInquiryService],
})
export class UserProductInquiryModule {}
