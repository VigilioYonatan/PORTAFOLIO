import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError, sizeIcon } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { sweetModal } from "@vigilio/sweet";
import {
	ArrowRight,
	Check,
	Copy,
	QrCode,
	Shield,
	ShieldCheck,
	Smartphone,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";
import { authMfaSetupApi } from "../apis/auth.mfa-setup.api";
import { authMfaVerifyApi } from "../apis/auth.mfa-verify.api";
import {
	type AuthMfaVerifyDto,
	authMfaVerifyDto,
} from "../dtos/mfa-verify.dto";

export default function MfaSetup({ onSuccess }: { onSuccess?: () => void }) {
	const setupApi = authMfaSetupApi();
	const verifyApi = authMfaVerifyApi();
	const copied = useSignal(false);

	const form = useForm<AuthMfaVerifyDto>({
		resolver: zodResolver(authMfaVerifyDto),
		defaultValues: {
			token: "",
		},
		mode: "all",
	});

	useEffect(() => {
		setupApi.mutate(undefined);
	}, []);

	const handleCopySecret = () => {
		if (setupApi.data?.secret) {
			navigator.clipboard.writeText(setupApi.data.secret);
			copied.value = true;
			setTimeout(() => {
				copied.value = false;
			}, 2000);
		}
	};

	const onVerify = (data: AuthMfaVerifyDto) => {
		verifyApi.mutate(data, {
			onSuccess: () => {
				sweetModal({
					icon: "success",
					title: "¡2FA Activado!",
					text: "Tu cuenta ahora está protegida con seguridad de grado bancario.",
					showConfirmButton: true,
				}).then(() => {
					if (onSuccess) {
						onSuccess();
					} else {
						window.location.href = "/dashboard/profile";
					}
				});
			},
			onError: (error) => {
				handlerError(form, error as any, "Error verificando código MFA");
			},
		});
	};

	if (setupApi.isLoading) {
		return (
			<div class="flex flex-col items-center justify-center p-12 space-y-4 animate-in fade-in duration-700">
				<div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
				<p class="text-zinc-500 font-medium animate-pulse">
					Generating secure credentials...
				</p>
			</div>
		);
	}

	return (
		<div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div class="flex flex-col items-center text-center gap-3">
				<div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-2">
					<Shield {...sizeIcon.xxxlarge} class="text-primary" />
				</div>
				<h2 class="text-3xl font-black tracking-tighter text-white">
					Enable 2FA
				</h2>
				<p class="text-zinc-500 max-w-sm text-sm font-medium">
					Protect your account from unauthorized access by setting up
					Multi-Factor Authentication.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
				<div class="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

				<div class="flex flex-col items-center gap-6 relative z-10">
					<div class="p-4 bg-white rounded-2xl shadow-2xl border-2 border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
						{setupApi.data?.qr_code ? (
							<img
								src={setupApi.data.qr_code}
								alt="MFA QR Code"
								title="MFA QR Code"
								width={180}
								height={180}
								class="block mix-blend-multiply"
							/>
						) : (
							<div class="w-[180px] h-[180px] bg-zinc-200 animate-pulse rounded-lg flex items-center justify-center">
								<QrCode size={48} class="text-zinc-400" />
							</div>
						)}
					</div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
						Step 1: Scan QR Code
					</div>
				</div>

				<div class="space-y-6 relative z-10">
					<div class="space-y-3">
						<h3 class="text-sm font-bold flex items-center gap-2 text-white">
							<Smartphone {...sizeIcon.small} class="text-primary" />
							Manual Entry
						</h3>
						<p class="text-xs text-zinc-500 leading-relaxed font-medium">
							If you can't scan the QR code, enter this secret key manually in
							your authenticator app.
						</p>
						<div class="flex items-center gap-2 mt-2">
							<code class="flex-1 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs font-mono select-all break-all tracking-widest text-primary font-bold shadow-inner">
								{setupApi.data?.secret || "•••• •••• •••• ••••"}
							</code>
							<button
								type="button"
								onClick={handleCopySecret}
								class="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-all group active:scale-95 shadow-lg"
								title="Copy secret"
							>
								{copied.value ? (
									<Check {...sizeIcon.small} class="text-green-500" />
								) : (
									<Copy
										{...sizeIcon.small}
										class="text-zinc-500 group-hover:text-primary transition-colors"
									/>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				<div class="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
					<div class="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-primary/10">
						<span class="text-xs font-black text-primary italic">02</span>
					</div>
					<div class="space-y-1">
						<p class="text-xs font-black text-white uppercase tracking-wider">
							Verification Step
						</p>
						<p class="text-xs text-zinc-500 font-medium">
							Enter the 6-digit verification code generated by your app.
						</p>
					</div>
				</div>

				<WebForm<AuthMfaVerifyDto>
					{...form}
					onSubmit={onVerify}
					className="space-y-6"
				>
					<WebForm.control<AuthMfaVerifyDto>
						name="token"
						title=""
						placeholder="000 000"
						required
						className="text-center text-3xl tracking-[0.3em] font-mono py-6 bg-zinc-950/50 border-zinc-800! focus:border-primary!"
						autoComplete="one-time-code"
					/>
					<div class="pt-2">
						<WebForm.button.submit
							title="Verify and Activate"
							loading_title="Activating..."
							isLoading={verifyApi.isLoading || false}
							className="w-full py-5 text-lg font-bold rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
							ico={
								<ArrowRight
									{...sizeIcon.small}
									class="transition-transform group-hover:translate-x-1"
								/>
							}
						/>
					</div>
				</WebForm>
			</div>

			<div class="pt-8 border-t border-zinc-900 flex justify-center">
				<div class="flex items-center gap-2 text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em] font-bold">
					<ShieldCheck size={12} class="text-primary/50" />
					Security Powered by Pylot Engine
				</div>
			</div>
		</div>
	);
}
