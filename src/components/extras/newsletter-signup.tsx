import Button from "@components/extras/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignal } from "@preact/signals";
import Form from "@src/components/form";
import {
	type NewsletterSignupSchema,
	newsletterSignupSchema,
} from "@src/modules/contact/schemas/newsletter.schema";
import { sweetModal } from "@vigilio/sweet";
import { useForm } from "react-hook-form";

export default function NewsletterSignup() {
	const isLoading = useSignal(false);
	const form = useForm<NewsletterSignupSchema>({
		resolver: zodResolver(newsletterSignupSchema),
	});

	async function handleSubmit(data: NewsletterSignupSchema) {
		isLoading.value = true;
		// Simulated API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		sweetModal({
			icon: "success",
			title: "¡Suscrito!",
			text: "Gracias por suscribirte a nuestro boletín.",
		});

		form.reset();
		isLoading.value = false;
	}

	return (
		<Form {...form} onSubmit={handleSubmit} className="space-y-3">
			<div className="relative">
				<Form.control
					name="email"
					title=""
					type="email"
					placeholder="Tu email..."
					required
					className="w-full bg-background rounded-lg border border-input px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/50"
				/>
			</div>
			<Button
				type="submit"
				variant="primary"
				fullWidth
				disabled={isLoading.value}
				className="justify-center font-bold uppercase tracking-widest text-[10px] py-3"
			>
				{isLoading.value ? "Cargando..." : "Suscribirse"}
			</Button>
		</Form>
	);
}
