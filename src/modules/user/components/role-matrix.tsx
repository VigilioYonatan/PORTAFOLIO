import { Card } from "@components/extras/card";
import { Check, Shield, X } from "lucide-preact";

export function RoleMatrix() {
	const permissions = [
		{
			feature: "User Management",
			owner: true,
			admin: true,
			user: false,
		},
		{
			feature: "Tenant Settings",
			owner: true,
			admin: true,
			user: false,
		},
		{
			feature: "Document Upload",
			owner: true,
			admin: true,
			user: true,
		},
		{
			feature: "Chat History",
			owner: true,
			admin: true,
			user: true,
		},
		{
			feature: "Recruitment (Jobs)",
			owner: true,
			admin: true,
			user: false,
		},
		{
			feature: "Recruitment (Candidates)",
			owner: true,
			admin: true,
			user: false,
		},
		{
			feature: "Billing & Plans",
			owner: true,
			admin: false,
			user: false,
		},
		{
			feature: "API Configuration",
			owner: true,
			admin: false,
			user: false,
		},
	];

	return (
		<Card className="p-0 overflow-hidden bg-zinc-950/40 border border-white/5 backdrop-blur-xl group">
			<div class="p-5 border-b border-white/5 bg-linear-to-r from-primary/5 via-transparent to-transparent flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
						<Shield size={20} />
					</div>
					<div>
						<span class="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 block">
							SECURITY_LAYER_v4.0
						</span>
						<h3 class="text-lg font-black tracking-tight uppercase italic text-foreground leading-none">
							Role Permissions Matrix
						</h3>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<div class="flex flex-col items-end">
						<span class="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">
							AUTH_PROTOCOL
						</span>
						<span class="text-[10px] font-mono text-primary italic">
							ENCRYPTED_SIGNAL
						</span>
					</div>
				</div>
			</div>

			<div class="overflow-x-auto overflow-y-hidden custom-scrollbar">
				<table class="w-full text-left border-collapse">
					<thead>
						<tr class="bg-white/2 border-b border-white/5">
							<th class="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
								Feature / Capability
							</th>
							<th class="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
								OWNER
							</th>
							<th class="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
								ADMIN
							</th>
							<th class="py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
								USER
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{permissions.map((perm, idx) => (
							<tr
								key={idx}
								class="hover:bg-primary/3 transition-colors border-b border-white/5 last:border-0 group/row"
							>
								<td class="py-4 px-6 text-sm">
									<span class="font-bold text-foreground tracking-tight underline-offset-4 decoration-primary/30 decoration-dotted group-hover/row:text-primary transition-colors">
										{perm.feature}
									</span>
								</td>
								<td class="py-4 px-6 text-sm">
									<div class="flex justify-center">
										{perm.owner ? (
											<Check
												size={18}
												class="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
											/>
										) : (
											<X size={18} class="text-muted-foreground/20" />
										)}
									</div>
								</td>
								<td class="py-4 px-6 text-sm">
									<div class="flex justify-center">
										{perm.admin ? (
											<Check
												size={18}
												class="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
											/>
										) : (
											<X size={18} class="text-muted-foreground/20" />
										)}
									</div>
								</td>
								<td class="py-4 px-6 text-sm">
									<div class="flex justify-center">
										{perm.user ? (
											<Check
												size={18}
												class="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
											/>
										) : (
											<X size={18} class="text-muted-foreground/20" />
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div class="p-4 border-t border-white/5 bg-white/1">
				<div class="flex items-center justify-center gap-2">
					<span class="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
					<span class="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.4em]">
						NEURAL_ROLE_VALIDATION_ACTIVE
					</span>
					<span class="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
				</div>
			</div>
		</Card>
	);
}
