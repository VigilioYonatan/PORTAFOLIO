import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sizeIcon } from "@infrastructure/utils/client";
import { type Lang, useTranslations } from "@src/i18n";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-preact";
import { type Resolver, useForm } from "react-hook-form";
import { authMfaLoginApi } from "../apis/auth.mfa-login.api";
import { type AuthMfaLoginDto, authMfaLoginDto } from "../dtos/mfa-login.dto";

interface MfaVerifyProps {
	temp_token: string;
	lang?: Lang;
}

export function MfaVerify({ temp_token, lang = "es" }: MfaVerifyProps) {
	const t = useTranslations(lang);
	const mfaMutation = authMfaLoginApi();

	const mfaForm = useForm<AuthMfaLoginDto>({
		resolver: zodResolver(authMfaLoginDto) as Resolver<AuthMfaLoginDto>,
		defaultValues: {
			temp_token,
		},
	});

	function onSubmit(data: AuthMfaLoginDto) {
		mfaMutation.mutate(data, {
			onSuccess() {
				// Redirect to dashboard on success
				window.location.href = "/dashboard";
			},
		});
	}

	return (
		<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div class="text-center space-y-3">
				<div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
					<ShieldCheck size={32} />
				</div>
				<h1 class="text-3xl font-black text-white tracking-tight">
					{t("auth.mfa.verify.title")}
				</h1>
				<p class="text-zinc-500 font-medium text-sm max-w-xs mx-auto">
					{t("auth.mfa.verify.subtitle")}
				</p>
			</div>

			<WebForm<AuthMfaLoginDto>
				{...mfaForm}
				onSubmit={onSubmit}
				className="space-y-6"
			>
				<input type="hidden" {...mfaForm.register("temp_token")} />

				<WebForm.control<AuthMfaLoginDto>
					name="mfa_code"
					title={t("auth.mfa.verify.code")}
					type="text"
					placeholder="000000"
					required
					className="text-center text-2xl tracking-[0.5em] font-black bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-14"
				/>

				{mfaMutation.error && (
					<div class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center">
						{mfaMutation.error.message}
					</div>
				)}

				<div class="pt-2">
					<WebForm.button.submit
						disabled={mfaMutation.isLoading || false}
						isLoading={mfaMutation.isLoading || false}
						title={t("auth.mfa.verify.submit")}
						loading_title={t("auth.mfa.verify.verifying")}
						className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
						ico={
							<ArrowRight
								{...sizeIcon.small}
								class="transition-transform group-hover:translate-x-1"
							/>
						}
					/>
				</div>
			</WebForm>

			<div class="text-center">
				<a
					href="/auth/login"
					class="text-xs font-bold text-zinc-600 hover:text-white transition-all inline-flex items-center gap-2 group"
				>
					<ArrowLeft
						size={14}
						class="group-hover:-translate-x-1 transition-transform"
					/>
					{t("auth.mfa.verify.back")}
				</a>
			</div>
		</div>
	);
}

export default MfaVerify;
