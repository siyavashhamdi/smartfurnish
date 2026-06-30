import { Module } from "@nestjs/common";

import { AppSettingsModule } from "../app-settings";
import { BadgeModule } from "../badge";
import { DatabaseModule } from "../database";
import { FileModule } from "../file";
import { CouponModule } from "../coupon";
import { NotificationModule } from "../notification";
import { PushNotificationModule } from "../push-notification";
import { UserModule } from "../user";
import { ZarinPalProxyModule } from "../zarinpal-proxy";
import { GatewayPaymentExpiryCron } from "../../cron/jobs";
import { ProductPaymentController } from "./api/product-payment.controller";
import { GatewayPaymentExpiryService } from "./gateway-payment-expiry.service";
import { ProductService } from "./product.service";
import {
  ProductCreateMutation,
  ProductDeleteMutation,
  ProductPaymentManualCreateMutation,
  ProductPaymentStatusUpdateMutation,
  ProductPurchaseSubmitMutation,
  ProductUpdateMutation,
} from "./graphql/mutations";
import {
  ProductDeleteDependenciesQuery,
  ProductDetailQuery,
  ProductListQuery,
  ProductPaymentDetailQuery,
  ProductPaymentListQuery,
  UserProductDetailQuery,
  UserProductListQuery,
} from "./graphql/queries";

@Module({
  imports: [
    AppSettingsModule,
    BadgeModule,
    DatabaseModule,
    FileModule,
    CouponModule,
    NotificationModule,
    PushNotificationModule,
    UserModule,
    ZarinPalProxyModule,
  ],
  controllers: [ProductPaymentController],
  providers: [
    GatewayPaymentExpiryCron,
    GatewayPaymentExpiryService,
    ProductService,
    ProductCreateMutation,
    ProductDeleteMutation,
    ProductPaymentManualCreateMutation,
    ProductPaymentStatusUpdateMutation,
    ProductPurchaseSubmitMutation,
    ProductUpdateMutation,
    ProductDeleteDependenciesQuery,
    ProductDetailQuery,
    ProductListQuery,
    ProductPaymentDetailQuery,
    ProductPaymentListQuery,
    UserProductDetailQuery,
    UserProductListQuery,
  ],
  exports: [ProductService],
})
export class ProductModule {}
