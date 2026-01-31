import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import EllipsisMenu from "@components/extras/ellipsis-menu";
import Modal from "@components/extras/modal";
import VigilioTable from "@components/tables";
import environments from "@infrastructure/config/client/environments.config";
import { cn, sizeIcon } from "@infrastructure/utils/client";
import dayjs from "@infrastructure/utils/hybrid/date.utils";
import { printFileWithDimension } from "@infrastructure/utils/hybrid/file.utils";
import { DIMENSION_IMAGE } from "@modules/uploads/const/upload.const";
import { useComputed, useSignal } from "@preact/signals";
import { useTable } from "@vigilio/preact-table";
import { sweetModal } from "@vigilio/sweet";
import type { LucideIcon } from "lucide-preact";
import {
	ChevronDown,
	Download,
	Edit,
	Eye,
	Gift,
	Plus,
	QrCode,
	Search,
	Shield,
	Trash,
	Users,
	UserX,
	Zap,
} from "lucide-preact";
import { useEffect } from "preact/hooks";
import { userDestroyApi } from "../apis/user.destroy.api";
import {
	type UserIndexMethods,
	type UserIndexSecondaryPaginator,
	userIndexApi,
} from "../apis/user.index.api";
import { getRoleBadgeInfo, USER_ROLE_OPTIONS } from "../const/user.const";
import type { UserIndexSchema } from "../schemas/user.schema";
import { AuditLog } from "./audit-log";
import { RoleMatrix } from "./role-matrix";
import { UserQr } from "./user-qr";
import { UserShow } from "./user-show";
import { UserStore } from "./user-store";
import { UserUpdate } from "./user-update";

export type UserViewMode = "users" | "roles" | "activity";

