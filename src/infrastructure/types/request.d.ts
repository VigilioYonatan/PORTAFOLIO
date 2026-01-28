import type { TenantShowSchema } from "@modules/tenant/schemas/tenant.schema";
import type { UserAuth } from "@modules/user/schemas/user.schema";

import type { Language } from "./i18n";

// No BORRAR
export interface Global {
	user: UserAuth;
	tenant: TenantShowSchema;
	language: Language;
}
declare global {
	namespace Express {
		interface Request {
			locals: Global & {
				props?: Record<string, unknown>;
			};
		}
	}
}
