import type { DocumentStoreDto } from "../dtos/document.store.dto";

/**
 * Factory for generating test document data
 */
export class DocumentFactory {
	/**
	 * Creates a valid DocumentStoreDto for testing
	 */
	static createDto(overrides?: Partial<DocumentStoreDto>): DocumentStoreDto {
		return {
			title: `Test Document ${Date.now()}`,
			file: [
				{
					key: `documents/test-${Date.now()}.pdf`,
					name: `test-${Date.now()}.pdf`,
					original_name: "test-document.pdf",
					size: 1024 * 50, // 50KB
					mimetype: "application/pdf",
				},
			],
			metadata: {
				author: "Test Author",
				pages: "10",
				language: "ES",
			},
			...overrides,
		};
	}

	/**
	 * Creates a DTO with null metadata
	 */
	static createDtoWithNullMetadata(
		overrides?: Partial<DocumentStoreDto>,
	): DocumentStoreDto {
		return {
			title: `Test Document ${Date.now()}`,
			file: [
				{
					key: `documents/test-${Date.now()}.pdf`,
					name: `test-${Date.now()}.pdf`,
					original_name: "test-document.pdf",
					size: 1024 * 100,
					mimetype: "application/pdf",
				},
			],
			metadata: null,
			...overrides,
		};
	}
}
