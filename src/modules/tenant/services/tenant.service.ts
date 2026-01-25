import dayjs, { slugify } from "@infrastructure/utils/hybrid";
import {
	type PaginatorResult,
	paginator,
} from "@infrastructure/utils/server/helpers";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { TenantCache } from "../caches/tenant.cache";
import type { TenantQueryDto } from "../dtos/tenant.query.dto";
import type {
	TenantDestroyResponseDto,
	TenantIndexResponseDto,
	TenantSettingResponseDto,
	TenantShowResponseDto,
	TenantStoreResponseDto,
	TenantUpdateMeResponseDto,
	TenantUpdateResponseDto,
} from "../dtos/tenant.response.dto";
import type { TenantStoreDto } from "../dtos/tenant.store.dto";
import type { TenantUpdateDto } from "../dtos/tenant.update.dto";
import type { TenantUpdateMeDto } from "../dtos/tenant.update-me.dto";
import type { TenantSettingUpdateDto } from "../dtos/tenant-setting.update.dto";
import type { TenantSettingUpdateMeDto } from "../dtos/tenant-setting.update-me.dto";
import { TenantRepository } from "../repositories/tenant.repository";
import type { TenantSchema, TenantShowSchema } from "../schemas/tenant.schema";
import type { TenantSettingSchema } from "../schemas/tenant-setting.schema";

@Injectable()
export class TenantService {
	private readonly logger = new Logger(TenantService.name);

	constructor(
		private readonly tenantRepository: TenantRepository,
		private readonly tenantCache: TenantCache,
	) {}

	async index(query: TenantQueryDto): Promise<TenantIndexResponseDto> {
		this.logger.log("Listing tenants");
		return await paginator<TenantQueryDto, TenantSchema>("/tenants", {
			filters: query,
			cb: async (filters, isClean) => {
				if (isClean) {
					const cached = await this.tenantCache.getList(filters);
					if (cached) return cached;
				}

				const [data, count] = await this.tenantRepository.index(filters);

				if (isClean) {
					await this.tenantCache.setList(filters, [data, count]);
				}

				return [data, count];
			},
		});
	}

	async show(id: number): Promise<TenantShowResponseDto> {
		this.logger.log({ id }, "Fetching tenant by ID");
		// 1. Try Cache
		let tenant = await this.tenantCache.get(id);

		if (!tenant) {
			// 2. Try DB
			tenant = await this.tenantRepository.showById(id);

			if (!tenant) {
				this.logger.warn({ id }, "Tenant not found");
				throw new NotFoundException(`Tenant #${id} not found`);
			}

			// 3. Set Cache
			await this.tenantCache.set(tenant);
		}

		return { success: true, tenant };
	}

	async showByHost(host: string): Promise<TenantShowSchema> {
		this.logger.log({ host }, "Fetching tenant by host");
		// 1. Try Cache
		let tenant = await this.tenantCache.getByHost(host);

		if (!tenant) {
			// 2. Try DB
			tenant = await this.tenantRepository.showByHost(host);

			if (!tenant) {
				this.logger.warn({ host }, "Tenant not found");
				throw new NotFoundException(`Tenant not found for host: ${host}`);
			}

			// 3. Set Cache
			await this.tenantCache.setByHost(host, tenant);
		}

		return tenant;
	}

	async store(body: TenantStoreDto): Promise<TenantStoreResponseDto> {
		this.logger.log({ name: body.name }, "Creating new tenant");
		const tenant = await this.tenantRepository.store({
			...body,
			slug: slugify(body.name),
		});

		// Cache Write-Through
		const fullTenant = await this.tenantRepository.showById(tenant.id);
		if (fullTenant) {
			await this.tenantCache.set(fullTenant);
		}
		// Invalidate lists
		await this.tenantCache.invalidateLists();

		if (!fullTenant) throw new BadRequestException("Error creating tenant");

		return { success: true, tenant: fullTenant };
	}

	async update(
		id: number,
		body: TenantUpdateDto,
	): Promise<TenantUpdateResponseDto> {
		this.logger.log({ id }, "Updating tenant");
		const tenant = await this.tenantRepository.update(id, body);

		// Invalidate single + lists
		await this.tenantCache.invalidate(id);
		await this.tenantCache.invalidateLists();

		const fullTenant = await this.tenantRepository.showById(id);
		if (!fullTenant)
			throw new NotFoundException("Tenant not found after update");

		return { success: true, tenant: fullTenant };
	}

	async updateMe(
		tenant_id: number,
		body: TenantUpdateMeDto,
	): Promise<TenantUpdateMeResponseDto> {
		this.logger.log({ tenant_id }, "Updating own tenant");
		const tenant = await this.tenantRepository.update(tenant_id, body);

		// Invalidate single + lists
		await this.tenantCache.invalidate(tenant_id);
		await this.tenantCache.invalidateLists();

		const fullTenant = await this.tenantRepository.showById(tenant_id);
		if (!fullTenant)
			throw new NotFoundException("Tenant not found after update");

		return { success: true, tenant: fullTenant };
	}

	async destroy(id: number): Promise<{ success: true; message: string }> {
		this.logger.log({ id }, "Deleting tenant");

		// 2. Perform deletion
		await this.tenantRepository.destroy(id);

		// 3. Invalidate cache
		await this.tenantCache.invalidate(id);
		await this.tenantCache.invalidateLists();

		return { success: true as const, message: "Tenant eliminado exitosamente" };
	}

	async showSettings(tenant_id: number): Promise<TenantSettingResponseDto> {
		this.logger.log({ tenant_id }, "Fetching tenant settings");

		// 1. Try Cache
		let tenant = await this.tenantCache.get(tenant_id);

		if (!tenant) {
			// 2. Try DB (Fetch full tenant to warm up cache)
			tenant = await this.tenantRepository.showById(tenant_id);

			if (!tenant) {
				this.logger.warn({ tenant_id }, "Tenant not found for settings");
				throw new NotFoundException(
					`Settings for tenant #${tenant_id} not found`,
				);
			}
			// 3. Set Cache
			await this.tenantCache.set(tenant);
		}

		return { success: true, setting: tenant.setting };
	}

	async updateSetting(
		tenant_id: number,
		body: TenantSettingUpdateDto,
	): Promise<TenantSettingResponseDto> {
		this.logger.log({ tenant_id }, "Updating tenant settings");
		const setting = await this.tenantRepository.updateSetting(tenant_id, body);
		await this.tenantCache.invalidate(tenant_id);
		return { success: true, setting };
	}

	async updateSettingMe(
		tenant_id: number,
		body: TenantSettingUpdateMeDto,
	): Promise<TenantSettingResponseDto> {
		this.logger.log({ tenant_id }, "Updating own tenant settings");
		const setting = await this.tenantRepository.updateSetting(tenant_id, body);
		await this.tenantCache.invalidate(tenant_id);
		return { success: true, setting };
	}
}