export default function UserIndex() {
	// Bulk selection state
	const selectedUsers = useSignal<Set<number>>(new Set());
	const selectAll = useSignal<boolean>(false);

	// View state
	const view = useSignal<UserViewMode>("users");

	// Modal states
	const userStore = useSignal<boolean>(false);
	const userUpdate = useSignal<UserIndexSchema | null>(null);
	const userShow = useSignal<UserIndexSchema | null>(null);
	const userQr = useSignal<UserIndexSchema | null>(null);

	const userDestroy = userDestroyApi();

	const table = useTable<
		UserIndexSchema,
		UserIndexSecondaryPaginator,
		UserIndexMethods
	>({
		columns: [
			{
				key: "select",
				header: "",
				cell: (row) => (
					<input
						type="checkbox"
						class="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
						checked={selectedUsers.value.has(row.id)}
						onChange={(e) => {
							const newSet = new Set(selectedUsers.value);
							if (e.currentTarget.checked) {
								newSet.add(row.id);
							} else {
								newSet.delete(row.id);
							}
							selectedUsers.value = newSet;
						}}
					/>
				),
			},
			{
				key: "username",
				header: "USERNAME",
				isSort: true,
				cell: (row) => (
					<div class="flex items-center gap-3">
						<div
							data-testid={`avatar-${row.id}`}
							class="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shrink-0"
						>
							{row.avatar?.[0] ? (
								<img
									src={
										printFileWithDimension(
											row.avatar,
											DIMENSION_IMAGE.xs,
											environments.STORAGE_URL,
										)[0]
									}
									alt={row.username}
									title={row.username}
									width={DIMENSION_IMAGE.xs}
									height={DIMENSION_IMAGE.xs}
									class="w-full h-full object-cover"
								/>
							) : (
								<span class="text-xs font-black text-primary">
									{row.username.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
						<span class="font-medium text-foreground">{row.username}</span>
					</div>
				),
			},
			{
				key: "email",
				header: "EMAIL ADDRESS",
				isSort: true,
				cell: (row) => <span class="text-muted-foreground">{row.email}</span>,
			},
			{
				key: "role_id",
				header: "ROLE",
				isSort: true,
				cell: (row) => {
					const roleInfo = getRoleBadgeInfo(row.role_id);
					return (
						<Badge
							data-testid={`role-${row.id}`}
							variant={roleInfo.variant}
							className="uppercase"
						>
							{roleInfo.label}
						</Badge>
					);
				},
			},
			{
				key: "is_mfa_enabled",
				header: "MFA STATUS",
				isSort: true,
				cell: (row) => {
					return row.is_mfa_enabled ? (
						<Badge
							data-testid={`mfa-${row.id}`}
							variant="success"
							className="uppercase"
						>
							<span class="w-2 h-2 rounded-full bg-green-500 mr-2" />
							Enabled
						</Badge>
					) : row.qr_code_token ? (
						<Badge
							data-testid={`mfa-${row.id}`}
							variant="warning"
							className="uppercase"
						>
							<span class="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
							Pending
						</Badge>
					) : (
						<span class="text-muted-foreground text-sm">Not set</span>
					);
				},
			},
			{
				key: "last_login_at",
				header: "LAST ACTIVE",
				isSort: true,
				cell: (row) => {
					if (!row.last_login_at) {
						return <span class="text-muted-foreground text-sm">Never</span>;
					}
					const loginDate = dayjs(row.last_login_at);
					const nowTime = dayjs();
					const diffMins = nowTime.diff(loginDate, "minute");
					const diffHours = nowTime.diff(loginDate, "hour");
					const diffDays = nowTime.diff(loginDate, "day");

					let timeAgo: string;
					if (diffMins < 1) {
						timeAgo = "Just now";
					} else if (diffMins < 60) {
						timeAgo = `${diffMins} minutes ago`;
					} else if (diffHours < 24) {
						timeAgo = `${diffHours} hours ago`;
					} else {
						timeAgo = `${diffDays} days ago`;
					}

					return <span class="text-sm text-foreground">{timeAgo}</span>;
				},
			},
			{
				key: "action",
				header: "ACTIONS",
				cell: (row) => (
					<div class="flex justify-end pr-2">
						<EllipsisMenu isLoading={userDestroy.isLoading || false}>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
								onClick={() => {
									userShow.value = row;
								}}
							>
								<Eye size={14} />
								View Details
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
								onClick={() => {
									userUpdate.value = row;
								}}
							>
								<Edit size={14} />
								Edit User
							</button>
							{row.qr_code_token ? (
								<button
									type="button"
									class="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
									onClick={() => {
										userQr.value = row;
									}}
								>
									<QrCode size={14} />
									View QR Code
								</button>
							) : null}
							<div class="h-px bg-border my-1" />
							<button
								type="button"
								class="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
								onClick={() => {
									sweetModal({
										title: "Delete User?",
										text: "This action cannot be undone. The user will be soft-deleted.",
										icon: "danger",
										showCancelButton: true,
										confirmButtonText: "Delete",
									}).then(({ isConfirmed }) => {
										if (isConfirmed) {
											userDestroy.mutate(row.id, {
												onSuccess() {
													table.updateData((results, count) => ({
														result: results.filter(
															(item) => item.id !== row.id,
														),
														count: count - 1,
													}));
													sweetModal({
														icon: "success",
														title: "User deleted",
														timer: 1500,
														showConfirmButton: false,
													});
												},
											});
										}
									});
								}}
							>
								<Trash size={14} />
								Delete User
							</button>
						</EllipsisMenu>
					</div>
				),
			},
		],
		pagination: { limit: 10 },
	});

	const userIndex = userIndexApi(table);

	useEffect(() => {
		userIndex.refetch();
	}, [
		table.pagination.value.offset,
		table.pagination.value.limit,
		table.search.debounceTerm,
		table.sort.value,
		table.filters.value,
	]);

	const stats = {
		total: userIndex.data?.count || 0,
		totalChange: "+12%",
		activeSessions: 412,
		activeChange: "+5%",
		pendingInvites: 18,
	};

	const selectedCount = useComputed(() => selectedUsers.value.size);
	const hasSelection = useComputed(() => selectedUsers.value.size > 0);

	function handleBulkRoleChange() {
		sweetModal({
			title: "Change Role",
			text: `Change role for ${selectedCount.value} selected user(s)?`,
			icon: "info",
			showCancelButton: true,
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				sweetModal({
					icon: "success",
					title: "Role updated",
					timer: 1500,
					showConfirmButton: false,
				});
				selectedUsers.value = new Set();
			}
		});
	}

	function handleBulkBan() {
		sweetModal({
			title: "Ban Users?",
			text: `Ban ${selectedCount.value} selected user(s)? This action will prevent them from logging in.`,
			icon: "danger",
			showCancelButton: true,
			confirmButtonText: "Ban Users",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				sweetModal({
					icon: "success",
					title: "Users banned",
					timer: 1500,
					showConfirmButton: false,
				});
				selectedUsers.value = new Set();
				userIndex.refetch();
			}
		});
	}

	function handleExportCSV() {
		sweetModal({
			title: "Export Users",
			text: "Download all user data as CSV file?",
			icon: "info",
			showCancelButton: true,
			confirmButtonText: "Export",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				sweetModal({
					icon: "success",
					title: "Export started",
					text: "Your download will begin shortly.",
					timer: 2000,
					showConfirmButton: false,
				});
			}
		});
	}

	const offset = table.pagination.value.offset;
	const limit = table.pagination.value.limit;
	const total = stats.total;
	const showingFrom = total > 0 ? offset + 1 : 0;
	const showingTo = Math.min(offset + limit, total);

	return (
		<div class="flex flex-col gap-6 pb-20">
			<div class="flex flex-col gap-4">
				<div class="text-xs text-muted-foreground uppercase tracking-wide">
					DASHBOARD / <span class="text-foreground">USERS</span>
				</div>
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 class="text-2xl font-bold tracking-tight">User Management</h1>
					<div class="flex items-center gap-3">
						<button
							type="button"
							class="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
							onClick={handleExportCSV}
						>
							<Download size={16} />
							Export CSV
						</button>
						<button
							type="button"
							class="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
							onClick={() => {
								userStore.value = true;
							}}
						>
							<Plus size={16} />
							Invite User
						</button>
					</div>
				</div>
			</div>

			<div class="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit border border-border">
				<button
					type="button"
					onClick={() => {
						view.value = "users";
					}}
					class={cn(
						"px-4 py-2 rounded-lg text-sm font-medium transition-all",
						view.value === "users"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
					)}
				>
					Users
				</button>
				<button
					type="button"
					onClick={() => {
						view.value = "roles";
					}}
					class={cn(
						"px-4 py-2 rounded-lg text-sm font-medium transition-all",
						view.value === "roles"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
					)}
				>
					Roles & Permissions
				</button>
				<button
					type="button"
					onClick={() => {
						view.value = "activity";
					}}
					class={cn(
						"px-4 py-2 rounded-lg text-sm font-medium transition-all",
						view.value === "activity"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
					)}
				>
					Audit Log
				</button>
			</div>

			{view.value === "users" ? (
				<>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<StatCard
							title="Total Users"
							value={stats.total.toLocaleString()}
							change={stats.totalChange}
							icon={Users}
						/>
						<StatCard
							title="Active Sessions"
							value={stats.activeSessions}
							change={stats.activeChange}
							icon={Zap}
							iconColor="text-yellow-500"
						/>
						<StatCard
							title="Pending Invites"
							value={stats.pendingInvites}
							badge={`${stats.pendingInvites} pending`}
							icon={Gift}
							iconColor="text-orange-500"
						/>
					</div>

					<Card class="p-0 overflow-hidden">
						<div class="p-4 border-b border-border">
							<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
								<div class="relative w-full lg:max-w-sm">
									<Search
										size={16}
										class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
									/>
									<input
										type="text"
										placeholder="Search by name or email..."
										class="w-full border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
										value={table.search.value}
										onInput={(e) => {
											table.search.onSearchByName(e.currentTarget.value);
										}}
									/>
								</div>

								<div class="flex flex-wrap gap-3 items-center">
									<div class="relative">
										<select
											class="appearance-none px-4 py-2.5 pr-9 text-sm border border-border rounded-lg bg-background hover:bg-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
											value={table.filters.value.role_id as number}
											onChange={(e) => {
												table.filters.update(
													"role_id",
													e.currentTarget.value === "all"
														? null
														: Number(e.currentTarget.value),
												);
											}}
										>
											{USER_ROLE_OPTIONS.map((option) => (
												<option key={option.key} value={option.key || "all"}>
													{option.value}
												</option>
											))}
										</select>
										<ChevronDown
											size={14}
											class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
										/>
									</div>

									<div class="relative">
										<select
											class="appearance-none px-4 py-2.5 pr-9 text-sm border border-border rounded-lg bg-background hover:bg-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
											value={
												table.filters.value.is_mfa_enabled === null
													? "all"
													: table.filters.value.is_mfa_enabled
														? "enabled"
														: "disabled"
											}
											onChange={(e) => {
												table.filters.update(
													"is_mfa_enabled",
													e.currentTarget.value === "all"
														? null
														: e.currentTarget.value === "enabled",
												);
											}}
										>
											<option value="all">All MFA Status</option>
											<option value="enabled">Enabled</option>
											<option value="disabled">Not Set</option>
										</select>
										<ChevronDown
											size={14}
											class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
										/>
									</div>

									<span class="text-sm text-muted-foreground">
										Showing {showingFrom}-{showingTo} of{" "}
										{total.toLocaleString()} users
									</span>
								</div>
							</div>
						</div>

						<VigilioTable query={userIndex} table={table}>
							<VigilioTable.table>
								<VigilioTable.thead>
									<VigilioTable.thead.th />
								</VigilioTable.thead>
								<VigilioTable.tbody>
									<VigilioTable.tbody.row title="No users found">
										{(data) => <VigilioTable.tbody.td data={data} />}
									</VigilioTable.tbody.row>
								</VigilioTable.tbody>
							</VigilioTable.table>
							<VigilioTable.footer>
								<div class="flex justify-between items-center w-full px-6 py-4">
									<VigilioTable.footer.show />
									<VigilioTable.footer.paginator />
								</div>
							</VigilioTable.footer>
						</VigilioTable>
					</Card>
				</>
			) : view.value === "roles" ? (
				<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
					<RoleMatrix />
				</div>
			) : (
				<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
					<AuditLog />
				</div>
			)}

			{hasSelection.value ? (
				<div class="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
					<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								class="w-5 h-5 rounded border-primary text-primary focus:ring-primary"
								checked={selectAll.value}
								onChange={(e) => {
									selectAll.value = e.currentTarget.checked;
									if (e.currentTarget.checked && userIndex.data) {
										selectedUsers.value = new Set(
											userIndex.data.results.map((u) => u.id),
										);
									} else {
										selectedUsers.value = new Set();
									}
								}}
							/>
							<span class="text-sm text-muted-foreground">
								{selectedCount.value} users selected for bulk operations
							</span>
						</div>
						<div class="flex items-center gap-3">
							<button
								key="bulk-role"
								type="button"
								class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
								onClick={handleBulkRoleChange}
							>
								<Shield size={14} />
								CHANGE ROLE
							</button>
							<button
								key="bulk-ban"
								type="button"
								class="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
								onClick={handleBulkBan}
							>
								<UserX size={14} />
								BAN SELECTED
							</button>
						</div>
					</div>
				</div>
			) : null}

			<Modal
				isOpen={userStore.value}
				onClose={() => {
					userStore.value = false;
				}}
				contentClassName="max-w-lg w-full"
			>
				<UserStore
					refetch={(data) => {
						table.updateData((old, count) => ({
							result: [data, ...old],
							count: count + 1,
						}));
						userStore.value = false;
					}}
					onClose={() => {
						userStore.value = false;
					}}
				/>
			</Modal>

			<Modal
				isOpen={!!userUpdate.value}
				onClose={() => {
					userUpdate.value = null;
				}}
				contentClassName="max-w-lg w-full"
			>
				{userUpdate.value && (
					<UserUpdate
						user={userUpdate.value}
						refetch={(data) => {
							table.updateData((old, count) => ({
								result: old.map((item) =>
									item.id === data.id ? { ...item, ...data } : item,
								),
								count,
							}));
							userUpdate.value = null;
						}}
					/>
				)}
			</Modal>

			<Modal
				isOpen={!!userShow.value}
				onClose={() => {
					userShow.value = null;
				}}
				contentClassName="max-w-lg w-full"
			>
				{userShow.value && <UserShow user={userShow.value} />}
			</Modal>

			<Modal
				isOpen={!!userQr.value}
				onClose={() => {
					userQr.value = null;
				}}
				contentClassName="max-w-sm w-full"
			>
				{userQr.value && <UserQr user={userQr.value} />}
			</Modal>
		</div>
	);
}

// Stat Card Component
interface StatCardProps {
	title: string;
	value: string | number;
	change?: string;
	icon: LucideIcon;
	iconColor?: string;
	badge?: string;
}

function StatCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor = "text-muted-foreground",
	badge,
}: StatCardProps) {
	return (
		<Card className="p-5">
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class={cn("p-2.5 bg-muted/50 rounded-lg", iconColor)}>
						<Icon {...sizeIcon.medium} />
					</div>
					<div>
						<p class="text-sm text-muted-foreground mb-1">{title}</p>
						<div class="flex items-baseline gap-2">
							<h3 class="text-3xl font-bold tracking-tight">{value}</h3>
							{change ? (
								<span class="text-xs text-green-500 font-medium">{change}</span>
							) : null}
						</div>
					</div>
				</div>
				{badge ? (
					<span class="text-xs text-orange-500 hover:underline cursor-pointer">
						{badge}
					</span>
				) : null}
			</div>
		</Card>
	);
}
