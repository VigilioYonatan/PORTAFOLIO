import Badge from "@components/extras/badge";
import { Card } from "@components/extras/card";
import Form, { formSelectNumber } from "@components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, handlerError, sizeIcon } from "@infrastructure/utils/client";
import { aiConfigShowApi } from "@modules/ai/apis/ai.config.show.api";
import { aiConfigUpdateApi } from "@modules/ai/apis/ai.config.update.api";
import type { AiConfigUpdateDto } from "@modules/ai/dtos/ai-config.update.dto";
import { aiConfigUpdateDto } from "@modules/ai/dtos/ai-config.update.dto";
import type { AiConfigSchema } from "@modules/ai/schemas/ai-config.schema";
import { useSignal } from "@preact/signals";
import { useAuthStore } from "@src/stores/auth.store";
import { sweetModal } from "@vigilio/sweet";
import {
	Bot,
	ChevronRight,
	DollarSign,
	Palette,
	Sparkles,
} from "lucide-preact";
import type { JSX } from "preact/jsx-runtime";
import { type UseFormReturn, useForm } from "react-hook-form";
import { tenantShowApi } from "../apis/tenant.show.api";
import { tenantUpdateMeApi } from "../apis/tenant.update-me.api";
import { tenantSettingUpdateMeApi } from "../apis/tenant-setting.update-me.api";
import {
	LLM_ENGINE_OPTIONS,
	TEMPERATURE_CONFIG,
} from "../const/tenant-settings.const";
import type { TenantUpdateDto } from "../dtos/tenant.update.dto";
import { tenantUpdateDto } from "../dtos/tenant.update.dto";
import type { TenantSettingUpdateMeDto } from "../dtos/tenant-setting.update-me.dto";
import { tenantSettingUpdateMeDto } from "../dtos/tenant-setting.update-me.dto";
import type { TenantShowSchema } from "../schemas/tenant.schema";

export default function SettingsIndex() {
	const authStore = useAuthStore();
	const finalTenantId = authStore.state.value?.tenant_id;

	if (!finalTenantId) return null;

	const tenantShowQuery = tenantShowApi(finalTenantId);
	const aiConfigQuery = aiConfigShowApi();

	let component: JSX.Element | null = null;

	if (tenantShowQuery.isLoading || aiConfigQuery.isLoading) {
		component = <SettingsSkeleton />;
	}
	if (tenantShowQuery.isError) {
		component = (
			<div class="text-destructive p-4">
				{tenantShowQuery.error?.message || "Error loading settings"}
			</div>
		);
	}
	if (tenantShowQuery.isSuccess && tenantShowQuery.data) {
		const tenant = tenantShowQuery.data.tenant;
		const aiConfig = aiConfigQuery.data?.config;
		const canEditAI = tenant.plan === "PRO" || tenant.plan === "ENTERPRISE";

		component = (
			<SettingsContent
				tenant={tenant}
				aiConfig={aiConfig}
				canEditAI={canEditAI}
				onRefetch={() => {
					tenantShowQuery.refetch();
					aiConfigQuery.refetch();
				}}
			/>
		);
	}

	return (
		<div class="flex flex-col gap-6">
			{/* Breadcrumb */}
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span class="hover:text-foreground transition-colors cursor-pointer">
					Dashboard
				</span>
				<ChevronRight {...sizeIcon.small} />
				<span class="text-foreground font-medium">Settings</span>
			</div>

			{/* Header */}
			<div class="flex flex-col gap-2">
				<h1 class="text-3xl font-bold tracking-tight">
					Tenant & AI Configuration
				</h1>
				<p class="text-sm text-muted-foreground">
					Manage your organization's identity, branding, and Large Language
					Model (LLM) preferences. Configure defaults for system behavior and
					resource limits.
				</p>
			</div>

			{component}
		</div>
	);
}

interface SettingsContentProps {
	tenant: TenantShowSchema;
	aiConfig?: AiConfigSchema;
	canEditAI: boolean;
	onRefetch: () => void;
}

