import { useMutation } from "@vigilio/preact-fetching";
import type { TestimonialStoreResponseDto } from "../dtos/testimonial.response.dto";
import type { TestimonialStoreDto } from "../dtos/testimonial.store.dto";

export interface TestimonialStoreApiError {
	success: false;
	message: string;
	body: keyof TestimonialStoreDto;
}

/**
 * testimonialStore - /api/v1/testimonials
 * @method POST
 * @body TestimonialStoreDto
 */
export function testimonialStoreApi() {
	return useMutation<
		TestimonialStoreResponseDto,
		TestimonialStoreDto,
		TestimonialStoreApiError
	>("/testimonial", async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
