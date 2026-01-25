import { useForm } from "react-hook-form";
// Assuming there is a web-form component based on rules
import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@components/extras/Button";
import { MailIcon, LockIcon } from "lucide-preact";
import { navigate } from "wouter-preact/use-browser-location";
import { authLoginDto, type AuthLoginDto } from "../dtos/login.dto";
import { authLoginApi } from "../apis/auth.login.api";
import { sweetModal } from "@vigilio/sweet";
import { handlerError } from "@infrastructure/utils/client";

export default function LoginForm() {
	const loginForm = useForm<AuthLoginDto>({
		resolver: zodResolver(authLoginDto),
		defaultValues: {
			email: "",
			password: "",
			remember_me: false,
		},
	});

	const loginMutation = authLoginApi();

	function onSubmit(body: AuthLoginDto) {
		loginMutation.mutate(body, {
			onSuccess(data) {
				if (data.mfa_required) {
					// Handle MFA if needed, but for now redirect to dashboard if success
					navigate("/dashboard");
					return;
				}
				sweetModal({
					icon: "success",
					title: "SYSTEM_ACCESS_GRANTED",
					text: `Welcome back, ${data.user?.full_name || "Agent"}`,
					timer: 2000,
					showConfirmButton: false,
				}).then(() => {
					navigate("/dashboard");
				});
			},
			onError(error) {
				handlerError(loginForm, error, "AUTHENTICATION_FAILURE");
			},
		});
	}

	return (
		<div class="w-full max-w-md p-8 space-y-6 bg-card border border-border rounded-lg shadow-2xl relative overflow-hidden group">
            {/* Ambient Glow */}
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

			<div class="space-y-2 text-center">
				<h1 class="text-3xl font-bold tracking-tighter text-glow text-primary font-mono animate-glitch" data-text="SYSTEM_LOGIN">
					SYSTEM_LOGIN
				</h1>
				<p class="text-muted-foreground font-mono text-xs tracking-widest uppercase">
					Secure Access Terminal
				</p>
			</div>

			<WebForm onSubmit={onSubmit} {...loginForm}>
				<WebForm.control<AuthLoginDto>
					name="email"
					title="Email Identity"
					placeholder="admin@system.core"
					ico={<MailIcon />}
                    type="email"
				/>
				<WebForm.control<AuthLoginDto>
					name="password"
					title="Security Key"
					placeholder="••••••••"
					ico={<LockIcon />}
                    type="password"
				/>

                <div class="flex justify-between items-center text-xs">
                    <a href="/auth/forgot-password" class="text-primary hover:underline hover:text-primary/80 transition-colors">
                        [ FORGOT_PASSWORD? ]
                    </a>
                </div>

				<Button
					type="submit"
					variant="primary"
					className="w-full mt-4"
					size="lg"
					isLoading={loginMutation.isLoading || false}
					disabled={loginMutation.isLoading || false}
                    loading_title="AUTHENTICATING..."
				>
					INITIALIZE_SESSION
				</Button>
			</WebForm>

            <div class="absolute bottom-0 right-0 p-2 opacity-20 pointer-events-none">
                <span class="font-mono text-[10px]">V.1.0.4-BETA</span>
            </div>
		</div>
	);
}
