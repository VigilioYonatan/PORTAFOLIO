import { z } from "@infrastructure/config/zod-i18n.config";
import { techeableSchema } from "../schemas/techeable.schema";

export const techeableStoreDto = techeableSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	tenant_id: true,
});

export type TecheableStoreDto = z.infer<typeof techeableStoreDto>;
