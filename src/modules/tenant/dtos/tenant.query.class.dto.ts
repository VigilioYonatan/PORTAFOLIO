import { createZodDto } from "nestjs-zod";
import { tenantQueryDto } from "./tenant.query.dto";

export class TenantQueryClassDto extends createZodDto(tenantQueryDto) {}
