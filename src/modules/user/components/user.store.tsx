import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Refetch } from "@infrastructure/types/client";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { sweetModal } from "@vigilio/sweet";
import { Lock, Mail, Phone, User, Users } from "lucide-preact";
import { useForm } from "react-hook-form";
import { userStoreApi } from "../apis/user.store.api";
import { USER_ROLE_OPTIONS } from "../const/user.const";
import type { UserIndexResponseDto } from "../dtos/user.response.dto";
import { type UserStoreDto, userStoreDto } from "../dtos/user.store.dto";

interface UserStoreProps {
	refetch: (data: Refetch<UserIndexResponseDto["results"]>) => void;
	onClose: () => void;
}

export function UserStore({ refetch, onClose }: UserStoreProps) {
	const userStoreMutation = userStoreApi();

	const userStoreForm = useForm<UserStoreDto>({
		resolver: zodResolver(userStoreDto),
		mode: "all",
	});

	const roles = USER_ROLE_OPTIONS.filter((r) => r.key !== "all").map((r) => ({
		key: r.key,
		value: r.value,
	}));

	function onUserStore(body: UserStoreDto) {
		userStoreMutation.mutate(body, {
			onSuccess(data) {
				refetch(data.user);
				sweetModal({
					icon: "success",
					title: "User invited successfully",
					text: "An invitation email has been sent.",
					timer: 1500,
					showConfirmButton: false,
				});
				onClose();
			},
			onError(error) {
				handlerError(userStoreForm, error);
			},
		});
	}

	return (
		<div class="flex flex-col gap-6 p-6">
			<div class="flex items-center gap-4 pb-4 border-b border-border">
				<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
					<Users size={24} />
				</div>
				<div>
					<h2 class="text-xl font-bold">Invite New User</h2>
					<p class="text-sm text-muted-foreground">
						Create a new account and send an invitation link.
					</p>
				</div>
			</div>

			<Form {...userStoreForm} onSubmit={onUserStore}>
				<div class="space-y-4">
					<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
						Account Details
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<UserStoreDto>
							name="username"
							title="Username"
							placeholder="johndoe"
							type="text"
							ico={<User size={16} />}
						/>
						<Form.control<UserStoreDto>
							name="email"
							title="Email Address"
							placeholder="john@example.com"
							type="email"
							ico={<Mail size={16} />}
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Form.control<UserStoreDto>
							name="password"
							title="Initial Password"
							placeholder="••••••••"
							type="password"
							ico={<Lock size={16} />}
						/>
						<Form.control<UserStoreDto>
							name="phone_number"
							title="Phone Number"
							placeholder="+1 (555) 000-0000"
							type="tel"
							ico={<Phone size={16} />}
						/>
					</div>

					<div class="pt-2"></div>
					<Form.control.select<UserStoreDto>
						name="role_id"
						title="Assign Role"
						placeholder="Select a role level"
						array={roles}
					/>
				</div>

				<div class="pt-6 mt-6 border-t border-border flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>
					<Form.button.submit
						title="Send Invitation"
						loading_title="Creating..."
						ico={<Mail size={16} />}
						isLoading={userStoreMutation.isLoading ?? false}
						disabled={userStoreMutation.isLoading ?? false}
					/>
				</div>
			</Form>
		</div>
	);
}
