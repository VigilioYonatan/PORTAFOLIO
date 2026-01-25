import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { getTranslatedPath, useTranslations } from "@src/i18n";
import { type Lang } from "@src/i18n/ui";
import { sweetModal } from "@vigilio/sweet";
import {
	ArrowRight,
	Building,
	Check,
	Eye,
	EyeOff,
	Lock,
	Mail,
	Phone,
	User,
	X,
} from "lucide-preact";
import { useForm } from "react-hook-form";
import { authRegisterApi } from "../apis/auth.register.api";
import { type AuthRegisterDto, authRegisterDto } from "../dtos/register.dto";

// ============================================
// TYPES
// ============================================

interface PasswordStrength {
	score: number;
	label: string;
	color: string;
	requirements: PasswordRequirement[];
}

interface PasswordRequirement {
	met: boolean;
	label: string;
}

// ============================================
// PASSWORD STRENGTH LOGIC
// ============================================

function calculatePasswordStrength(
	password: string,
	t: (key: any, params?: any) => string,
): PasswordStrength {
	const requirements: PasswordRequirement[] = [
		{ met: password.length >= 8, label: t("auth.password.req.8char") },
		{ met: /[A-Z]/.test(password), label: t("auth.password.req.upper") },
		{ met: /[a-z]/.test(password), label: t("auth.password.req.lower") },
		{ met: /[0-9]/.test(password), label: t("auth.password.req.number") },
		{
			met: /[^A-Za-z0-9]/.test(password),
			label: t("auth.password.req.special"),
		},
	];

	const score = requirements.filter((r) => r.met).length;

	const strengthLevels: { min: number; label: string; color: string }[] = [
		{ min: 0, label: t("auth.password.strength.0"), color: "bg-destructive" },
		{ min: 2, label: t("auth.password.strength.1"), color: "bg-orange-500" },
		{ min: 3, label: t("auth.password.strength.2"), color: "bg-yellow-500" },
		{ min: 4, label: t("auth.password.strength.3"), color: "bg-green-500" },
		{ min: 5, label: t("auth.password.strength.4"), color: "bg-emerald-600" },
	];

	const level =
		strengthLevels.filter((l) => score >= l.min).pop() || strengthLevels[0];

	return {
		score,
		label: level.label,
		color: level.color,
		requirements,
	};
}

// ============================================
// COMPONENTS
// ============================================

