import WebForm from "@components/web_form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sizeIcon } from "@infrastructure/utils/client";
import { type Lang, useTranslations } from "@src/i18n";
import { sweetModal } from "@vigilio/sweet";
import { ArrowRight, Lock } from "lucide-preact";
import { useForm } from "react-hook-form";
import { authResetPasswordApi } from "../apis/auth.reset-password.api";
import {
	type AuthResetPasswordDto,
	authResetPasswordDto,
} from "../dtos/reset-password.dto";

interface ResetPasswordFormProps {
	token: string;
	lang?: Lang;
}

export function ResetPasswordForm({
	token,
	lang = "es",
}: ResetPasswordFormProps) {
	const t = useTranslations(lang);
	const resetPasswordMutation = authResetPasswordApi();

	const resetForm = useForm<AuthResetPasswordDto>({
		resolver: zodResolver(authResetPasswordDto),
	});

	function onSubmit(data: AuthResetPasswordDto) {
		resetPasswordMutation.mutate(
			{ ...data, token },
			{
				onSuccess() {
					sweetModal({
						title: t("auth.reset.success.title"),
						text: t("auth.reset.success.message"),
						icon: "success",
						confirmButtonText: t("auth.reset.success.back"),
					}).then(() => {
						window.location.href = "/auth/login";
					});
				},
			},
		);
	}

	return (
		<WebForm<AuthResetPasswordDto>
			{...resetForm}
			onSubmit={onSubmit}
			className="space-y-6"
		>
			<input type="hidden" {...resetForm.register("token")} />

			<div class="space-y-4">
				<WebForm.control<AuthResetPasswordDto>
					name="new_password"
					title={t("auth.reset.new_password")}
					type="password"
					placeholder="••••••••••••"
					required
					className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					ico={<Lock {...sizeIcon.small} />}
				/>

				<WebForm.control<AuthResetPasswordDto>
					name="repeat_password"
					title={t("auth.reset.confirm_password")}
					type="password"
					placeholder="••••••••••••"
					required
					className="bg-zinc-900/50 border-zinc-800/50 focus:bg-zinc-900 transition-all rounded-xl h-12"
					ico={<Lock {...sizeIcon.small} />}
				/>
			</div>

			{resetPasswordMutation.error && (
				<div class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center">
					{resetPasswordMutation.error.message}
				</div>
			)}

			<div class="pt-2">
				<WebForm.button.submit
					disabled={resetPasswordMutation.isLoading || false}
					isLoading={resetPasswordMutation.isLoading || false}
					title={t("auth.reset.submit")}
					loading_title={t("auth.reset.submitting")}
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
	);
}

export default ResetPasswordForm;