function SettingsContent({
	tenant,
	aiConfig,
	canEditAI,
	onRefetch,
}: SettingsContentProps) {
	const hasChanges = useSignal<boolean>(false);

	// General Form (only name for this endpoint)
	const generalForm = useForm<TenantUpdateDto>({
		resolver: zodResolver(tenantUpdateDto),
		mode: "all",
		defaultValues: tenant,
	});

	// Settings Form (colors, language, timezone)
	const settingsForm = useForm<TenantSettingUpdateMeDto>({
		resolver: zodResolver(tenantSettingUpdateMeDto),
		mode: "all",
		defaultValues: tenant.setting,
	});

	// AI Config Form
	const aiConfigForm = useForm<AiConfigUpdateDto>({
		resolver: zodResolver(aiConfigUpdateDto),
		mode: "all",
		defaultValues: aiConfig,
	});

	const tenantUpdateMutation = tenantUpdateMeApi();
	const settingUpdateMutation = tenantSettingUpdateMeApi();
	const aiConfigUpdateMutation = aiConfigUpdateApi();

	const colorPrimary = settingsForm.watch("color_primary");
	const colorSecondary = settingsForm.watch("color_secondary");
	const temperature = aiConfigForm.watch("temperature");

	function onSaveAll() {
		sweetModal({
			title: "Save all changes?",
			text: "This will update your organization settings.",
			icon: "info",
			showCancelButton: true,
			confirmButtonText: "Save Changes",
		}).then(({ isConfirmed }) => {
			if (isConfirmed) {
				// Save General
				const generalData = generalForm.getValues();
				tenantUpdateMutation.mutate(generalData, {
					onSuccess() {
						// Save Settings
						const settingsData = settingsForm.getValues();
						settingUpdateMutation.mutate(settingsData, {
							onSuccess() {
								// Save AI Config if applicable
								if (canEditAI && aiConfig) {
									const aiData = aiConfigForm.getValues();
									aiConfigUpdateMutation.mutate(aiData, {
										onSuccess() {
											sweetModal({
												icon: "success",
												title: "All changes saved!",
												timer: 1500,
												showConfirmButton: false,
											});
											hasChanges.value = false;
											onRefetch();
										},
										onError(error) {
											handlerError(
												aiConfigForm,
												error,
												"Error updating AI config",
											);
										},
									});
								} else {
									sweetModal({
										icon: "success",
										title: "Settings saved!",
										timer: 1500,
										showConfirmButton: false,
									});
									hasChanges.value = false;
									onRefetch();
								}
							},
							onError(error) {
								handlerError(settingsForm, error, "Error updating settings");
							},
						});
					},
					onError(error) {
						handlerError(generalForm, error, "Error updating organization");
					},
				});
			}
		});
	}

	function onDiscardChanges() {
		generalForm.reset(tenant);
		settingsForm.reset(tenant.setting);
		if (aiConfig) {
			aiConfigForm.reset(aiConfig);
		}
		hasChanges.value = false;
		sweetModal({
			icon: "info",
			title: "Changes discarded",
			timer: 1200,
			showConfirmButton: false,
		});
	}

	const isLoading =
		tenantUpdateMutation.isLoading ||
		settingUpdateMutation.isLoading ||
		aiConfigUpdateMutation.isLoading;

	return (
		<div class="space-y-6">
			{/* Main Grid - 3 columns on large screens */}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Branding & Identity */}
				<div class="lg:col-span-1 space-y-6">
					<BrandingSection
						generalForm={generalForm}
						settingsForm={settingsForm}
						colorPrimary={colorPrimary}
						colorSecondary={colorSecondary}
						tenantName={tenant.name}
					/>
				</div>

				{/* Middle Column - Model Intelligence */}
				<div class="lg:col-span-1 space-y-6">
					<ModelIntelligenceSection
						aiConfigForm={aiConfigForm}
						canEditAI={canEditAI}
						temperature={temperature}
					/>
				</div>

				{/* Right Column - Cost Control */}
				<div class="lg:col-span-1 space-y-6">
					<CostControlSection canEditAI={canEditAI} />
				</div>
			</div>

			{/* Action Buttons */}
			<div class="flex justify-end gap-3 pt-4 border-t border-border">
				<button
					type="button"
					class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all"
					onClick={onDiscardChanges}
				>
					Discard changes
				</button>
				<button
					type="button"
					class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
					onClick={onSaveAll}
					disabled={isLoading || false}
				>
					{isLoading ? "Saving..." : "Save Changes"}
				</button>
			</div>
		</div>
	);
}

