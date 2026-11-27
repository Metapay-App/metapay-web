import { Container, InjectionToken, type Token } from "@needle-di/core";

import { AdminRemoteDataSource } from "@/client/data/admin/data_source/admin_remote_data_source";
import { AdminRepositoryImpl } from "@/client/data/admin/repository/admin_repository_impl";
import { Http402RemoteDataSource } from "@/client/data/http402/data_source/http402_remote_data_source";
import { Http402RepositoryImpl } from "@/client/data/http402/repository/http402_repository_impl";
import { IdentityRemoteDataSource } from "@/client/data/identity/data_source/identity_remote_data_source";
import { IdentityRepositoryImpl } from "@/client/data/identity/repository/identity_repository_impl";
import { InvoiceRemoteDataSource } from "@/client/data/invoice/data_source/invoice_remote_data_source";
import { InvoiceRepositoryImpl } from "@/client/data/invoice/repository/invoice_repository_impl";
import { MerchantRemoteDataSource } from "@/client/data/merchant/data_source/merchant_remote_data_source";
import { MerchantRepositoryImpl } from "@/client/data/merchant/repository/merchant_repository_impl";
import { PaymentRemoteDataSource } from "@/client/data/payment/data_source/payment_remote_data_source";
import { PaymentRepositoryImpl } from "@/client/data/payment/repository/payment_repository_impl";

import type { AdminRepository } from "@/client/domain/admin/repository/admin_repository";
import { GetAdminOverviewUseCase } from "@/client/domain/admin/usecase/get_admin_overview_usecase";
import type { Http402Repository } from "@/client/domain/http402/repository/http402_repository";
import { RequestHttp402DemoUseCase } from "@/client/domain/http402/usecase/request_http402_demo_usecase";
import type { IdentityRepository } from "@/client/domain/identity/repository/identity_repository";
import { GetMeIdentityUseCase } from "@/client/domain/identity/usecase/get_me_identity_usecase";
import type { InvoiceRepository } from "@/client/domain/invoice/repository/invoice_repository";
import {
  CancelInvoiceUseCase,
  CreateInvoiceUseCase,
  GetInvoiceByRefIdUseCase,
  ListInvoicesUseCase,
} from "@/client/domain/invoice/usecase/invoice_usecases";
import type { MerchantRepository } from "@/client/domain/merchant/repository/merchant_repository";
import {
  GetMerchantByApiKeyUseCase,
  GetMerchantByWalletUseCase,
  RegisterMerchantUseCase,
} from "@/client/domain/merchant/usecase/merchant_usecases";
import type { PaymentRepository } from "@/client/domain/payment/repository/payment_repository";
import {
  GetTxHistoryUseCase,
  VerifyPaymentUseCase,
} from "@/client/domain/payment/usecase/payment_usecases";

export const MERCHANT_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<MerchantRemoteDataSource>(
    "MerchantRemoteDataSource"
  ),
  Repository: new InjectionToken<MerchantRepository>("MerchantRepository"),
  RegisterMerchantUseCase: new InjectionToken<RegisterMerchantUseCase>(
    "RegisterMerchantUseCase"
  ),
  GetMerchantByWalletUseCase: new InjectionToken<GetMerchantByWalletUseCase>(
    "GetMerchantByWalletUseCase"
  ),
  GetMerchantByApiKeyUseCase: new InjectionToken<GetMerchantByApiKeyUseCase>(
    "GetMerchantByApiKeyUseCase"
  ),
} as const;

export const INVOICE_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<InvoiceRemoteDataSource>(
    "InvoiceRemoteDataSource"
  ),
  Repository: new InjectionToken<InvoiceRepository>("InvoiceRepository"),
  CreateInvoiceUseCase: new InjectionToken<CreateInvoiceUseCase>(
    "CreateInvoiceUseCase"
  ),
  ListInvoicesUseCase: new InjectionToken<ListInvoicesUseCase>(
    "ListInvoicesUseCase"
  ),
  GetInvoiceByRefIdUseCase: new InjectionToken<GetInvoiceByRefIdUseCase>(
    "GetInvoiceByRefIdUseCase"
  ),
  CancelInvoiceUseCase: new InjectionToken<CancelInvoiceUseCase>(
    "CancelInvoiceUseCase"
  ),
} as const;

export const PAYMENT_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<PaymentRemoteDataSource>(
    "PaymentRemoteDataSource"
  ),
  Repository: new InjectionToken<PaymentRepository>("PaymentRepository"),
  VerifyPaymentUseCase: new InjectionToken<VerifyPaymentUseCase>(
    "VerifyPaymentUseCase"
  ),
  GetTxHistoryUseCase: new InjectionToken<GetTxHistoryUseCase>(
    "GetTxHistoryUseCase"
  ),
} as const;

export const IDENTITY_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<IdentityRemoteDataSource>(
    "IdentityRemoteDataSource"
  ),
  Repository: new InjectionToken<IdentityRepository>("IdentityRepository"),
  GetMeIdentityUseCase: new InjectionToken<GetMeIdentityUseCase>(
    "GetMeIdentityUseCase"
  ),
} as const;

export const HTTP402_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<Http402RemoteDataSource>(
    "Http402RemoteDataSource"
  ),
  Repository: new InjectionToken<Http402Repository>("Http402Repository"),
  RequestHttp402DemoUseCase: new InjectionToken<RequestHttp402DemoUseCase>(
    "RequestHttp402DemoUseCase"
  ),
} as const;

