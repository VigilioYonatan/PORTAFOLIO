// Icon sizing utility for consistent icon dimensions
export const sizeIcon = {
	xs: { width: 12, height: 12 },
	small: { width: 16, height: 16 },
	medium: { width: 20, height: 20 },
	large: { width: 24, height: 24 },
	xlarge: { width: 32, height: 32 },
	xxlarge: { width: 40, height: 40 },
	xxxlarge: { width: 48, height: 48 },
} as const;

export type IconSize = keyof typeof sizeIcon;
