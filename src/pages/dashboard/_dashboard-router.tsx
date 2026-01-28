import { lazy, Suspense } from "preact/compat";
import { Route, Router, Switch } from "wouter-preact";
import DashboardLayout from "./_components/dashboard-layout";

// Lazy load modules (Updated with separated components)
const DashboardHome = lazy(() => import("./_components/dashboard-home"));
const AIWorkspace = lazy(() => import("@modules/ai/components/ai-workspace"));
const ProjectManager = lazy(
	() => import("./_components/projects/project-manager"),
);
const BlogManager = lazy(() => import("./_components/blog/blog-manager"));

const HRDashboard = lazy(() => import("./_components/hr/hr-dashboard"));
const Inbox = lazy(() => import("./_components/inbox/inbox"));
const SharedWorkspace = lazy(
	() => import("./_components/shared/shared-workspace"),
);
const Settings = lazy(() => import("./_components/settings/settings"));

import { type Lang } from "@src/i18n";

interface DashboardRouterProps {
    lang?: Lang;
}

export function DashboardRouter({ lang = "es" }: DashboardRouterProps) {
	return (
		<Router base="/">
			<DashboardLayout lang={lang}>
				<Suspense
					fallback={
						<div class="p-8 text-primary/50 animate-pulse font-mono flex flex-col items-center justify-center h-[50vh]">
							<div class="w-10 h-1 border-t-2 border-primary animate-glitch mb-4" />
							<span class="text-[10px] tracking-[0.3em] uppercase">
								LOADING_MODULE.bin
							</span>
						</div>
					}
				>
					<Switch>
						<Route path="/dashboard">
                            {() => <DashboardHome lang={lang} />}
                        </Route>
						{/* Modules */}
						<Route path="/dashboard/ai" component={AIWorkspace} />
						<Route path="/dashboard/documents" component={AIWorkspace} />
						{/* Separated Content Managers */}
						<Route path="/dashboard/projects">
                            {() => <ProjectManager lang={lang} />}
                        </Route>
						<Route path="/dashboard/blog">
                            {() => <BlogManager lang={lang} />}
                        </Route>
						<Route path="/dashboard/content">
                            {() => <ProjectManager lang={lang} />}
                        </Route>
						{/* Fallback/Legacy */}
						{/* Fallback/Legacy */}
						<Route path="/dashboard/hr">
                            {() => <HRDashboard lang={lang} />}
                        </Route>
						<Route path="/dashboard/inbox">
                            {() => <Inbox lang={lang} />}
                        </Route>
						<Route path="/dashboard/shared">
                            {() => <SharedWorkspace lang={lang} />}
                        </Route>
						<Route path="/dashboard/tech">
                            {() => <SharedWorkspace lang={lang} />}
                        </Route>
						<Route path="/dashboard/settings">
                            {() => <Settings lang={lang} />}
                        </Route>
						<Route path="/dashboard/profile">
                            {() => <Settings lang={lang} />}
                        </Route>
						{/* Alias for Profile */}
						{/* Fallback */}
						<Route>
							<div class="p-20 text-center text-destructive font-mono text-xs tracking-widest uppercase">
								<div class="mb-4 text-4xl font-bold">404</div>[ ERROR:
								CRITICAL_MODULE_MISSING ]
							</div>
						</Route>
					</Switch>
				</Suspense>
			</DashboardLayout>
		</Router>
	);
}
