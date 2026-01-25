import { createZodDto } from "nestjs-zod";
import { tenantUpdateDto } from "./tenant.update.dto";

export class TenantUpdateClassDto extends createZodDto(tenantUpdateDto) {}
