import Form from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handlerError } from "@infrastructure/utils/client/handler-error";
import { userProfileUpdateApi } from "../../user/apis/user.profile-update.api";
import { authSessionApi } from "../../auth/apis/auth.session.api";
import { sweetModal } from "@vigilio/sweet";
import { User, Mail, Lock, Shield, Camera, Fingerprint, Phone } from "lucide-preact";
import { useEffect } from "preact/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@vigilio/preact-fetching";
import type { JSX } from "preact/jsx-runtime";

import { userProfileUpdateDto, type UserProfileUpdateDto } from "@modules/user/dtos/user.profile.update.dto";

export default function AdminCard() {
	// Use authSessionApi with useQuery
	const query = useQuery("auth-session", authSessionApi);
	const updateMutation = userProfileUpdateApi();

	const form = useForm<UserProfileUpdateDto>({
		resolver: zodResolver(userProfileUpdateDto) ,
		mode: "all",
	});

	useEffect(() => {
		if (query.isSuccess && query.data?.user) {
			form.reset({
				username: (query.data.user as any).username || query.data.user.full_name,
				email: query.data.user.email,
				avatar: (query.data.user as any).avatar || null,
			});
		}
	}, [query.isSuccess, query.data]);

	function onSubmit(data: UserProfileUpdateDto) {
		updateMutation.mutate(data , {
			onSuccess() {
				sweetModal({
					icon: "success",
					title: "PROFILE_SECURED",
					text: "Admin credentials synchronized.",
				});
				query.refetch();
			},
			onError(error) {
				handlerError(form, error, "Security Error");
			},
		});
	}

	let component: JSX.Element | null = null;

	if (query.isLoading) {
		component = (
			<div class="h-96 bg-zinc-950/40 rounded-3xl border border-white/5 animate-pulse" />
		);
	}

	if (query.isError) {
		component = (
			<div class="h-96 bg-zinc-950/40 rounded-3xl border border-white/5 flex items-center justify-center text-red-500 font-mono text-xs uppercase tracking-widest p-8 text-center">
				<Fingerprint size={32} class="mb-4 opacity-20 block mx-auto" />
				Error synchronizing with security core: {JSON.stringify(query.error)}
			</div>
		);
	}

	if (query.isSuccess && query.data) {
		component = (
			<div class="bg-zinc-950/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
				<div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

				<div class="flex flex-col items-center mb-8 relative">
					<div class="w-24 h-24 rounded-full bg-zinc-900 border-2 border-primary/20 p-1 mb-4 group-hover:border-primary/50 transition-colors relative">
						{query.data?.user && (
							<div class="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
								<User size={40} />
							</div>
						)}
						<div class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-4 border-zinc-950 shadow-xl cursor-pointer hover:scale-110 transition-transform">
							<Camera size={14} />
						</div>
					</div>
					<h2 class="text-xl font-black font-mono tracking-tight text-foreground uppercase italic group-hover:text-primary transition-colors">
						{query.data?.user?.full_name}
					</h2>
					<span class="text-[9px] font-black font-mono tracking-[0.3em] text-muted-foreground/40 uppercase">
						ROOT_ADMINISTRATOR
					</span>
				</div>

				<Form {...form} onSubmit={onSubmit}>
					<div class="space-y-6">
						<div class="space-y-4">
							<Form.control<UserProfileUpdateDto>
								name="username"
								title="SYSTEM_HANDLE"
								ico={<Fingerprint size={16} />}
							/>
							<Form.control<UserProfileUpdateDto>
								name="email"
								title="SECURITY_EMAIL"
								ico={<Mail size={16} />}
							/>
							<Form.control<UserProfileUpdateDto>
								name="phone_number"
								title="VOICE_UPLINK (PHONE)"
								ico={<Phone size={16} />}
							/>
							<Form.control<UserProfileUpdateDto>
								name="password"
								title="ACCESS_UPGRADE (NEW_PWD)"
								type="password"
								placeholder="Leave blank to keep current"
								ico={<Lock size={16} />}
							/>
						</div>

						<div class="space-y-4">
							<Form.control.file<UserProfileUpdateDto>
								name="avatar"
								title="PROFILE_IMAGE"
								ico={<Camera size={16} />}
								entity="user"
								property="avatar"
								typeFile="image"
								accept="image/*"
							/>
						</div>

						<div class="pt-4 border-t border-white/5">
							<div class="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
								<Shield size={20} class="text-primary animate-pulse" />
								<div>
									<span class="text-[9px] font-black uppercase tracking-widest text-primary block">
										SECURITY_CLEARANCE
									</span>
									<span class="text-[10px] text-muted-foreground">
										Admin-Level access to core systems 01.
									</span>
								</div>
							</div>

							<Form.button.submit
								title="AUTHORIZE_CHANGES"
								loading_title="AUTHORIZING..."
								isLoading={updateMutation.isLoading || false}
								disabled={updateMutation.isLoading || false}
								className="w-full bg-zinc-900 border border-white/10 text-white font-black py-4 tracking-[0.2em] uppercase rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
							/>
						</div>
					</div>
				</Form>
			</div>
		);
	}

	return component;
}
