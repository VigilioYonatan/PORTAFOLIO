import { z } from "@infrastructure/config/zod-i18n.config";

export const authMfaSetupDto = z.object({});
export type AuthMfaSetupDto = z.infer<typeof authMfaSetupDto>;
