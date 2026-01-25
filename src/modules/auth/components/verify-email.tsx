import { sizeIcon } from "@infrastructure/utils/client";
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	Loader2,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { authVerifyEmailApi } from "../apis/auth.verify-email.api";
import {
	type AuthVerifyEmailDto,
	authVerifyEmailDto,
} from "../dtos/verify-email.dto";

interface VerifyEmailProps {
	token: string;
}

export default function VerifyEmail({ token }: VerifyEmailProps) {
	const verifyEmailMutation = authVerifyEmailApi();

	useEffect(() => {
		if (token) {
			verifyEmailMutation.mutate({ token });
		}
	}, [token]);

	if (verifyEmailMutation.isLoading) {
		return (
			<div class="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in duration-700">
				<div class="relative">
					<div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
						<Loader2 class="text-primary animate-spin" size={40} />
					</div>
					<div class="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse" />
				</div>
				<div class="text-center space-y-2">
					<h3 class="text-xl font-bold text-white">Verifying your email</h3>
					<p class="text-zinc-500 text-sm">
						Please wait while we secure your account credentials...
					</p>
				</div>
			</div>
		);
	}

	if (verifyEmailMutation.isSuccess) {
		return (
			<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div class="p-10 rounded-3xl bg-primary/5 border border-primary/20 text-center space-y-6 relative overflow-hidden">
					<div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
					<div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto relative z-10">
						<CheckCircle2 class="text-primary" size={40} />
					</div>
					<div class="relative z-10 space-y-2">
						<h3 class="text-2xl font-bold text-white italic">
							¡Email Verificado!
						</h3>
						<p class="text-zinc-400 text-sm leading-relaxed">
							Tu cuenta ha sido activada con éxito. Ahora tienes acceso completo
							a todas nuestras potentes herramientas de análisis.
						</p>
					</div>
				</div>
				<a
					href="/dashboard"
					class="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all group"
				>
					Go to Dashboard
					<ArrowRight
						{...sizeIcon.small}
						class="transition-transform group-hover:translate-x-1"
					/>
				</a>
			</div>
		);
	}

	if (verifyEmailMutation.isError) {
		return (
			<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
				<div class="p-10 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-6">
					<div class="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
						<AlertTriangle class="text-red-500" size={40} />
					</div>
					<div class="space-y-2">
						<h3 class="text-2xl font-bold text-white italic">
							Error de Verificación
						</h3>
						<p class="text-red-400/70 text-sm leading-relaxed">
							{verifyEmailMutation.error?.message ||
								"El enlace de verificación es inválido o ha expirado. Por favor, solicita uno nuevo."}
						</p>
					</div>
				</div>
				<a
					href="/auth/login"
					class="w-full py-4 rounded-xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all border border-zinc-800"
				>
					Return to Login
				</a>
			</div>
		);
	}

	return null;
}
