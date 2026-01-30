import { z } from "@infrastructure/config/zod-i18n.config";
import { blogPostSchema } from "@modules/blog-post/schemas/blog-post.schema";
import { musicTrackSchema } from "@modules/music/schemas/music.schema";
import { openSourceSchema } from "@modules/open-source/schemas/open-source.schema";
import { projectSchema } from "@modules/project/schemas/project.schema";
import { techeableSchema } from "@modules/techeable/schemas/techeable.schema";
import { technologySchema } from "@modules/technology/schemas/technology.schema";
import { workExperienceSchema } from "@modules/work-experience/schemas/work-experience.schema";

const projectWithTecheables = projectSchema.extend({
	techeables: z.array(techeableSchema.extend({ technology: technologySchema })),
});

export const webIndexResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	musicTracks: z.array(musicTrackSchema),
	experiences: z.array(workExperienceSchema),
	latestProjects: z.array(projectSchema),
	latestOpenSources: z.array(openSourceSchema),
	socials: z
		.object({
			linkedin: z.url().nullable(),
			github: z.url().nullable(),
			twitter: z.url().nullable(),
			youtube: z.url().nullable(),
			whatsapp: z.string().nullable(),
		})
		.nullable(),
	latestPosts: z.array(blogPostSchema),
	liveVisitors: z.number(),
});
export type WebIndexResponseDto = z.infer<typeof webIndexResponseDto>;

export const webPageResponseDto = z.object({
	title: z.string(),
	description: z.string(),
});
export type WebPageResponseDto = z.infer<typeof webPageResponseDto>;

export const webAboutResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	technologies: z.array(technologySchema),
});
export type WebAboutResponseDto = z.infer<typeof webAboutResponseDto>;

export const webContactResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	email: z.string(),
	phone: z.string(),
});
export type WebContactResponseDto = z.infer<typeof webContactResponseDto>;

export const webBlogResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	posts: z.array(blogPostSchema),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
});
export type WebBlogResponseDto = z.infer<typeof webBlogResponseDto>;

export const webBlogSlugResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	post: blogPostSchema,
	translations: z.record(z.string(), z.string()).optional(),
});
export type WebBlogSlugResponseDto = z.infer<typeof webBlogSlugResponseDto>;

export const webProjectSlugResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	project: projectWithTecheables,
	translations: z.record(z.string(), z.string()).optional(),
});
export type WebProjectSlugResponseDto = z.infer<
	typeof webProjectSlugResponseDto
>;

export const webProjectsResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	projects: z.array(projectWithTecheables),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
});
export type WebProjectsResponseDto = z.infer<typeof webProjectsResponseDto>;

export const webExperienceResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	experiences: z.array(workExperienceSchema),
});
export type WebExperienceResponseDto = z.infer<typeof webExperienceResponseDto>;

export const webOpenSourceResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	open_sources: z.array(openSourceSchema),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
});
export type WebOpenSourceResponseDto = z.infer<typeof webOpenSourceResponseDto>;

export const webOpenSourceSlugResponseDto = z.object({
	title: z.string(),
	description: z.string(),
	open_source: openSourceSchema,
	translations: z.record(z.string(), z.string()).optional(),
});
export type WebOpenSourceSlugResponseDto = z.infer<
	typeof webOpenSourceSlugResponseDto
>;
