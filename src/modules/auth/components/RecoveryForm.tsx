import { useForm } from "react-hook-form";
import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@components/extras/Button";
import { MailIcon, ArrowLeftIcon } from "lucide-preact";
import {
	authForgotPasswordDto,
	type AuthForgotPasswordDto,
} from "../dtos/forgot-password.dto";
import { authForgotPasswordApi } from "../apis/auth.forgot-password.api";
import { sweetModal } from "@vigilio/sweet";
import { handlerError } from "@infrastructure/utils/client";

export default function RecoveryForm() {
	const recoveryForm = useForm<AuthForgotPasswordDto>({
		resolver: zodResolver(authForgotPasswordDto),
		defaultValues: {
			email: "",
		},
	});

	const forgotPasswordMutation = authForgotPasswordApi();

	function onSubmit(body: AuthForgotPasswordDto) {
		forgotPasswordMutation.mutate(body, {
			onSuccess(data) {
				sweetModal({
					icon: "success",
					title: "RECOVERY_SIGNAL_SENT",
					text: data.message || "A recovery link has been transmitted.",
					timer: 3000,
				});
				recoveryForm.reset();
			},
			onError(error) {
				handlerError(recoveryForm, error, "RECOVERY_LINK_FAILURE");
			},
		});
	}

	return (
		<div class="w-full max-w-md p-8 space-y-6 bg-card border border-border rounded-lg shadow-2xl relative overflow-hidden group">
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

			<div class="space-y-2 text-center">
				<h1 class="text-2xl font-bold tracking-tighter text-glow text-primary font-mono animate-glitch">
					RECOVERY_MODE
				</h1>
				<p class="text-muted-foreground font-mono text-xs tracking-widest uppercase">
					Restore Access Protocols
				</p>
			</div>

			<WebForm onSubmit={onSubmit} {...recoveryForm}>
				<WebForm.control<AuthForgotPasswordDto>
					name="email"
					title="Registered Email"
					placeholder="admin@system.core"
					ico={<MailIcon />}
					type="email"
				/>

				<Button
					type="submit"
					variant="primary"
					className="w-full mt-4"
					size="lg"
					isLoading={forgotPasswordMutation.isLoading || false}
					disabled={forgotPasswordMutation.isLoading || false}
					loading_title="PROCESSING..."
				>
					SEND_RECOVERY_LINK
				</Button>
			</WebForm>

			<div class="text-center mt-4">
				<a
					href="/auth/login"
					class="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors hover:glow"
				>
					<ArrowLeftIcon className="w-3 h-3 mr-1" />
					RETURN_TO_LOGIN
				</a>
			</div>
		</div>
	);
}


