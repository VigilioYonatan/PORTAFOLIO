import { createZodDto } from "nestjs-zod";
import {
	blogPostDestroyResponseDto,
	blogPostIndexResponseDto,
	blogPostShowResponseDto,
	blogPostStoreResponseDto,
	blogPostUpdateResponseDto,
} from "./blog-post.response.dto";

export class BlogPostIndexResponseClassDto extends createZodDto(
	blogPostIndexResponseDto,
) {}
export class BlogPostShowResponseClassDto extends createZodDto(
	blogPostShowResponseDto,
) {}
export class BlogPostStoreResponseClassDto extends createZodDto(
	blogPostStoreResponseDto,
) {}
export class BlogPostUpdateResponseClassDto extends createZodDto(
	blogPostUpdateResponseDto,
) {}
export class BlogPostDestroyResponseClassDto extends createZodDto(
	blogPostDestroyResponseDto,
) {}
