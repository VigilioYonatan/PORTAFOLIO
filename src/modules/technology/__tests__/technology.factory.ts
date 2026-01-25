import { UPLOAD_CONFIG } from "@modules/uploads/const/upload.const";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";
import type { TechnologyStoreDto } from "../dtos/technology.store.dto";
import type { TechnologySchema } from "../schemas/technology.schema";

/**
 * Factory for generating unique Technology test data
 */
export class TechnologyFactory {
	private static counter = 0;

	private static getUniqueId(): string {
		TechnologyFactory.counter++;
		return `${Date.now()}-${TechnologyFactory.counter}`;
	}

	static createStoreDto(
		overrides: Partial<TechnologyStoreDto> = {},
	): TechnologyStoreDto {
		const uniqueId = TechnologyFactory.getUniqueId();
		return {
			name: `Tech_${uniqueId}`,
			category: "FRONTEND",
			icon: [],
			...overrides,
		};
	}

	static createDtoWithIcon(
		overrides: Partial<TechnologyStoreDto> = {},
	): TechnologyStoreDto {
		const uniqueId = TechnologyFactory.getUniqueId();
		return {
			name: `Tech_Icon_${uniqueId}`,
			category: "FRONTEND",
			icon: [
				{
					key: `technologies/icons/${uniqueId}.png`,
					name: "icon.png",
					original_name: "icon.png",
					mimetype: "image/png",
					size: 1024,
					dimension: UPLOAD_CONFIG.technology.icon?.dimensions?.[0],
				},
			],
			...overrides,
		};
	}

	static createSchema(overrides: Partial<TechnologySchema>): TechnologySchema {
		return {
			id: Math.floor(Math.random() * 10000) + 1,
			tenant_id: 1,
			name: `Tech_${TechnologyFactory.getUniqueId()}`,
			category: "FRONTEND",
			icon: [],
			created_at: new Date(),
			updated_at: new Date(),
			...overrides,
		};
	}
}
