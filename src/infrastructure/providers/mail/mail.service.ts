import type { Environments } from "@infrastructure/config/server";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type { MailOptions } from "nodemailer/lib/json-transport";

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;
	constructor(private readonly configService: ConfigService<Environments>) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get("MAIL_HOST"), // o tu proveedor SMTP
			port: this.configService.get("MAIL_PORT"),
			secure: this.configService.get("NODE_ENV") === "DEVELOPMENT", // true para 465, false para otros puertos
			auth: {
				user: this.configService.get("MAIL_USER"),
				pass: this.configService.get("MAIL_PASS"),
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	async sendMail(mailOptions: MailOptions) {
		return new Promise((res, rej) => {
			this.transporter.sendMail(mailOptions, (error, _) => {
				if (error) {
					rej(error);
				}
				res(true);
			});
		});
	}
}