export const ADMIN_DI_TOKENS = {
  RemoteDataSource: new InjectionToken<AdminRemoteDataSource>(
    "AdminRemoteDataSource"
  ),
  Repository: new InjectionToken<AdminRepository>("AdminRepository"),
  GetAdminOverviewUseCase: new InjectionToken<GetAdminOverviewUseCase>(
    "GetAdminOverviewUseCase"
  ),
} as const;

export const container = new Container();

// Merchant bindings
container.bind({
  provide: MERCHANT_DI_TOKENS.RemoteDataSource,
  useFactory: () => new MerchantRemoteDataSource(),
});
container.bind({
  provide: MERCHANT_DI_TOKENS.Repository,
  useFactory: () =>
    new MerchantRepositoryImpl(container.get(MERCHANT_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: MERCHANT_DI_TOKENS.RegisterMerchantUseCase,
  useFactory: () =>
    new RegisterMerchantUseCase(container.get(MERCHANT_DI_TOKENS.Repository)),
});
container.bind({
  provide: MERCHANT_DI_TOKENS.GetMerchantByWalletUseCase,
  useFactory: () =>
    new GetMerchantByWalletUseCase(container.get(MERCHANT_DI_TOKENS.Repository)),
});
container.bind({
  provide: MERCHANT_DI_TOKENS.GetMerchantByApiKeyUseCase,
  useFactory: () =>
    new GetMerchantByApiKeyUseCase(container.get(MERCHANT_DI_TOKENS.Repository)),
});

// Invoice bindings
container.bind({
  provide: INVOICE_DI_TOKENS.RemoteDataSource,
  useFactory: () => new InvoiceRemoteDataSource(),
});
container.bind({
  provide: INVOICE_DI_TOKENS.Repository,
  useFactory: () =>
    new InvoiceRepositoryImpl(container.get(INVOICE_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: INVOICE_DI_TOKENS.CreateInvoiceUseCase,
  useFactory: () =>
    new CreateInvoiceUseCase(container.get(INVOICE_DI_TOKENS.Repository)),
});
container.bind({
  provide: INVOICE_DI_TOKENS.ListInvoicesUseCase,
  useFactory: () =>
    new ListInvoicesUseCase(container.get(INVOICE_DI_TOKENS.Repository)),
});
container.bind({
  provide: INVOICE_DI_TOKENS.GetInvoiceByRefIdUseCase,
  useFactory: () =>
    new GetInvoiceByRefIdUseCase(container.get(INVOICE_DI_TOKENS.Repository)),
});
container.bind({
  provide: INVOICE_DI_TOKENS.CancelInvoiceUseCase,
  useFactory: () =>
    new CancelInvoiceUseCase(container.get(INVOICE_DI_TOKENS.Repository)),
});

// Payment bindings
container.bind({
  provide: PAYMENT_DI_TOKENS.RemoteDataSource,
  useFactory: () => new PaymentRemoteDataSource(),
});
container.bind({
  provide: PAYMENT_DI_TOKENS.Repository,
  useFactory: () =>
    new PaymentRepositoryImpl(container.get(PAYMENT_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: PAYMENT_DI_TOKENS.VerifyPaymentUseCase,
  useFactory: () =>
    new VerifyPaymentUseCase(container.get(PAYMENT_DI_TOKENS.Repository)),
});
container.bind({
  provide: PAYMENT_DI_TOKENS.GetTxHistoryUseCase,
  useFactory: () =>
    new GetTxHistoryUseCase(container.get(PAYMENT_DI_TOKENS.Repository)),
});

// Identity bindings
container.bind({
  provide: IDENTITY_DI_TOKENS.RemoteDataSource,
  useFactory: () => new IdentityRemoteDataSource(),
});
container.bind({
  provide: IDENTITY_DI_TOKENS.Repository,
  useFactory: () =>
    new IdentityRepositoryImpl(container.get(IDENTITY_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: IDENTITY_DI_TOKENS.GetMeIdentityUseCase,
  useFactory: () =>
    new GetMeIdentityUseCase(container.get(IDENTITY_DI_TOKENS.Repository)),
});

// HTTP 402 bindings
container.bind({
  provide: HTTP402_DI_TOKENS.RemoteDataSource,
  useFactory: () => new Http402RemoteDataSource(),
});
container.bind({
  provide: HTTP402_DI_TOKENS.Repository,
  useFactory: () =>
    new Http402RepositoryImpl(container.get(HTTP402_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: HTTP402_DI_TOKENS.RequestHttp402DemoUseCase,
  useFactory: () =>
    new RequestHttp402DemoUseCase(container.get(HTTP402_DI_TOKENS.Repository)),
});

// Admin bindings
container.bind({
  provide: ADMIN_DI_TOKENS.RemoteDataSource,
  useFactory: () => new AdminRemoteDataSource(),
});
container.bind({
  provide: ADMIN_DI_TOKENS.Repository,
  useFactory: () =>
    new AdminRepositoryImpl(container.get(ADMIN_DI_TOKENS.RemoteDataSource)),
});
container.bind({
  provide: ADMIN_DI_TOKENS.GetAdminOverviewUseCase,
  useFactory: () =>
    new GetAdminOverviewUseCase(container.get(ADMIN_DI_TOKENS.Repository)),
});

export function getService<T>(token: Token<T>): T {
  return container.get(token);
}
