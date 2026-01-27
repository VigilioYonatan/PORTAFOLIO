import { lazy, Suspense } from "preact/compat";
import { Route, Router, Switch } from "wouter-preact";
import DashboardLayout from "./_components/dashboard.layout";

// Lazy load modules (Updated with separated components)
const DashboardHome = lazy(() => import("./_components/dashboard.home"));
const AIWorkspace = lazy(() => import("@modules/ai/components/ai-workspace"));
const ProjectManager = lazy(
	() => import("./_components/projects/project.manager"),
);
const BlogManager = lazy(() => import("./_components/blog/blog.manager"));

const HRDashboard = lazy(() => import("./_components/hr/hr.dashboard"));
const Inbox = lazy(() => import("./_components/inbox/inbox"));
const SharedWorkspace = lazy(
	() => import("./_components/shared/shared.workspace"),
);
const Settings = lazy(() => import("./_components/settings/settings"));

export function DashboardRouter() {
	return (
		<Router base="/">
			<DashboardLayout>
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
						<Route path="/dashboard" component={DashboardHome} />
						{/* Modules */}
						<Route path="/dashboard/ai" component={AIWorkspace} />
						<Route path="/dashboard/documents" component={AIWorkspace} />
						{/* Separated Content Managers */}
						<Route path="/dashboard/projects" component={ProjectManager} />
						<Route path="/dashboard/blog" component={BlogManager} />
						<Route path="/dashboard/content" component={ProjectManager} />{" "}
						{/* Fallback/Legacy */}
						<Route path="/dashboard/hr" component={HRDashboard} />
						<Route path="/dashboard/inbox" component={Inbox} />
						<Route path="/dashboard/shared" component={SharedWorkspace} />
						<Route path="/dashboard/tech" component={SharedWorkspace} />
						<Route path="/dashboard/settings" component={Settings} />
						<Route path="/dashboard/profile" component={Settings} />{" "}
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
