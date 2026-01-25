export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		// Tipos permitidos
		"type-enum": [
			2,
			"always",
			[
				"feat", // Nueva funcionalidad
				"fix", // Corrección de bug
				"docs", // Documentación
				"style", // Formato (no afecta lógica)
				"refactor", // Refactorización
				"perf", // Mejora de performance
				"test", // Tests
				"chore", // Tareas de mantenimiento
				"ci", // Cambios en CI/CD
				"build", // Sistema de build
				"revert", // Revertir commit
			],
		],
		// El tipo es obligatorio
		"type-empty": [2, "never"],
		// El subject es obligatorio
		"subject-empty": [2, "never"],
		// Máximo 100 caracteres en el header
		"header-max-length": [2, "always", 100],
	},
};
