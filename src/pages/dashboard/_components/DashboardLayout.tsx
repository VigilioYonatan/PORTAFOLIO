import type { PropsWithChildren } from "preact/compat";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps extends PropsWithChildren {
	title?: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div class="flex h-screen w-full bg-background text-foreground overflow-hidden font-mono">
			{/* Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div class="flex flex-col flex-1 h-full overflow-hidden md:pl-64">
				<DashboardHeader />

				<main class="flex-1 overflow-y-auto p-6 md:p-8 bg-background relative">
					{/* Ambient scanline for main content */}
					<div class="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03]" />
					<div class="relative z-10 animate-in fade-in duration-500">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}

