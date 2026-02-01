import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { ArrowRight, Lock, Mail, Terminal } from "lucide-preact";
import { type Resolver, useForm } from "react-hook-form";
import { type AuthLoginApiError, authLoginApi } from "../apis/auth.login.api";
import { type AuthLoginDto, authLoginDto } from "../dtos/login.dto";

// ============================================
// TYPES
// ============================================

interface LoginFormProps {
	lang?: Lang;
}

interface LockoutInfo {
	isLocked: boolean;
	lockoutEndAt: string | null;
	remainingAttempts: number | null;
}

// ============================================
// COMPONENT
// ============================================

export default function LoginForm({ lang = "es" }: LoginFormProps) {
	const t = useTranslations(lang);
	const authLoginMutation = authLoginApi();

	// State using signals
	const lockoutInfo = useSignal<LockoutInfo>({
		isLocked: false,
		lockoutEndAt: null,
		remainingAttempts: null,
	});

	const authLoginForm = useForm<AuthLoginDto>({
		resolver: zodResolver(authLoginDto) as Resolver<AuthLoginDto>,
		mode: "all",
		defaultValues: {
			email: "",
			password: "",
			remember_me: false,
		},
	});

	function onAuthLogin(body: AuthLoginDto) {
		lockoutInfo.value = { ...lockoutInfo.value, isLocked: false };
		authLoginMutation.mutate(body, {
			onSuccess(result) {
				if (result.mfa_required && result.temp_token) {
					window.location.href = `/auth/mfa/verify?temp_token=${result.temp_token}`;
				} else {
					window.location.href = "/dashboard";
				}
			},
			onError(error: AuthLoginApiError) {
				if (error.is_locked && error.lockout_end_at) {
					lockoutInfo.value = {
						isLocked: true,
						lockoutEndAt: error.lockout_end_at,
						remainingAttempts: null,
					};
				} else if (error.remaining_attempts !== undefined) {
					lockoutInfo.value = {
						...lockoutInfo.value,
						remainingAttempts: error.remaining_attempts,
					};
				}
			},
		});
	}

	return (
		<div className="w-full max-w-[480px] relative font-mono">
			{/* Terminal-like Container */}
			<div className="bg-[#0a0f14]/90 backdrop-blur-xl border border-cyan-500/20 rounded-none shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden group">
				{/* Decoration Lines */}
				<div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500" />
				<div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-500" />
				<div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-500" />
				<div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500" />

				{/* Header */}
				<div className="p-8 pb-4">
					<div className="flex items-center gap-3 mb-6">
						<Terminal className="text-cyan-500 w-6 h-6 animate-pulse" />
						<h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
							{">"} {t("auth.terminal.user")}
						</h1>
					</div>

					<p className="text-cyan-500/60 text-xs leading-relaxed border-l-2 border-cyan-500/20 pl-3">
						{t("auth.terminal.restricted")}
					</p>
				</div>

				{/* Form */}
				<div className="p-8 pt-2 relative z-10">
					<WebForm<AuthLoginDto>
						{...authLoginForm}
						onSubmit={onAuthLogin}
						className="space-y-6"
					>
						<WebForm.control<AuthLoginDto>
							name="email"
							title={t("auth.terminal.uid")}
							ico={<Mail className="w-4 h-4" />}
							placeholder={t("auth.email.placeholder")}
							disabled={lockoutInfo.value.isLocked}
							className="bg-[#05080a] border-cyan-900/40 text-cyan-500 placeholder:text-cyan-900/50 focus:border-cyan-500/50 rounded-none h-12 font-mono text-sm tracking-wide"
						/>

						<WebForm.control<AuthLoginDto>
							name="password"
							type="password"
							title={t("auth.terminal.passphrase")}
							ico={<Lock className="w-4 h-4" />}
							placeholder="•"
							disabled={lockoutInfo.value.isLocked}
							className="bg-[#05080a] border-cyan-900/40 text-cyan-500 placeholder:text-cyan-900/50 focus:border-cyan-500/50 rounded-none h-12 font-mono tracking-widest"
						/>

						{authLoginMutation.error && !lockoutInfo.value.isLocked ? (
							<div
								data-testid="error-message"
								className="bg-red-500/10 border border-red-500/30 p-3 text-red-500 text-xs font-mono flex items-center gap-2"
							>
								<span className="font-bold">[ERROR]</span>
								{authLoginMutation.error.message || t("auth.error.credentials")}
							</div>
						) : null}

						{lockoutInfo.value.isLocked ? (
							<div
								data-testid="lockout-alert"
								className="bg-red-500/20 border border-red-500/50 p-4 text-red-500 text-xs font-mono space-y-2 animate-pulse"
							>
								<div className="font-black flex items-center gap-2">
									<span className="bg-red-500 text-black px-1">
										SECURITY_BLOCK
									</span>
									{t("auth.error.locked")}
								</div>
								<p className="opacity-80">
									{t("auth.terminal.restricted")}:{" "}
									{lockoutInfo.value.lockoutEndAt}
								</p>
							</div>
						) : null}

						<button
							type="submit"
							data-testid="submit-button"
							disabled={
								authLoginMutation.isLoading || lockoutInfo.value.isLocked
							}
							className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold h-12 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
							<span className="relative z-10 flex items-center gap-2">
								{authLoginMutation.isLoading ? (
									<span className="animate-pulse">
										{t("auth.terminal.processing")}
									</span>
								) : (
									<>
										[ {t("auth.terminal.execute")} ]{" "}
										<ArrowRight className="w-4 h-4" />
									</>
								)}
							</span>
						</button>
					</WebForm>

					<div className="mt-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-cyan-500/40">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
							SYSTEM READY
						</div>
						<a
							href="/auth/forgot-password"
							data-testid="forgot-password-link"
							className="hover:text-cyan-400 transition-colors"
						>
							{"<"} {t("auth.terminal.reset")} /{">"}
						</a>
					</div>
				</div>
			</div>

			{/* Google Button */}
			<div className="mt-8">
				<div className="relative py-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-cyan-500/10" />
					</div>
					<div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.3em]">
						<span className="bg-background px-4 text-cyan-500/40">
							{t("auth.terminal.gateway")}
						</span>
					</div>
				</div>
			</div>

			<div className="text-center mt-4">
				<p className="text-[10px] text-cyan-900/40 font-mono tracking-[0.2em]">
					{t("auth.terminal.unauthorized")}
				</p>
			</div>
		</div>
	);
}
