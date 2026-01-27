import { customType } from "drizzle-orm/pg-core";

export const decimalCustom = (
	nameOrPrecision?: string | number,
	precisionArg = 10,
	scaleArg = 2,
) => {
	const name = typeof nameOrPrecision === "string" ? nameOrPrecision : "";
	const precision =
		typeof nameOrPrecision === "number" ? nameOrPrecision : precisionArg;
	const scale =
		typeof nameOrPrecision === "string" ? scaleArg : (precisionArg ?? 2);

	return customType<{ data: number; driverData: string }>({
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
};