// Branding & Identity Section
function BrandingSection({
	generalForm,
	settingsForm,
	colorPrimary,
	colorSecondary,
	tenantName,
}: {
	generalForm: UseFormReturn<TenantUpdateDto>;
	settingsForm: UseFormReturn<TenantSettingUpdateMeDto>;
	colorPrimary: string;
	colorSecondary: string;
	tenantName: string;
}) {
	return (
		<Card className="p-6 space-y-6 bg-card border-border">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-primary/10">
					<Palette {...sizeIcon.medium} class="text-primary" />
				</div>
				<div>
					<h3 class="font-semibold text-foreground">Branding & Identity</h3>
					<p class="text-xs text-muted-foreground">
						Customize the look and feel of your tenant portal
					</p>
				</div>
			</div>

			<Form {...generalForm} onSubmit={() => {}}>
				<Form.control<TenantUpdateDto>
					name="name"
					title="Organization Name"
					placeholder="Subdomain"
					required
				/>
			</Form>

			<Form {...settingsForm} onSubmit={() => {}}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Form.control.color
						title="Primary Color"
						name="color_primary"
						placeholder="#1FA0A2"
					/>
					<Form.control.color
						title="Secondary Color"
						name="color_secondary"
						placeholder="#6066F1"
					/>
				</div>
			</Form>

			{/* Live Preview */}
			<div class="space-y-2">
				<p class="text-xs text-muted-foreground uppercase tracking-wider">
					Live Preview
				</p>
				<Card className="p-4 bg-linear-to-br from-background to-muted border-border">
					<div
						class="p-6 rounded-lg text-white font-bold text-lg flex items-center justify-center"
						style={{
							background: `linear-gradient(135deg, ${colorPrimary}, ${colorSecondary})`,
						}}
					>
						<Sparkles {...sizeIcon.medium} class="mr-2" />
						Welcome back
						<br />
						{tenantName}
					</div>
					<div class="mt-4 text-center">
						<button
							type="button"
							class="px-6 py-2 rounded-lg font-medium transition-all"
							style={{
								backgroundColor: colorPrimary,
								color: "white",
							}}
						>
							Start New Project
						</button>
					</div>
				</Card>
			</div>
		</Card>
	);
}

