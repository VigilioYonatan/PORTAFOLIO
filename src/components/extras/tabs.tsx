import { cn } from "@infrastructure/utils/client";
import type { HTMLAttributes } from "preact/compat";

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

function Tabs({ className, ...props }: TabsProps) {
	return <div class={cn("w-full", className)} {...props} />;
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}
function TabsList({ className, ...props }: TabsListProps) {
	return (
		<div
			class={cn(
				"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
	value: string;
	isActive?: boolean;
}
function TabsTrigger({ className, isActive, ...props }: TabsTriggerProps) {
	return (
		<button
			type="button"
			class={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				isActive
					? "bg-background text-foreground shadow-sm"
					: "hover:bg-background/50 hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	show?: boolean;
}
function TabsContent({ className, show, ...props }: TabsContentProps) {
	if (!show) return null;
	return (
		<div
			class={cn(
				"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		/>
	);
}

// Attach subcomponents
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
