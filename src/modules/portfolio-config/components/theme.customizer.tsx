import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { sweetModal } from "@vigilio/sweet";
import {
	Fingerprint,
	Github,
	Globe,
	Linkedin,
	Mail,
	MapPin,
	Palette,
	Phone,
	Twitter,
	Type,
	User,
	Youtube,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { useForm } from "react-hook-form";
import { portfolioConfigShowApi } from "../apis/portfolio-config.show.api";
import { portfolioConfigUpdateApi } from "../apis/portfolio-config.update.api";
import type { PortfolioConfigSchema } from "../schemas/portfolio-config.schema";
import { portfolioConfigSchema } from "../schemas/portfolio-config.schema";

export default function ThemeCustomizer() {
	const query = portfolioConfigShowApi();
	const updateMutation = portfolioConfigUpdateApi();

	const form = useForm<PortfolioConfigSchema>({
		resolver: zodResolver(
			portfolioConfigSchema.omit({
				id: true,
				tenant_id: true,
				created_at: true,
				updated_at: true,
			}),
		) as any,
		mode: "all",
	});

	useEffect(() => {
		if (query.isSuccess && query.data) {
			form.reset(query.data.config);
		}
	}, [query.isSuccess, query.data]);

	function onSubmit(data: PortfolioConfigSchema) {
		updateMutation.mutate(data, {
			onSuccess() {
				sweetModal({
					icon: "success",
					title: "BRANDING_SYNCHRONIZED",
					text: "Portfolio configuration updated.",
				});
				query.refetch();
			},
			onError(error) {
				handlerError(form, error, "Sync Error");
			},
		});
	}

	let component: JSX.Element | null = null;

	if (query.isLoading) {
		component = (
			<div class="space-y-6 animate-pulse p-4">
				<div class="h-8 bg-zinc-900/50 rounded-xl w-1/4" />
				<div class="grid grid-cols-2 gap-4">
					<div class="h-12 bg-zinc-900/50 rounded-xl w-full" />
					<div class="h-12 bg-zinc-900/50 rounded-xl w-full" />
				</div>
				<div class="h-48 bg-zinc-900/50 rounded-xl w-full" />
			</div>
		);
	}

	if (query.isError) {
		component = (
			<div class="h-96 bg-zinc-950/40 rounded-3xl border border-white/5 flex items-center justify-center text-red-500 font-mono text-xs uppercase tracking-widest p-8 text-center">
				<Fingerprint size={32} class="mb-4 opacity-20 block mx-auto" />
				Error synchronizing with configuration core:{" "}
				{JSON.stringify(query.error)}
			</div>
		);
	}

	if (query.isSuccess && query.data) {
		component = (
			<div class="p-1">
				<Form {...form} onSubmit={onSubmit}>
					<div class="space-y-8 pb-12">
						{/* Identity Section */}
						<section class="space-y-4">
							<div class="flex items-center gap-2 text-primary border-b border-white/5 pb-2">
								<User size={18} />
								<h3 class="text-xs font-black uppercase tracking-[0.2em]">
									IDENTITY_PROFILE
								</h3>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Form.control<PortfolioConfigSchema>
									name="name"
									title="FULL_NAME"
									placeholder="E.g. John Doe"
									ico={<Type size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="profile_title"
									title="PROFESSIONAL_ANCHOR"
									placeholder="E.g. Senior Fullstack Engineer"
									ico={<Type size={16} />}
								/>
							</div>
							<Form.control.area<PortfolioConfigSchema>
								name="biography"
								title="AUTOBIOGRAPHICAL_LOG (MDX)"
								placeholder="Tell your professional story..."
								rows={4}
							/>
						</section>

						{/* Contact Section */}
						<section class="space-y-4">
							<div class="flex items-center gap-2 text-primary border-b border-white/5 pb-2">
								<Mail size={18} />
								<h3 class="text-xs font-black uppercase tracking-[0.2em]">
									COMMUNICATION_UPLINKS
								</h3>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Form.control<PortfolioConfigSchema>
									name="email"
									title="PRIMARY_ENPOINT"
									placeholder="hello@example.com"
									ico={<Mail size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="phone"
									title="VOICE_UPLINK"
									placeholder="+1 234 567 890"
									ico={<Phone size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="address"
									title="GEO_LOCATION"
									placeholder="Lima, Peru"
									ico={<MapPin size={16} />}
								/>
							</div>
						</section>

						{/* Aesthetics Section */}
						<section class="space-y-4">
							<div class="flex items-center gap-2 text-primary border-b border-white/5 pb-2">
								<Palette size={18} />
								<h3 class="text-xs font-black uppercase tracking-[0.2em]">
									AESTHETIC_PARAMETERS
								</h3>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
								<Form.control<PortfolioConfigSchema>
									name="color_primary"
									title="PRIMARY_HEX"
									placeholder="#3b82f6"
									ico={<Palette size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="color_secondary"
									title="SECONDARY_HEX"
									placeholder="#000000"
									ico={<Palette size={16} />}
								/>
								<Form.control.select<PortfolioConfigSchema>
									name="default_language"
									title="DEFAULT_LOCALE"
									placeholder="Select Language"
									ico={<Globe size={16} />}
									array={[
										{ key: "ES", value: "Spanish" },
										{ key: "EN", value: "English" },
										{ key: "PT", value: "Portuguese" },
									]}
								/>
								<Form.control.select<PortfolioConfigSchema>
									name="time_zone"
									title="TEMPORAL_ZONE"
									placeholder="Select Timezone"
									ico={<Globe size={16} />}
									array={[
										{ key: "UTC", value: "UTC" },
										{ key: "America/Lima", value: "America/Lima" },
										{ key: "America/Bogota", value: "America/Bogota" },
									]}
								/>
							</div>
						</section>

						{/* Social Section */}
						<section class="space-y-4">
							<div class="flex items-center gap-2 text-primary border-b border-white/5 pb-2">
								<Globe size={18} />
								<h3 class="text-xs font-black uppercase tracking-[0.2em]">
									SOCIAL_GRID
								</h3>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<Form.control<PortfolioConfigSchema>
									name="social_links.linkedin"
									title="LINKEDIN_PROFESSIONAL"
									ico={<Linkedin size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="social_links.github"
									title="GITHUB_CORE"
									ico={<Github size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="social_links.twitter"
									title="TWITTER_SIGNAL"
									ico={<Twitter size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="social_links.youtube"
									title="YOUTUBE_STREAM"
									ico={<Youtube size={16} />}
								/>
								<Form.control<PortfolioConfigSchema>
									name="social_links.portfolio"
									title="EXTERNAL_PORTFOLIO"
									ico={<Globe size={16} />}
								/>
							</div>
						</section>

						<Form.control.file<PortfolioConfigSchema>
							name="logo"
							title="BRAND_LOGO"
							entity="portfolio_config"
							property="logo"
							typeFile="image"
							accept="image/*"
						/>

						<Form.button.submit
							title="SYNCHRONIZE_CONFIG"
							loading_title="SYNCHRONIZING..."
							isLoading={updateMutation.isLoading || false}
							disabled={updateMutation.isLoading || false}
							className="w-full bg-primary text-primary-foreground font-black py-5 tracking-[0.3em] uppercase rounded-2xl hover:brightness-110 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all active:scale-95 border-none"
						/>
					</div>
				</Form>
			</div>
		);
	}

	return component;
}
