import { createZodDto } from "nestjs-zod";
import {
	blogCategoryDestroyResponseDto,
	blogCategoryIndexResponseDto,
	blogCategoryShowResponseDto,
	blogCategoryStoreResponseDto,
	blogCategoryUpdateResponseDto,
} from "./blog-category.response.dto";

export class BlogCategoryIndexResponseClassDto extends createZodDto(
	blogCategoryIndexResponseDto,
) {}
export class BlogCategoryShowResponseClassDto extends createZodDto(
	blogCategoryShowResponseDto,
) {}
export class BlogCategoryStoreResponseClassDto extends createZodDto(
	blogCategoryStoreResponseDto,
) {}
export class BlogCategoryUpdateResponseClassDto extends createZodDto(
	blogCategoryUpdateResponseDto,
) {}
export class BlogCategoryDestroyResponseClassDto extends createZodDto(
	blogCategoryDestroyResponseDto,
) {}
