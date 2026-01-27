import { z } from "@infrastructure/config/zod-i18n.config";
import { querySchema } from "@infrastructure/schemas/query.schema";

export const tenantQueryDto = querySchema;

export type TenantQueryDto = z.infer<typeof tenantQueryDto>;
