import i18next from "i18next";
import { z } from "zod";

// Initialize  with Spanish translations for Zod
i18next.init({
	lng: "es",
});

z.config(z.locales.es());

export { z, i18next };
