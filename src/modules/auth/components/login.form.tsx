import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignal } from "@preact/signals";
import { type Lang, useTranslations } from "@src/i18n";
import { ArrowRight, Lock, Mail, Terminal } from "lucide-preact";
import { useForm, type Resolver } from "react-hook-form";
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

export function LoginForm({ lang = "es" }: LoginFormProps) {
	const t = useTranslations(lang);
	const authLoginMutation = authLoginApi();

	// State using signals
	const lockoutInfo = useSignal<LockoutInfo>({
		isLocked: false,
		lockoutEndAt: null,
		remainingAttempts: null,
	});

	const authLoginForm = useForm<AuthLoginDto>({
		resolver: zodResolver(authLoginDto),
		mode: "all",
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
							{">"} AUTH_USER
						</h1>
					</div>

					<p className="text-cyan-500/60 text-xs leading-relaxed border-l-2 border-cyan-500/20 pl-3">
						Restricted Area. Please enter valid administrative credentials to
						decrypt portfolio data.
					</p>
				</div>

				{/* Form */}
				<div className="p-8 pt-2">
					<WebForm<AuthLoginDto>
						{...authLoginForm}
						onSubmit={onAuthLogin}
						className="space-y-6"
					>
						<WebForm.control<AuthLoginDto>
							name="email"
							title="UID / EMAIL"
							ico={<Mail className="w-4 h-4" />}
							placeholder="user@system.dev"
							disabled={lockoutInfo.value.isLocked}
							className="bg-[#05080a] border-cyan-900/40 text-cyan-500 placeholder:text-cyan-900/50 focus:border-cyan-500/50 rounded-none h-12 font-mono text-sm tracking-wide"
						/>

						<WebForm.control<AuthLoginDto>
							name="password"
							type="password"
							title="PASSPHRASE"
							ico={<Lock className="w-4 h-4" />}
							placeholder="•"
							disabled={lockoutInfo.value.isLocked}
							className="bg-[#05080a] border-cyan-900/40 text-cyan-500 placeholder:text-cyan-900/50 focus:border-cyan-500/50 rounded-none h-12 font-mono tracking-widest"
						/>

						{authLoginMutation.error && !lockoutInfo.value.isLocked ? (
							<div className="bg-red-500/10 border border-red-500/30 p-3 text-red-500 text-xs font-mono flex items-center gap-2">
								<span className="font-bold">[ERROR]</span>
								{authLoginMutation.error.message || t("auth.error.credentials")}
							</div>
						) : null}

						<button
							type="submit"
							disabled={
								authLoginMutation.isLoading || lockoutInfo.value.isLocked
							}
							className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold h-12 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
							<span className="relative z-10 flex items-center gap-2">
								{authLoginMutation.isLoading ? (
									<>
										<span className="animate-pulse">PROCESSING...</span>
									</>
								) : (
									<>
										[ EXECUTE LOGIN ] <ArrowRight className="w-4 h-4" />
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
							className="hover:text-cyan-400 transition-colors"
						>
							{"<"} RESET_CREDENTIALS /{">"}
						</a>
					</div>
				</div>
			</div>

			<div className="text-center mt-4">
				<p className="text-[10px] text-cyan-900/40 font-mono tracking-[0.2em]">
					UNAUTHORIZED ACCESS IS PROHIBITED BY LAW
				</p>
			</div>
		</div>
	);
}

export default LoginForm;
