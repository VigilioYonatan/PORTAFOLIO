import { AlertTriangle, Loader2 } from "lucide-preact";
import { useEffect } from "preact/hooks";

function GoogleCallback() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const error = params.get("error");
		const token = params.get("token");
		const mfa = params.get("mfa_required");
		const temp_token = params.get("temp_token");

		if (error) {
			// Error handling is rendered below
			return;
		}

		if (mfa === "true" && temp_token) {
			window.location.href = `/auth/mfa/verify?temp_token=${temp_token}`;
			return;
		}

		// If we have a token (or just success), redirect to dashboard
		// The backend might have set a cookie, or we might need to store the token
		// For now, assume cookie or just redirect
		setTimeout(() => {
			window.location.href = "/dashboard";
		}, 1000);
	}, []);

	const params = new URLSearchParams(
		typeof window !== "undefined" ? window.location.search : "",
	);
	const error = params.get("error");
	const message = params.get("message");

	if (error) {
		return (
			<div class="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div class="p-10 rounded-3xl bg-red-500/5 border border-red-500/20 text-center space-y-6 max-w-md">
					<div class="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto">
						<AlertTriangle class="text-red-500" size={40} />
					</div>
					<div class="space-y-2">
						<h3 class="text-2xl font-bold text-white italic">
							Authentication Failed
						</h3>
						<p class="text-red-400/70 text-sm leading-relaxed">
							{message ||
								"We couldn't sign you in with Google. Please try again."}
						</p>
					</div>
				</div>
				<a
					href="/auth/login"
					class="px-8 py-4 rounded-xl bg-zinc-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all border border-zinc-800"
				>
					Return to Login
				</a>
			</div>
		);
	}

	return (
		<div class="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
			<div class="relative">
				<div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
					<Loader2 class="text-primary animate-spin" size={40} />
				</div>
				<div class="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse" />
			</div>
			<div class="text-center space-y-2">
				<h3 class="text-xl font-bold text-white">Completing Sign In...</h3>
				<p class="text-zinc-500 text-sm">
					Please wait while we securely log you in.
				</p>
			</div>
		</div>
	);
}
export default GoogleCallback;
