import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { cn } from "@infrastructure/utils/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { now } from "@infrastructure/utils/hybrid";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { sweetModal } from "@vigilio/sweet";
import { Edit, Phone, User } from "lucide-preact";
import { type Resolver, useForm } from "react-hook-form";
import { userUpdateApi } from "../apis/user.update.api";
import {
	getRoleBadgeInfo,
	USER_ROLE_OPTIONS,
	USER_STATUS_OPTIONS,
} from "../const/user.const";
import type { UserIndexResponseDto } from "../dtos/user.response.dto";
import { type UserUpdateDto, userUpdateDto } from "../dtos/user.update.dto";
import type { UserIndexSchema } from "../schemas/user.schema";

interface UserUpdateProps {
	user: UserIndexSchema;
	refetch: (data: Refetch<UserIndexResponseDto["results"]>) => void;
}

export function UserUpdate({ user, refetch }: UserUpdateProps) {
	const userUpdateMutation = userUpdateApi(user.id);

	const userUpdateForm = useForm<UserUpdateDto>({
		resolver: zodResolver(userUpdateDto) as Resolver<UserUpdateDto>,
		mode: "all",
		defaultValues: { ...user },
	});

	const roles = USER_ROLE_OPTIONS.filter((r) => r.key !== "all").map((r) => ({
		key: r.key,
		value: r.value,
	}));

	const statuses = USER_STATUS_OPTIONS.filter((s) => s.key !== "all").map(
		(s) => ({
			key: s.key,
			value: s.value,
		}),
	);

	const roleInfo = getRoleBadgeInfo(user.role_id);

	function onUserUpdate(body: UserUpdateDto) {
		sweetModal({
			title: "Update User?",
			text: "Are you sure you want to save these changes?",
			icon: "info",
			showCancelButton: true,
			confirmButtonText: "Save Changes",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				userUpdateMutation.mutate(body, {
					onSuccess() {
						refetch({ ...user, ...body, updated_at: now().toDate() });
						sweetModal({
							icon: "success",
							title: "User updated successfully",
							timer: 1500,
							showConfirmButton: false,
						});
					},
					onError(error) {
						handlerError(userUpdateForm, error);
					},
				});
			}
		});
	}

	return (
		<div class="flex flex-col gap-6">
			{/* Header with User Info */}
			<div class="flex items-center gap-4 pb-4 border-b border-border">
				<div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden border-2 border-border">
					{user.avatar?.[0] ? (
						<img
							src={
								printFileWithDimension(
									user.avatar,
									DIMENSION_IMAGE.xs,
									window.env.STORAGE_URL,
								)[0]
							}
							alt={user.username}
							title={user.username}
							width={DIMENSION_IMAGE.xs}
							height={DIMENSION_IMAGE.xs}
							class="w-full h-full object-cover"
						/>
					) : (
						<span class="text-lg font-bold text-primary">
							{user.username.slice(0, 2).toUpperCase()}
						</span>
					)}
				</div>
				<div class="flex-1">
					<div class="flex items-center gap-2">
						<h2 class="text-xl font-bold">{user.username}</h2>
						<span
							class={cn(
								"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
								roleInfo.className,
							)}
						>
							{roleInfo.label}
						</span>
					</div>
					<p class="text-sm text-muted-foreground">{user.email}</p>
				</div>
				<div class="p-2 text-muted-foreground">
					<Edit size={20} />
				</div>
			</div>

			{/* Form */}
			<Form {...userUpdateForm} onSubmit={onUserUpdate}>
				{/* Account Info Section */}
				<div class="space-y-4">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Account Information
					</h3>
					<Form.control<UserUpdateDto>
						name="username"
						title="Username"
						placeholder="johndoe"
						type="text"
						ico={<User size={16} />}
					/>

					<Form.control<UserUpdateDto>
						name="phone_number"
						title="Phone Number"
						placeholder="+1 (555) 000-0000"
						type="tel"
						ico={<Phone size={16} />}
					/>
				</div>

				{/* Role & Status Section */}
				<div class="space-y-4 pt-4 border-t border-border mt-6">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Role & Status
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control.select<UserUpdateDto>
							name="role_id"
							title="Role"
							placeholder="Select role"
							array={roles}
						/>
						<Form.control.select<UserUpdateDto>
							name="status"
							title="Status"
							placeholder="Select status"
							array={statuses}
						/>
					</div>
				</div>

				{/* Security Section */}
				<div class="space-y-4 pt-4 border-t border-border mt-6">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Security Settings
					</h3>
					<Form.control.toggle<UserUpdateDto>
						name="is_mfa_enabled"
						title="Multi-Factor Authentication"
						question="Enable MFA for enhanced security. Users will need to verify their identity with a second factor."
					/>
				</div>

				{/* Submit */}
				<div class="pt-6 mt-6 border-t border-border">
					<Form.button.submit
						title="Save Changes"
						loading_title="Saving..."
						isLoading={userUpdateMutation.isLoading ?? false}
						disabled={userUpdateMutation.isLoading ?? false}
					/>
				</div>
			</Form>
		</div>
	);
}
