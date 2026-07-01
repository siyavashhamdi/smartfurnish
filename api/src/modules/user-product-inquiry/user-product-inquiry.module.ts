import { Module } from "@nestjs/common";

import { AppSettingsModule } from "../app-settings";
import { BadgeModule } from "../badge";
import { DatabaseModule } from "../database";
import { FileModule } from "../file";
import { ProductModule } from "../product";
import { ProductAiPreviewModule } from "../product-ai-preview";
import { UserModule } from "../user";
import {
  UserProductInquiryPreviewSubmitMutation,
  UserProductInquiryContactSubmitMutation,
  UserProductInquiryClaimMutation,
  UserProductInquiryStatusUpdateMutation,
  UserProductInquiryUpdateMutation,
} from "./graphql/mutations";
import {
  UserProductInquiryDetailQuery,
  UserProductInquiryListQuery,
} from "./graphql/queries";
import { UserProductInquiryService } from "./user-product-inquiry.service";

@Module({
  imports: [
    DatabaseModule,
    BadgeModule,
    AppSettingsModule,
    UserModule,
    ProductModule,
    ProductAiPreviewModule,
    FileModule,
  ],
  providers: [
    UserProductInquiryService,
    UserProductInquiryPreviewSubmitMutation,
    UserProductInquiryContactSubmitMutation,
    UserProductInquiryClaimMutation,
    UserProductInquiryStatusUpdateMutation,
    UserProductInquiryUpdateMutation,
    UserProductInquiryListQuery,
    UserProductInquiryDetailQuery,
  ],
  exports: [UserProductInquiryService],
})
export class UserProductInquiryModule {}
