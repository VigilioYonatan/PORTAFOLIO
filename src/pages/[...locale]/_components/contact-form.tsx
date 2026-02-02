import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ContactStoreDto } from "@modules/contact/dtos/contact.store.dto";
import { contactStoreDto } from "@modules/contact/dtos/contact.store.dto";
import { contactStoreApi } from "@modules/contact/apis/contact.store.api";
import type { Lang } from "@src/i18n";
import { useTranslations } from "@src/i18n";
import { Mail, Send, User } from "lucide-preact";
import { type Resolver, useForm } from "react-hook-form";
import { sweetModal } from "@vigilio/sweet";

interface ContactFormProps {
	lang?: Lang;
}

export default function ContactForm({ lang = "es" }: ContactFormProps) {
	const t = useTranslations(lang);

	const contactForm = useForm<ContactStoreDto>({
		resolver: zodResolver(contactStoreDto) as Resolver<ContactStoreDto>,
		mode: "all",
		
	});

	const contactStoreMutation = contactStoreApi();

	function onContactSubmit(body: ContactStoreDto) {
		contactStoreMutation.mutate(body, {
			onSuccess: () => {
				sweetModal({
					title: t("contact.form.success"),
					icon: "success",
				});
				contactForm.reset();
			},
			onError: (err) => {
				sweetModal({
					title: t("common.error"),
					text: err.message || JSON.stringify(err),
					icon: "danger",
				});
			},
		});
	}

	return (
		<div className="w-full max-w-[600px] relative font-mono">
			{/* Terminal-like Container */}
			<div className="bg-[#0a0f14]/90 backdrop-blur-xl border border-primary/20 rounded-none shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden group">
				{/* Decoration Lines */}
				<div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-primary" />
				<div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-primary" />
				<div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-primary" />
				<div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-primary" />

				<div className="p-8 pt-6 relative z-10">
					<div className="flex items-center gap-3 mb-8">
						<Mail className="text-primary w-6 h-6 animate-pulse" />
						<h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
							{">"} {t("contact.title")}
						</h1>
					</div>

					<WebForm<ContactStoreDto>
						{...contactForm}
						onSubmit={onContactSubmit}
						className="space-y-6"
					>
						<WebForm.control<ContactStoreDto>
							name="name"
							title={t("contact.form.name")}
							ico={<User className="w-4 h-4" />}
							placeholder="John Doe"
							className="bg-[#05080a] border-primary/40 text-primary placeholder:text-primary/50 focus:border-primary/50 rounded-none h-12 font-mono text-sm tracking-wide"
						/>

						<WebForm.control<ContactStoreDto>
							name="email"
							title={t("contact.form.email")}
							ico={<Mail className="w-4 h-4" />}
							placeholder="john@example.com"
							className="bg-[#05080a] border-primary/40 text-primary placeholder:text-primary/50 focus:border-primary/50 rounded-none h-12 font-mono text-sm tracking-wide"
						/>

						<WebForm.control.area<ContactStoreDto>
							name="message"
							title={t("contact.form.message")}
							placeholder={t("contact.subtitle")}
							className="bg-[#05080a] border-primary/40 text-primary placeholder:text-primary/50 focus:border-primary/50 rounded-none h-32 font-mono text-sm tracking-wide resize-none p-3"
						/>

						<button
							type="submit"
							disabled={contactStoreMutation.isLoading || false}
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
							<span className="relative z-10 flex items-center gap-2">
								[ {t("contact.form.submit")} ] <Send className="w-4 h-4" />
							</span>
						</button>
					</WebForm>
				</div>
			</div>
		</div>
	);
}
