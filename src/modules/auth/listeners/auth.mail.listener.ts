import type { Environments } from "@infrastructure/config/server";
import { MailService } from "@infrastructure/providers/mail/mail.service";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { UserForgotPasswordEvent } from "../events/user.forgot-password.event";

@Injectable()
export class AuthMailListener {
	private readonly logger = new Logger(AuthMailListener.name);

	constructor(
		private readonly mailService: MailService,
		private readonly configService: ConfigService<Environments>,
	) {}

	@OnEvent(UserForgotPasswordEvent.name, { async: true })
	async handleUserForgotPassword(
		event: UserForgotPasswordEvent,
	): Promise<void> {
		const { email, recoveryUrl } = event;
		this.logger.log(`Sending recovery email to ${email}`);

		try {
			await this.mailService.sendMail({
				from: this.configService.get("MAIL_USER"),
				to: email,
				subject: "Recuperación de contraseña",
				html: `
          <h1>Recuperación de contraseña</h1>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${recoveryUrl}">${recoveryUrl}</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `,
			});
			this.logger.log(`Recovery email sent successfully to ${email}`);
		} catch (error) {
			this.logger.error(
				`Failed to send recovery email to ${email}`,
				(error as Error).stack,
			);
		}
	}
}
