import { createServerFn } from "@tanstack/react-start";
import { calculateServiceability, loadDeliverySettings, type ServiceabilityInput, type ServiceabilityResult } from "./delivery.server";

export type { ServiceabilityResult } from "./delivery.server";

export const getDeliverySettings = createServerFn({ method: "GET" }).handler(async () => {
  return await loadDeliverySettings();
});

export const checkServiceability = createServerFn({ method: "POST" })
  .inputValidator((input: ServiceabilityInput) => input)
  .handler(async ({ data }): Promise<ServiceabilityResult> => {
    return await calculateServiceability(data);
  });
