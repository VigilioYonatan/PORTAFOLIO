import type { TenantShowSchema } from "@modules/tenant/schemas/tenant.schema";
import type { UserAuth } from "@modules/user/schemas/user.schema";

// No BORRAR
export interface Global {
	user: UserAuth;
	tenant: TenantShowSchema;
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
