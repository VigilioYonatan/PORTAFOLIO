import { customType } from "drizzle-orm/pg-core";

export const decimalCustom = (name: string, precision = 10, scale = 2) =>
	customType<{ data: number; driverData: string }>({
		dataType() {
			return `numeric(${precision}, ${scale})`;
		},
		fromDriver(value: string): number {
			return Number(value);
		},
		toDriver(value: number): string {
			return value.toFixed(scale);
		},
	})(name);
