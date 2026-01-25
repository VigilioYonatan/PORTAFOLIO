import { QrCode } from "lucide-preact";
import type { UserIndexSchema } from "../schemas/user.schema";

interface UserQrProps {
	user: UserIndexSchema;
}

export function UserQr({ user }: UserQrProps) {
	if (!user.qr_code_token) {
		return (
			<div class="text-center py-8 text-muted-foreground">
				Este usuario no tiene un código QR configurado.
			</div>
		);
	}

	// Generate QR code URL (using a QR code API)
	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
		user.qr_code_token,
	)}`;

	return (
		<div class="flex flex-col items-center gap-4">
			<div class="p-2 bg-primary/10 rounded-lg">
				<QrCode size={24} class="text-primary" />
			</div>
			<h3 class="text-lg font-semibold">Código QR de {user.username}</h3>
			<div class="bg-white p-4 rounded-lg">
				<img
					src={qrUrl}
					alt={`QR Code for ${user.username}`}
					width={200}
					height={200}
					class="block"
				/>
			</div>
			<p class="text-xs text-muted-foreground text-center max-w-xs">
				Escanea este código QR para autenticación rápida o acceso móvil.
			</p>
		</div>
	);
}
