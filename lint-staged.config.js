module.exports = {
	"*.{ts,tsx}": ["pnpm exec biome check --write"],
	"*.json": ["pnpm exec biome format --write"],
};
