import type { TenantSchema } from "@modules/tenant/schemas/tenant.schema";
import { signal } from "@preact/signals";

const tenant = signal<TenantSchema | null>(
	typeof window !== "undefined" ? window.locals.tenant : null,
);

export function useTenantStore() {
	function onTenantUpdate(new_tenant: Partial<TenantSchema>) {
		if (tenant.value) {
			tenant.value = { ...tenant.value, ...new_tenant };
		}
	}

	return {
		state: tenant.value,
		methods: {
			onTenantUpdate,
		},
	};
}
