import { Card } from "@components/extras/card";
import { Check, Shield, X } from "lucide-preact";
import VigilioTable from "@components/tables";

export function RoleMatrix() {
	// This would typically come from an API, but for now we'll hardcode the system roles
	// as defined in rules-business.md #3
	const permissions = [
		{
			feature: "User Management",
			admin: true,
			owner: true,
			user: false,
		},
		{
			feature: "Tenant Settings",
			admin: true,
			owner: true,
			user: false,
		},
		{
			feature: "Document Upload",
			admin: true,
			owner: true,
			user: true,
		},
		{
			feature: "Chat History",
			admin: true,
			owner: true,
			user: true,
		},
		{
			feature: "Recruitment (Jobs)",
			admin: true,
			owner: true,
			user: false,
		},
		{
			feature: "Recruitment (Candidates)",
			admin: true,
			owner: true,
			user: false,
		},
		{
			feature: "Billing & Plans",
			admin: false,
			owner: true,
			user: false,
		},
		{
			feature: "API Configuration",
			admin: false,
			owner: true,
			user: false,
		},
	];

	return (
		<Card className="p-0 overflow-hidden">
			<div class="p-4 border-b border-border bg-muted/20">
				<h3 class="font-bold flex items-center gap-2">
					<Shield size={18} class="text-primary" />
					Role Permissions Matrix
				</h3>
			</div>
			<div class="overflow-x-auto">
				<VigilioTable.table className="w-full text-sm">
					<VigilioTable.thead>
						<VigilioTable.thead.row className="bg-muted/50 border-b border-border">
							<th class="text-left py-3 px-4 font-semibold text-muted-foreground w-1/3 text-xs uppercase tracking-widest">
								Feature / Capability
							</th>
							<th class="text-center py-3 px-4 font-bold text-primary text-xs uppercase tracking-widest">
								OWNER
							</th>
							<th class="text-center py-3 px-4 font-bold text-blue-500 text-xs uppercase tracking-widest">
								ADMIN
							</th>
							<th class="text-center py-3 px-4 font-bold text-green-500 text-xs uppercase tracking-widest">
								USER
							</th>
						</VigilioTable.thead.row>
					</VigilioTable.thead>
					<VigilioTable.tbody className="divide-y divide-border">
						{permissions.map((perm, idx) => (
							<tr key={idx} class="hover:bg-muted/10 transition-colors">
								<td class="py-3 px-4 font-medium text-foreground">
									{perm.feature}
								</td>
								<td class="py-3 px-4 text-center">
									{perm.owner ? (
										<Check size={18} class="mx-auto text-primary" />
									) : (
										<X size={18} class="mx-auto text-muted-foreground/30" />
									)}
								</td>
								<td class="py-3 px-4 text-center">
									{perm.admin ? (
										<Check size={18} class="mx-auto text-blue-500" />
									) : (
										<X size={18} class="mx-auto text-muted-foreground/30" />
									)}
								</td>
								<td class="py-3 px-4 text-center">
									{perm.user ? (
										<Check size={18} class="mx-auto text-green-500" />
									) : (
										<X size={18} class="mx-auto text-muted-foreground/30" />
									)}
								</td>
							</tr>
						))}
					</VigilioTable.tbody>
				</VigilioTable.table>
			</div>
		</Card>
	);
}
