import { createZodDto } from "nestjs-zod";
import { tenantStoreDto } from "./tenant.store.dto";

export class TenantStoreClassDto extends createZodDto(tenantStoreDto) {}
