import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import Modal from "@components/extras/modal";
import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, handlerError, sizeIcon } from "@infrastructure/utils/client";
import {
	formatDateTz,
	printFileWithDimension,
} from "@infrastructure/utils/hybrid";
import { authMfaDisableApi } from "@modules/auth/apis/auth.mfa-disable.api";
import MfaSetup from "@modules/auth/components/mfa-setup";
import {
	DIMENSION_IMAGE,
	UPLOAD_CONFIG,
} from "@modules/uploads/const/upload.const";
import { useSignal } from "@preact/signals";
import { useAuthStore } from "@src/stores/auth.store";
import { sweetModal } from "@vigilio/sweet";
import {
	Camera,
	Eye,
	EyeOff,
	History,
	KeyRound,
	Lock,
	Mail,
	Phone,
	Shield,
	Smartphone,
	User,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";
import { userAvatarUpdateApi } from "../apis/user.avatar-update.api";
import { userPasswordChangeApi } from "../apis/user.password-change.api";
import { userProfileUpdateApi } from "../apis/user.profile-update.api";
import {
	type UserAvatarUpdateDto,
	userAvatarUpdateDto,
} from "../dtos/user.avatar.update.dto";
import type { UserPasswordChangeDto } from "../dtos/user.password-change.dto";
import { userPasswordChangeDto } from "../dtos/user.password-change.dto";
import type { UserProfileUpdateDto } from "../dtos/user.profile.update.dto";
import { userProfileUpdateDto } from "../dtos/user.profile.update.dto";
import { SessionManager } from "./session-manager";

export default function ProfileIndex() {
	const authStore = useAuthStore();
	const user = authStore.state.value;

	if (!user) return <div class="p-8 text-center">Cargando perfil...</div>;

	const showCurrentPassword = useSignal<boolean>(false);
	const showNewPassword = useSignal<boolean>(false);
	const showConfirmPassword = useSignal<boolean>(false);
	const isMfaModalOpen = useSignal<boolean>(false);

	// Profile form
	const profileForm = useForm<UserProfileUpdateDto>({
		resolver: zodResolver(userProfileUpdateDto),
		mode: "all",
		defaultValues: { ...user },
	});

	// Password form
	const passwordForm = useForm<UserPasswordChangeDto>({
		resolver: zodResolver(userPasswordChangeDto),
		mode: "all",
	});

	// Avatar form
	const avatarForm = useForm<UserAvatarUpdateDto>({
		resolver: zodResolver(userAvatarUpdateDto),
		mode: "all",
		defaultValues: { ...user },
	});

	const profileMutation = userProfileUpdateApi();
	const passwordMutation = userPasswordChangeApi();
	const avatarMutation = userAvatarUpdateApi();
	const disableMfaMutation = authMfaDisableApi();

	function onProfileUpdate(body: UserProfileUpdateDto) {
		profileMutation.mutate(body, {
			onSuccess() {
				authStore.methods.onUserUpdate(body);
				sweetModal({
					icon: "success",
					title: "Perfil actualizado",
					text: "Tus datos personales han sido guardados.",
					timer: 2000,
					showConfirmButton: false,
				});
			},
			onError(error) {
				handlerError(profileForm, error, "Error actualizando perfil");
			},
		});
	}

	function onAvatarUpdate(body: UserAvatarUpdateDto) {
		avatarMutation.mutate(body, {
			onSuccess(data) {
				authStore.methods.onUserUpdate({ avatar: body.avatar });
				sweetModal({
					icon: "success",
					title: "Foto actualizada",
					timer: 1500,
					showConfirmButton: false,
				});
			},
			onError(error) {
				handlerError(avatarForm, error, "Error actualizando avatar");
			},
		});
	}

	function onPasswordChange(body: UserPasswordChangeDto) {
		sweetModal({
			title: "¿Cambiar contraseña?",
			text: "Esta acción cerrará tus otras sesiones activas por seguridad.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Confirmar Cambio",
			cancelButtonText: "Cancelar",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				passwordMutation.mutate(body, {
					onSuccess() {
						passwordForm.reset();
						sweetModal({
							icon: "success",
							title: "Contraseña actualizada",
							text: "Tu nueva contraseña ha sido establecida correctamente.",
							timer: 2000,
							showConfirmButton: false,
						});
					},
					onError(error) {
						handlerError(passwordForm, error, "Error cambiando contraseña");
					},
				});
			}
		});
	}

	// Handle avatar change when file is selected
	const avatarValue = avatarForm.watch("avatar");
	useEffect(() => {
		if (avatarForm.formState.isDirty) {
			avatarForm.handleSubmit(onAvatarUpdate)();
		}
	}, [avatarValue]);

	return (
		<div class="space-y-8 animate-in fade-in duration-500">
			{/* Header Section */}
			<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
				<div>
					<h1 class="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
						Mi Perfil
					</h1>
					<p class="text-muted-foreground mt-1">
						Gestiona tu identidad, seguridad y preferencias de cuenta.
					</p>
				</div>
				<div class="flex items-center gap-3">
					<Badge
						variant="outline"
						className="px-3 py-1 border-primary/20 bg-primary/5 text-primary"
					>
						ID: #{user.id}
					</Badge>
					<Badge
						variant={user.status === "ACTIVE" ? "success" : "warning"}
						className="px-3 py-1"
					>
						Cuenta {user.status === "ACTIVE" ? "Activa" : "Pendiente"}
					</Badge>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Lateral Column - Profile Summary & Quick Actions */}
				<div class="lg:col-span-4 space-y-6">
					{/* Avatar Card */}
					<Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md group">
						<div class="h-24 bg-linear-to-br from-primary/20 via-primary/5 to-transparent relative" />
						<div class="p-6 -mt-16 relative">
							<div class="flex flex-col items-center">
								<div class="relative group/avatar">
									<div class="w-32 h-32 rounded-3xl overflow-hidden border-4 border-card shadow-xl transition-transform group-hover/avatar:scale-[1.02]">
										<img
											src={
												printFileWithDimension(
													user.avatar || [],
													DIMENSION_IMAGE.md,
												)[0]
											}
											alt={user.username}
											title={user.username}
											width={DIMENSION_IMAGE.md}
											height={DIMENSION_IMAGE.md}
											class="w-full h-full object-cover"
										/>
									</div>
									<label
										htmlFor="avatar-upload"
										class="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 z-10"
									>
										<Camera {...sizeIcon.small} />
									</label>
								</div>
								<h2 class="text-xl font-bold mt-4">{user.username}</h2>
								<p class="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
									<Mail {...sizeIcon.xs} />
									{user.email}
								</p>
							</div>

							<div class="mt-8 pt-6 border-t border-border/50 space-y-4">
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground flex items-center gap-2">
										<History {...sizeIcon.xs} />
										Miembro desde
									</span>
									<span class="font-medium">
										{formatDateTz(user.created_at)}
									</span>
								</div>
								<div class="flex items-center justify-between text-sm">
									<span class="text-muted-foreground flex items-center gap-2">
										<Shield {...sizeIcon.xs} />
										Rol de usuario
									</span>
									<Badge
										variant="outline"
										className="font-mono text-[10px] uppercase"
									>
										{user.is_superuser ? "Super Admin" : "Usuario"}
									</Badge>
								</div>
							</div>

							{/* Avatar Form (Hidden) */}
							<Form
								{...avatarForm}
								onSubmit={onAvatarUpdate}
								className="hidden"
							>
								<Form.control.file<UserAvatarUpdateDto>
									id="avatar-upload"
									name="avatar"
									title="Avatar"
									entity="user"
									property="avatar"
									accept={UPLOAD_CONFIG.user.avatar?.mime_types.join(",")}
									typeFile="image"
								/>
							</Form>
						</div>
					</Card>

					{/* Security Integration Card */}
					<Card className="p-6 border-primary/20 bg-linear-to-br from-primary/10 via-background to-background relative overflow-hidden group">
						<div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700" />
						<div class="relative space-y-4">
							<div class="flex items-start gap-4">
								<div class="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
									<Smartphone {...sizeIcon.medium} class="text-primary" />
								</div>
								<div>
									<h4 class="font-bold">Doble Factor (MFA)</h4>
									<p class="text-xs text-muted-foreground leading-relaxed mt-1">
										Asegura tu cuenta con códigos temporales generados en tu
										móvil.
									</p>
								</div>
							</div>
							<div class="pt-2">
								<button
									type="button"
									onClick={() => {
										if (user.is_mfa_enabled) {
											sweetModal({
												title: "¿Desactivar MFA?",
												text: "Para volver a activarlo deberás escanear un nuevo código QR.",
												icon: "warning",
												showCancelButton: true,
												confirmButtonText: "Sí, desactivar",
												cancelButtonText: "Cancelar",
											}).then((result) => {
												if (result.isConfirmed) {
													disableMfaMutation.mutate(undefined, {
														onSuccess() {
															authStore.methods.onUserUpdate({
																is_mfa_enabled: false,
															});
														},
													});
												}
											});
										} else {
											isMfaModalOpen.value = true;
										}
									}}
									disabled={disableMfaMutation.isLoading || false}
									class={cn(
										"w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50",
										user.is_mfa_enabled
											? "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20"
											: "bg-primary text-primary-foreground hover:shadow-primary/20 hover:shadow-lg",
									)}
								>
									{user.is_mfa_enabled ? (
										<>
											{disableMfaMutation.isLoading ? (
												"Desactivando..."
											) : (
												<>
													<KeyRound {...sizeIcon.small} /> Desactivar 2FA
												</>
											)}
										</>
									) : (
										<>Configurar 2FA →</>
									)}
								</button>
							</div>
						</div>
					</Card>
				</div>

				{/* Main Forms Column */}
				<div class="lg:col-span-8 space-y-8">
					{/* Session Manager */}
					<SessionManager />

					{/* Personal Information Form */}
					<Card className="p-8 border-border/50 shadow-sm relative overflow-hidden">
						<div class="absolute top-0 right-0 p-4 opacity-5">
							<User size={120} />
						</div>
						<div class="relative">
							<div class="flex items-center gap-3 mb-8">
								<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<User {...sizeIcon.small} class="text-primary" />
								</div>
								<div>
									<h3 class="text-lg font-bold">Información Personal</h3>
									<p class="text-xs text-muted-foreground">
										Actualiza tus datos de contacto básicos.
									</p>
								</div>
							</div>

							<Form {...profileForm} onSubmit={onProfileUpdate}>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
									<Form.control<UserProfileUpdateDto>
										name="username"
										title="Nombre de Usuario"
										placeholder="Tu apodo o nombre"
										ico={<User {...sizeIcon.small} />}
										required
									/>
									<Form.control<UserProfileUpdateDto>
										name="phone_number"
										title="Teléfono"
										placeholder="+51 987 654 321"
										ico={<Phone {...sizeIcon.small} />}
									/>
								</div>

								<div class="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between gap-4">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground border border-border/50">
											<Mail {...sizeIcon.xs} />
										</div>
										<div>
											<p class="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
												Correo Electrónico
											</p>
											<p class="text-sm font-medium">{user.email}</p>
										</div>
									</div>
									<Badge variant="default" className="text-[10px] h-6">
										Verificado
									</Badge>
								</div>

								<div class="flex justify-end mt-8">
									<Form.button.submit
										title="Guardar Cambios"
										loading_title="Guardando..."
										isLoading={profileMutation.isLoading || false}
										disabled={profileMutation.isLoading || false}
										className="rounded-xl px-8 py-6 font-bold"
									/>
								</div>
							</Form>
						</div>
					</Card>

					{/* Change Password Form */}
					<Card className="p-8 border-border/50 shadow-sm relative overflow-hidden">
						<div class="absolute top-0 right-0 p-4 opacity-5">
							<Lock size={120} />
						</div>
						<div class="relative">
							<div class="flex items-center gap-3 mb-8">
								<div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
									<Lock {...sizeIcon.small} class="text-orange-600" />
								</div>
								<div>
									<h3 class="text-lg font-bold">Cambiar Contraseña</h3>
									<p class="text-xs text-muted-foreground">
										Te recomendamos usar una contraseña fuerte y única.
									</p>
								</div>
							</div>

							<Form {...passwordForm} onSubmit={onPasswordChange}>
								<div class="space-y-6">
									<div>
										<div class="relative group">
											<Form.control<UserPasswordChangeDto>
												name="current_password"
												title="Contraseña Actual"
												type={showCurrentPassword.value ? "text" : "password"}
												placeholder="••••••••••••"
												ico={<Lock {...sizeIcon.small} />}
												required
											/>
											<button
												type="button"
												onClick={() => {
													showCurrentPassword.value =
														!showCurrentPassword.value;
												}}
												class="absolute end-4 top-[45px] text-muted-foreground hover:text-foreground transition-colors p-1"
											>
												{showCurrentPassword.value ? (
													<EyeOff {...sizeIcon.small} />
												) : (
													<Eye {...sizeIcon.small} />
												)}
											</button>
										</div>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div class="relative">
											<Form.control<UserPasswordChangeDto>
												name="new_password"
												title="Nueva Contraseña"
												type={showNewPassword.value ? "text" : "password"}
												placeholder="Contraseña robusta"
												ico={<Lock {...sizeIcon.small} />}
												required
											/>
											<button
												type="button"
												onClick={() => {
													showNewPassword.value = !showNewPassword.value;
												}}
												class="absolute end-4 top-[45px] text-muted-foreground hover:text-foreground transition-colors p-1"
											>
												{showNewPassword.value ? (
													<EyeOff {...sizeIcon.small} />
												) : (
													<Eye {...sizeIcon.small} />
												)}
											</button>
										</div>
										<div class="relative">
											<Form.control<UserPasswordChangeDto>
												name="confirm_password"
												title="Confirmar Contraseña"
												type={showConfirmPassword.value ? "text" : "password"}
												placeholder="Repite la contraseña"
												ico={<Lock {...sizeIcon.small} />}
												required
											/>
											<button
												type="button"
												onClick={() => {
													showConfirmPassword.value =
														!showConfirmPassword.value;
												}}
												class="absolute end-4 top-[45px] text-muted-foreground hover:text-foreground transition-colors p-1"
											>
												{showConfirmPassword.value ? (
													<EyeOff {...sizeIcon.small} />
												) : (
													<Eye {...sizeIcon.small} />
												)}
											</button>
										</div>
									</div>
								</div>

								<div class="flex items-center justify-between mt-10 p-4 border-t border-border/50">
									<div class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
										<History {...sizeIcon.xs} />
										<span>Último cambio: 90 días atrás</span>
									</div>
									<div class="flex gap-4">
										<button
											type="button"
											onClick={() => {
												passwordForm.reset();
											}}
											class="px-6 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
										>
											Limpiar
										</button>
										<Form.button.submit
											title="Actualizar Seguridad"
											loading_title="Actualizando..."
											isLoading={passwordMutation.isLoading || false}
											disabled={passwordMutation.isLoading || false}
											className="rounded-xl px-8 shadow-lg shadow-orange-500/10 bg-orange-600 hover:bg-orange-700"
										/>
									</div>
								</div>
							</Form>
						</div>
					</Card>
				</div>
			</div>

			{/* MFA Setup Modal */}
			<Modal
				isOpen={isMfaModalOpen.value}
				onClose={() => {
					isMfaModalOpen.value = false;
				}}
				contentClassName="max-w-2xl w-full p-0 overflow-hidden bg-card border-border shadow-2xl rounded-3xl"
			>
				<div class="p-8 md:p-12">
					<MfaSetup
						onSuccess={() => {
							authStore.methods.onUserUpdate({ is_mfa_enabled: true });
							isMfaModalOpen.value = false;
						}}
					/>
				</div>
			</Modal>
		</div>
	);
}
