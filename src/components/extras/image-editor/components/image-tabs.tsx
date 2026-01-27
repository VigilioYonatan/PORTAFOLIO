import Button from "@components/extras/button";
import { cn } from "@infrastructure/utils/client";
import type { JSX } from "preact/jsx-runtime";

interface ImageTab {
	id: string;
	label: string;
	content: JSX.Element;
	disabled?: boolean;
}

interface ImageTabsProps {
	tabs: ImageTab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
}

function ImageTabs({
	tabs,
	activeTab,
	onTabChange,
	className,
}: ImageTabsProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{/* Tab Headers */}
			<div className="grid grid-cols-3 space-x-1  p-1 rounded-lg ">
				{tabs.map((tab) => (
					<Button
						type="button"
						key={tab.id}
						onClick={() => !tab.disabled && onTabChange(tab.id)}
						disabled={tab.disabled}
						variant={activeTab === tab.id ? "primary" : "outline"}
					>
						{tab.label}
					</Button>
				))}
			</div>

			{/* Tab Content */}
			<div className="min-h-[200px]">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={cn("", activeTab === tab.id ? "block" : "hidden")}
					>
						{tab.content}
					</div>
				))}
			</div>
		</div>
	);
}
export default ImageTabs;