function PasswordStrengthIndicator({
	password,
	t,
}: {
	password: string;
	t: (key: any, params?: any) => string;
}) {
	const strength = calculatePasswordStrength(password, t);
	const percentage = (strength.score / 5) * 100;

	if (!password) return null;

	return (
		<div class="space-y-2" data-testid="password-strength">
			<div class="flex items-center justify-between">
				<span class="text-[10px] uppercase font-bold text-zinc-500">
					{t("auth.password.strength.label")}
				</span>
				<span
					class={`text-[10px] font-black uppercase tracking-wider ${
						strength.score >= 4
							? "text-emerald-500"
							: strength.score >= 3
								? "text-yellow-500"
								: "text-destructive"
					}`}
				>
					{strength.label}
				</span>
			</div>
			<div class="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
				<div
					class={`h-full transition-all duration-300 ${strength.color}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<ul class="grid grid-cols-1 gap-1 mt-2">
				{strength.requirements.map((req, index) => (
					<li
						key={index}
						class={`flex items-center gap-2 text-[10px] font-bold ${
							req.met ? "text-emerald-500" : "text-zinc-600"
						}`}
					>
						{req.met ? (
							<Check size={10} class="text-emerald-500" />
						) : (
							<X size={10} class="text-zinc-600" />
						)}
						{req.label}
					</li>
				))}
			</ul>
		</div>
	);
}

function PasswordMatchIndicator({
	password,
	repeatPassword,
	t,
}: {
	password: string;
	repeatPassword: string;
	t: (key: any, params?: any) => string;
}) {
	if (!repeatPassword) return null;

	const matches = password === repeatPassword;

	return (
		<div
			class={`flex items-center gap-2 text-[10px] font-bold uppercase mt-1 ${
				matches ? "text-emerald-500" : "text-destructive"
			}`}
			data-testid="password-match"
		>
			{matches ? (
				<>
					<Check size={10} />
					{t("auth.password.match")}
				</>
			) : (
				<>
					<X size={10} />
					{t("auth.password.mismatch")}
				</>
			)}
		</div>
	);
}

// ============================================
// MAIN COMPONENT
// ============================================

interface RegisterFormProps {
	lang?: Lang;
}

export function RegisterForm({ lang = "es" }: RegisterFormProps) {
	const t = useTranslations(lang);
	const registerMutation = authRegisterApi();
	const showPassword = useSignal<boolean>(false);
	const showRepeatPassword = useSignal<boolean>(false);

	const registerForm = useForm<AuthRegisterDto>({
		resolver: zodResolver(authRegisterDto),
		mode: "all",
	});

	const password = registerForm.watch("password") || "";
	const repeatPassword = registerForm.watch("repeat_password") || "";

	function onSubmit(data: AuthRegisterDto) {
		if (data.password !== data.repeat_password) {
			registerForm.setError("repeat_password", {
				message: t("auth.password.mismatch"),
			});
			return;
		}

		sweetModal({
			title: t("auth.createAccount") + "?",
			text: t("auth.enterDetails"),
			icon: "info",
			showCancelButton: true,
			confirmButtonText: t("auth.submit.register") + "!",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				registerMutation.mutate(data, {
					onSuccess() {
						window.location.href = `/auth/login?registered=true`;
					},
					onError(error) {
						if (error.body) {
							registerForm.setError(error.body, { message: error.message });
						}
					},
				});
			}
		});
	}

	return (
		<div class="space-y-6">
			<WebForm<AuthRegisterDto>
				{...registerForm}
				onSubmit={onSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				{/* Tenant Name */}
				<div class="md:col-span-2">
					<WebForm.control<AuthRegisterDto>
						name="tenant_name"
						title={t("auth.tenantName.label")}
						type="text"
						placeholder={t("auth.tenantName.placeholder")}
						required
						ico={<Building {...sizeIcon.small} />}
						data-testid="tenant-name-input"
						className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					/>
					{/* Slug Visualizer */}
					<div class="mt-2 flex items-center gap-2 text-xs text-zinc-500 px-1">
						<span class="font-medium uppercase tracking-wider">
							URL Preview:
						</span>
						<div class="flex items-center gap-0.5 font-mono bg-zinc-900/50 px-2 py-1 rounded">
							<span class="text-zinc-600">https://</span>
							<span class="text-primary font-bold">
								{registerForm.watch("tenant_name")
									? registerForm
											.watch("tenant_name")
											.toLowerCase()
											.replace(/[^a-z0-9]/g, "-")
									: "company"}
							</span>
							<span class="text-zinc-600">.vigiliocv.com</span>
						</div>
					</div>
				</div>

				{/* Username */}
				<div class="md:col-span-2">
					<WebForm.control<AuthRegisterDto>
						name="username"
						title={t("auth.username.label")}
						type="text"
						placeholder="juan_perez"
						required
						ico={<User {...sizeIcon.small} />}
						className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					/>
				</div>

				{/* Email */}
				<div class="md:col-span-1">
					<WebForm.control<AuthRegisterDto>
						name="email"
						title={t("auth.email.label")}
						type="email"
						placeholder={t("auth.email.placeholder")}
						required
						ico={<Mail {...sizeIcon.small} />}
						className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					/>
				</div>

				{/* Phone */}
				<div class="md:col-span-1">
					<WebForm.control<AuthRegisterDto>
						name="phone_number"
						title={t("auth.phone.label")}
						type="tel"
						placeholder="+51 999 999 999"
						ico={<Phone {...sizeIcon.small} />}
						className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					/>
				</div>

				{/* Password */}
				<div class="md:col-span-1 space-y-2">
					<div class="relative">
						<WebForm.control<AuthRegisterDto>
							name="password"
							title={t("auth.password.label")}
							type={showPassword.value ? "text" : "password"}
							placeholder={t("auth.password.placeholder")}
							required
							ico={<Lock {...sizeIcon.small} />}
							className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-[34px] text-zinc-500 hover:text-white transition-colors"
							onClick={() => {
								showPassword.value = !showPassword.value;
							}}
						>
							{showPassword.value ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
					<PasswordStrengthIndicator password={password} t={t} />
				</div>

				{/* Repeat Password */}
				<div class="md:col-span-1 space-y-2">
					<div class="relative">
						<WebForm.control<AuthRegisterDto>
							name="repeat_password"
							title={t("auth.password.confirm")}
							type={showRepeatPassword.value ? "text" : "password"}
							placeholder={t("auth.password.placeholder")}
							required
							ico={<Lock {...sizeIcon.small} />}
							className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-[34px] text-zinc-500 hover:text-white transition-colors"
							onClick={() => {
								showRepeatPassword.value = !showRepeatPassword.value;
							}}
						>
							{showRepeatPassword.value ? (
								<EyeOff size={16} />
							) : (
								<Eye size={16} />
							)}
						</button>
					</div>
					<PasswordMatchIndicator
						password={password}
						repeatPassword={repeatPassword}
						t={t}
					/>
				</div>

				{/* Terms and Conditions */}
				<div class="md:col-span-2 space-y-2 pt-2">
					<label class="flex items-start gap-3 cursor-pointer group">
						<input
							type="checkbox"
							{...registerForm.register("terms_accepted")}
							data-testid="terms-checkbox"
							class="mt-1 w-4 h-4 rounded border-zinc-800 bg-zinc-900/50 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
						/>
						<span class="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors leading-relaxed">
							{t("auth.terms.agree")}{" "}
							<a
								href="/terms"
								class="text-primary font-bold hover:underline"
								target="_blank"
								rel="noopener"
							>
								{t("auth.terms.link")}
							</a>{" "}
							{t("auth.terms.and")}{" "}
							<a
								href="/privacy"
								class="text-primary font-bold hover:underline"
								target="_blank"
								rel="noopener"
							>
								{t("auth.privacy.link")}
							</a>
						</span>
					</label>
					{registerForm.formState.errors.terms_accepted ? (
						<p class="text-[10px] text-destructive font-bold uppercase tracking-wider">
							{registerForm.formState.errors.terms_accepted.message}
						</p>
					) : null}
				</div>

				{/* Error Message */}
				{registerMutation.error && !registerMutation.error.body ? (
					<div
						class="md:col-span-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center"
						data-testid="error-message"
					>
						{registerMutation.error.message || t("auth.error.register")}
					</div>
				) : null}

				{/* Submit */}
				<div class="md:col-span-2 pt-4">
					<WebForm.button.submit
						disabled={registerMutation.isLoading || false}
						isLoading={registerMutation.isLoading || false}
						title={t("auth.submit.register")}
						loading_title={t("auth.submit.registering")}
						className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
						ico={
							<ArrowRight
								{...sizeIcon.small}
								class="transition-transform group-hover:translate-x-1"
							/>
						}
					/>
				</div>
			</WebForm>

			{/* Divider */}
			<div class="relative py-4">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t border-zinc-800/50" />
				</div>
				<div class="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
					<span class="bg-background px-4 text-zinc-500">
						{t("auth.orRegister")}
					</span>
				</div>
			</div>

			{/* Google Button */}
			<a
				href="/api/v1/auth/google"
				class="w-full flex items-center justify-center gap-3 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
				data-testid="google-register-button"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Google
			</a>

			{/* Already have account link (for mobile within form) */}
			<p class="text-center text-sm text-zinc-500 sm:hidden">
				{t("auth.alreadyHaveAccount")}{" "}
				<a
					href={getTranslatedPath("/auth/login", lang)}
					class="text-primary font-bold hover:underline"
				>
					{t("auth.login")}
				</a>
			</p>
		</div>
	);
}

export default RegisterForm;
