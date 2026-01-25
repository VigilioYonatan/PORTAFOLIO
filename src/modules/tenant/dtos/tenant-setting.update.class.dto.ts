import { createZodDto } from "nestjs-zod";
import { tenantSettingUpdateDto } from "./tenant-setting.update.dto";

export class TenantSettingUpdateClassDto extends createZodDto(
	tenantSettingUpdateDto,
) {}
