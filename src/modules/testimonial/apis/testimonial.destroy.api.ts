import { useMutation } from "@vigilio/preact-fetching";
import type { TestimonialDestroyResponseDto } from "../dtos/testimonial.response.dto";

export interface TestimonialDestroyApiError {
	success: false;
	message: string;
}

/**
 * testimonialDestroy - /api/v1/testimonials/:id
 * @method DELETE
 */
export function testimonialDestroyApi() {
	return useMutation<
		TestimonialDestroyResponseDto,
		number,
		TestimonialDestroyApiError
	>("/testimonials", async (url, id) => {
		const response = await fetch(`/api/v1${url}/${id}`, {
			method: "DELETE",
		});
		const result = await response.json();
		if (!response.ok) {
			throw result;
		}
		return result;
	});
}
