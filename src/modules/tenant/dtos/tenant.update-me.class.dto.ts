import { createZodDto } from "nestjs-zod";
import { tenantUpdateMeDto } from "./tenant.update-me.dto";

export class TenantUpdateMeClassDto extends createZodDto(tenantUpdateMeDto) {}
