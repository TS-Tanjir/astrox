import { PaymentMethod } from "@prisma/client";
import { PaymentProvider } from "./types";
import { bkashAdapter } from "./bkash";
import { nagadAdapter } from "./nagad";
import { sslcommerzAdapter, stripeAdapter, codAdapter } from "./cardAndCod";

export * from "./types";
export { bkashAdapter, nagadAdapter, sslcommerzAdapter, stripeAdapter, codAdapter };

export function getPaymentAdapter(method: PaymentMethod): PaymentProvider {
  switch (method) {
    case PaymentMethod.BKASH:
      return bkashAdapter;
    case PaymentMethod.NAGAD:
      return nagadAdapter;
    case PaymentMethod.SSLCOMMERZ:
      return sslcommerzAdapter;
    case PaymentMethod.STRIPE:
      return stripeAdapter;
    case PaymentMethod.COD:
    default:
      return codAdapter;
  }
}
