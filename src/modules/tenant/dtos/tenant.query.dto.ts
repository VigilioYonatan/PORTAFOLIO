import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";
import { tenantSchema } from "../schemas/tenant.schema";

export const tenantQueryDto = tenantSchema.pick({}).extend(querySchema.shape);

export type TenantQueryDto = z.infer<typeof tenantQueryDto>;
