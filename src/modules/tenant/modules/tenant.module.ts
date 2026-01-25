import { Global, Module } from "@nestjs/common";
import { TenantCache } from "../caches/tenant.cache";
import { TenantController } from "../controllers/tenant.controller";
import { TenantSettingController } from "../controllers/tenant-setting.controller";
import { TenantRepository } from "../repositories/tenant.repository";
import { TenantSeeder } from "../seeders/tenant.seeder";
import { TenantService } from "../services/tenant.service";

@Global()
@Module({
	controllers: [TenantController, TenantSettingController],
	providers: [TenantRepository, TenantService, TenantSeeder, TenantCache],
	exports: [TenantRepository, TenantService, TenantSeeder, TenantCache],
})
export class TenantModule {}
