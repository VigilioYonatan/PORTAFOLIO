import { customType } from "drizzle-orm/pg-core";

export const decimalCustom = customType<{ data: number; driverData: string }>({
	dataType() {
		return "numeric(10, 2)"; // Tipo real en la base de datos
	},
	fromDriver(value: string) {
		return Number(value); // Cuando haces SELECT: String -> Number
	},
	toDriver(value: number) {
		return value.toString(); // Cuando haces INSERT: Number -> String
	},
});
