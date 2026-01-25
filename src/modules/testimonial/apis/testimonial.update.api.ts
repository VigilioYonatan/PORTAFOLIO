import { useMutation } from "@vigilio/preact-fetching";
import type { TestimonialUpdateResponseDto } from "../dtos/testimonial.response.dto";
import type { TestimonialUpdateDto } from "../dtos/testimonial.update.dto";

export interface TestimonialUpdateApiError {
	success: false;
	message: string;
	body: keyof TestimonialUpdateDto;
}

/**
 * testimonialUpdate - /api/v1/testimonials/:id
 * @method PATCH
 * @body TestimonialUpdateDto
 */
export function testimonialUpdateApi(id: number) {
	return useMutation<
		TestimonialUpdateResponseDto,
		TestimonialUpdateDto,
		TestimonialUpdateApiError
	>(`/testimonials/${id}`, async (url, body) => {
		const response = await fetch(`/api/v1${url}`, {
			method: "PATCH",
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