// Model Intelligence Section
function ModelIntelligenceSection({
	aiConfigForm,
	canEditAI,
	temperature,
}: {
	aiConfigForm: UseFormReturn<AiConfigUpdateDto>;
	canEditAI: boolean;
	temperature: number;
}) {
	return (
		<Card className="p-6 space-y-6 bg-card border-border">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="p-2 rounded-lg bg-primary/10">
						<Bot {...sizeIcon.medium} class="text-primary" />
					</div>
					<div>
						<h3 class="font-semibold text-foreground">Model Intelligence</h3>
						<p class="text-xs text-muted-foreground">
							Configure LLM engine and parameters
						</p>
					</div>
				</div>
				{canEditAI ? (
					<Badge variant="success" className="text-xs">
						Active
					</Badge>
				) : (
					<Badge variant="secondary" className="text-xs">
						PRO+ Required
					</Badge>
				)}
			</div>

			{canEditAI && aiConfigForm ? (
				<Form {...aiConfigForm} onSubmit={() => {}}>
					{/* Default LLM Provider */}
					<div class="space-y-3">
						<p class="text-sm font-medium text-foreground">
							Default LLM Provider
						</p>
						<div class="grid grid-cols-1 gap-2">
							{LLM_ENGINE_OPTIONS.map((option) => {
								const isSelected =
									aiConfigForm.watch("chat_model") === option.key;
								return (
									<button
										key={option.key}
										type="button"
										class={cn(
											"p-4 rounded-lg border-2 text-left transition-all",
											isSelected
												? "border-primary bg-primary/10"
												: "border-border hover:border-primary/50 bg-background",
										)}
										onClick={() => {
											aiConfigForm.setValue("chat_model", option.key);
										}}
									>
										<div class="flex items-center justify-between">
											<div>
												<div class="font-medium text-sm">{option.key}</div>
												<div class="text-xs text-muted-foreground mt-1">
													{option.value}
												</div>
											</div>
											{isSelected && (
												<div class="w-2 h-2 rounded-full bg-primary" />
											)}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Global System Prompt */}
					<div class="space-y-2">
						<p class="text-sm font-medium text-foreground">
							Global System Prompt
						</p>
						<p class="text-xs text-muted-foreground mb-2">
							Applied to all new chats
						</p>
						<textarea
							class="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] font-mono"
							placeholder="You are an expert enterprise assistant. Your tone is professional, concise, and technically accurate. Always prioritize security best practices when discussing code or infrastructure."
							{...aiConfigForm.register("system_prompt")}
						/>
					</div>

					{/* Creativity Temperature */}
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium text-foreground">
								Creativity (Temperature)
							</p>
							<span class="text-xs text-muted-foreground">
								{temperature?.toFixed(1) || "0.7"}
							</span>
						</div>
						<div class="space-y-2">
							<input
								type="range"
								min={TEMPERATURE_CONFIG.min}
								max={TEMPERATURE_CONFIG.max}
								step={TEMPERATURE_CONFIG.step}
								class="w-full accent-primary"
								{...aiConfigForm.register("temperature", {
									setValueAs: formSelectNumber,
								})}
							/>
							<div class="flex justify-between text-xs text-muted-foreground">
								<span>Precise (0.0)</span>
								<span>Balanced (0.5)</span>
								<span>Creative (1.0)</span>
							</div>
						</div>
					</div>
				</Form>
			) : (
				<div class="text-center py-8 text-muted-foreground text-sm">
					<p>Upgrade to PRO or ENTERPRISE to access AI configuration.</p>
				</div>
			)}
		</Card>
	);
}

// Cost Control Section
function CostControlSection({ canEditAI }: { canEditAI: boolean }) {
	// Mock data for demonstration
	const monthlyBudget = 500;
	const currentUsage = 294;
	const remaining = monthlyBudget - currentUsage;
	const usagePercent = (currentUsage / monthlyBudget) * 100;

	return (
		<Card className="p-6 space-y-6 bg-card border-border">
			<div class="flex items-center gap-3">
				<div class="p-2 rounded-lg bg-primary/10">
					<DollarSign {...sizeIcon.medium} class="text-primary" />
				</div>
				<div>
					<h3 class="font-semibold text-foreground">Cost Control</h3>
					<p class="text-xs text-muted-foreground">
						Manage budget and usage limits
					</p>
				</div>
			</div>

			{canEditAI ? (
				<>
					{/* Monthly Budget Cap */}
					<div class="space-y-2">
						<p class="text-sm font-medium text-foreground">
							Monthly Budget Cap
						</p>
						<div class="flex items-center gap-2">
							<span class="text-2xl font-bold">$500</span>
							<span class="text-xs text-muted-foreground">/mo</span>
						</div>
					</div>

					{/* Usage Progress */}
					<div class="space-y-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Current Usage</span>
							<span class="font-medium">{usagePercent.toFixed(0)}%</span>
						</div>
						<div class="w-full h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary transition-all"
								style={{ width: `${usagePercent}%` }}
							/>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>${currentUsage.toFixed(2)} spent</span>
							<span>${remaining.toFixed(2)} remaining</span>
						</div>
					</div>

					{/* Hard Limit Toggle */}
					<div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
						<div>
							<div class="text-sm font-medium">Hard Limit</div>
							<div class="text-xs text-muted-foreground">
								Stop requests when budget met
							</div>
						</div>
						<label
							htmlFor="hard-limit-toggle"
							class="relative inline-flex items-center cursor-pointer"
						>
							<input
								id="hard-limit-toggle"
								type="checkbox"
								class="sr-only peer"
								checked
							/>
							<div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
						</label>
					</div>

					{/* Approx Tokens */}
					<div class="bg-muted/20 p-4 rounded-lg border border-border/50">
						<div class="text-xs text-muted-foreground uppercase tracking-wider mb-2">
							Current Usage
						</div>
						<div class="flex items-baseline gap-2">
							<span class="text-2xl font-bold text-primary">12.5M</span>
							<span class="text-xs text-muted-foreground">tokens</span>
						</div>
						<div class="text-xs text-muted-foreground mt-1">
							Based on current model mix
						</div>
					</div>
				</>
			) : (
				<div class="text-center py-8 text-muted-foreground text-sm">
					<p>Upgrade to access cost control features.</p>
				</div>
			)}
		</Card>
	);
}

// Skeleton Loader
function SettingsSkeleton() {
	return (
		<div class="space-y-6 animate-pulse">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div class="h-[600px] bg-muted rounded-lg" />
				<div class="h-[600px] bg-muted rounded-lg" />
				<div class="h-[600px] bg-muted rounded-lg" />
			</div>
		</div>
	);
}
