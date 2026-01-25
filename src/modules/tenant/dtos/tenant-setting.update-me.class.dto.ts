import { createZodDto } from "nestjs-zod";
import { tenantSettingUpdateMeDto } from "./tenant-setting.update-me.dto";

export class TenantSettingUpdateMeClassDto extends createZodDto(
	tenantSettingUpdateMeDto,
) {}
