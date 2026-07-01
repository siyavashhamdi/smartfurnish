import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { AuthenticatedRoles, GqlAuthGuard, RolesGuard } from "../../../auth";
import { AppSettingsService } from "../../app-settings.service";
import { PaymentCheckoutConfigGqlResponse } from "../responses";

@Resolver(() => PaymentCheckoutConfigGqlResponse)
@UseGuards(GqlAuthGuard, RolesGuard)
@AuthenticatedRoles()
export class PaymentCheckoutConfigQuery {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Query(() => PaymentCheckoutConfigGqlResponse, {
    name: "paymentCheckoutConfig",
    description: "Get payment checkout settings for product purchases",
  })
  async getPaymentCheckoutConfig(): Promise<PaymentCheckoutConfigGqlResponse> {
    return this.appSettingsService.getPaymentCheckoutConfig();
  }
}
