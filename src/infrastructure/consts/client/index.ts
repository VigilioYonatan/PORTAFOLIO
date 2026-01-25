import environments from "@infrastructure/config/client/environments.config";

export const BASE_URL = (): string => environments.PUBLIC_URL;
