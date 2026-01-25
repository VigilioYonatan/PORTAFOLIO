import { createPaginatorSchema } from "@infrastructure/schemas/paginator.schema";
import { z } from "zod";
import { tenantSchema } from "../schemas/tenant.schema";

export const tenantListResponseDto = createPaginatorSchema(tenantSchema);

export type TenantListResponseApi = z.infer<typeof tenantListResponseDto>;
