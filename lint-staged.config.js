export default {
	"*.{ts,tsx}": ["pnpm exec biome check --write"],
	"*.json": ["pnpm exec biome format --write"],
};
