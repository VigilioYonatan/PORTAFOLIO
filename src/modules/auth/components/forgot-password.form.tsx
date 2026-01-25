import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Lang, useTranslations } from "@src/i18n";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Mail,
	Shield,
} from "lucide-preact";
import { useForm } from "react-hook-form";
import { authForgotPasswordApi } from "../apis/auth.forgot-password.api";
import {
	type AuthForgotPasswordDto,
	authForgotPasswordDto,
} from "../dtos/forgot-password.dto";

// ============================================
// TYPES
// ============================================

interface ForgotPasswordFormProps {
	lang?: Lang;
}

type TranslationFn = ReturnType<typeof useTranslations>;

// ============================================
// SUB-COMPONENTS
// ============================================

function SuccessState({ t }: { t: TranslationFn }) {
	return (
		<div
			class=" bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 text-center space-y-6"
			data-testid="success-state"
		>
			<div class="flex flex-col items-center gap-4">
				<div class="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
					<CheckCircle2
						class="text-emerald-500 animate-in zoom-in spin-in-90 duration-500"
						size={32}
					/>
				</div>
				<h2 class="text-xl font-bold text-white tracking-wide">
					{t("auth.forgot.success.title")}
				</h2>
				<p class="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto font-medium">
					{t("auth.forgot.success.message")}
				</p>
			</div>
			<a
				href="/auth/login"
				class="w-full py-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold tracking-wider hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group hover:border-zinc-700"
				data-testid="back-to-login-link"
			>
				<ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
				<span>{t("auth.forgot.success.back")}</span>
			</a>
		</div>
	);
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ForgotPasswordForm({ lang = "es" }: ForgotPasswordFormProps) {
	const t = useTranslations(lang);
	const forgotPasswordMutation = authForgotPasswordApi();

	const forgotPasswordForm = useForm<AuthForgotPasswordDto>({
		resolver: zodResolver(authForgotPasswordDto),
		mode: "all",
	});

	function onSubmit(data: AuthForgotPasswordDto) {
		forgotPasswordMutation.mutate(data);
	}

	// Success State
	if (forgotPasswordMutation.isSuccess) {
		return <SuccessState t={t} />;
	}

	return (
		<div class="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 space-y-6">
			{/* Shield Icon */}
			<div class="flex justify-center">
				<div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(var(--color-primary),0.15)] relative overflow-hidden group">
					<div class="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
					<Shield class="text-primary w-8 h-8 relative z-10 drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
				</div>
			</div>

			{/* Header */}
			<div class="text-center space-y-2">
				<h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight uppercase">
					Recovery Mode
				</h1>
				<p class="text-zinc-500 text-xs font-mono tracking-wide max-w-sm mx-auto uppercase">
					Enter verified email credential to initiate reset protocol
				</p>
			</div>

			{/* Form */}
			<WebForm<AuthForgotPasswordDto>
				{...forgotPasswordForm}
				onSubmit={onSubmit}
				className="space-y-6"
			>
				{/* Email Field */}
				<WebForm.control<AuthForgotPasswordDto>
					name="email"
					title={
						<span class="block text-[10px] font-bold text-primary/70 uppercase tracking-[0.2em] mb-1">
							Target Email
						</span>
					}
					ico={<Mail class="w-5 h-5" />}
					placeholder="admin@system.io"
					className="font-mono h-12"
					data-testid="email-input"
				/>

				{/* Error Message */}
				{forgotPasswordMutation.error ? (
					<div
						class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono font-bold tracking-wide text-center"
						data-testid="error-message"
					>
						[ERROR]: {forgotPasswordMutation.error.message}
					</div>
				) : null}

				{/* Submit Button */}
				<button
					type="submit"
					disabled={forgotPasswordMutation.isLoading || false}
					class="relative w-full overflow-hidden bg-primary hover:bg-primary/90 text-black py-3.5 rounded-lg font-black tracking-widest text-sm uppercase transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--color-primary),0.4)]"
					data-testid="submit-button"
				>
					<span class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
					<div class="relative flex items-center justify-center gap-2">
						{forgotPasswordMutation.isLoading ? (
							<>
								<div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
								<span class="animate-pulse">PROCESSING...</span>
							</>
						) : (
							<>
								<span>SEND INSTRUCTIONS</span>
								<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
							</>
						)}
					</div>
				</button>
			</WebForm>

			{/* Back to Login Link */}
			<div class="text-center pt-2">
				<a
					href="/auth/login"
					class="text-[10px] font-bold text-zinc-600 hover:text-primary transition-colors uppercase tracking-[0.15em] hover:underline underline-offset-4 decoration-primary/30"
					data-testid="back-to-login"
				>
					&lt; Return to Access Point
				</a>
			</div>
		</div>
	);
}

export default ForgotPasswordForm;
