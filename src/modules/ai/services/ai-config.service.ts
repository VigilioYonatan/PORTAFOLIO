import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type {
	AiConfigShowResponseDto,
	AiConfigUpdateResponseDto,
} from "../dtos/ai.response.dto";
import type { AiConfigUpdateDto } from "../dtos/ai-config.update.dto";
import { AiConfigRepository } from "../repositories/ai-config.repository";
import type { AiConfigSchema } from "../schemas/ai-config.schema";

@Injectable()
export class AiConfigService {
	private readonly logger = new Logger(AiConfigService.name);

	constructor(private readonly aiConfigRepository: AiConfigRepository) {}

	async show(tenant_id: number): Promise<AiConfigShowResponseDto> {
		const config = await this.aiConfigRepository.show(tenant_id);
		return { success: true, config: config || null };
	}

	async update(
		tenant_id: number,
		body: AiConfigUpdateDto,
	): Promise<AiConfigUpdateResponseDto> {
		this.logger.log({ tenant_id }, "Updating AI Config");
		const existing = await this.aiConfigRepository.show(tenant_id);
		let config: AiConfigSchema;

		if (!existing) {
			config = await this.aiConfigRepository.store(tenant_id, body);
		} else {
			config = await this.aiConfigRepository.update(
				tenant_id,
				existing.id,
				body,
			);
		}
		return { success: true, config };
	}
}
