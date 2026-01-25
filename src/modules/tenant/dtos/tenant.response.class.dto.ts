import { createZodDto } from "nestjs-zod";
import {
	tenantDestroyResponseDto,
	tenantIndexResponseDto,
	tenantListResponseDto,
	tenantResponseDto,
	tenantSettingResponseDto,
	tenantShowResponseDto,
	tenantStoreResponseDto,
	tenantUpdateMeResponseDto,
	tenantUpdateResponseDto,
} from "./tenant.response.dto";

export class TenantIndexResponseClassDto extends createZodDto(
	tenantIndexResponseDto,
) {}

export class TenantListResponseClassDto extends createZodDto(
	tenantListResponseDto,
) {}

export class TenantShowResponseClassDto extends createZodDto(
	tenantShowResponseDto,
) {}

export class TenantStoreResponseClassDto extends createZodDto(
	tenantStoreResponseDto,
) {}

export class TenantUpdateResponseClassDto extends createZodDto(
	tenantUpdateResponseDto,
) {}

export class TenantUpdateMeResponseClassDto extends createZodDto(
	tenantUpdateMeResponseDto,
) {}

export class TenantDestroyResponseClassDto extends createZodDto(
	tenantDestroyResponseDto,
) {}

export class TenantSettingResponseClassDto extends createZodDto(
	tenantSettingResponseDto,
) {}

// Generic
export class TenantResponseClassDto extends createZodDto(tenantResponseDto) {}
