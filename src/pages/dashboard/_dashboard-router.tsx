import { type Lang } from "@src/i18n";
import { lazy, Suspense } from "preact/compat";
import { Route, Router, Switch } from "wouter-preact";
import DashboardLayout from "./_components/dashboard-layout";

const DashboardHome = lazy(() => import("./_components/dashboard-home"));
const AIWorkspace = lazy(() => import("@modules/ai/components/ai-workspace"));
const DocumentManager = lazy(
	() => import("./_components/documents/document-manager"),
);
const ProjectManager = lazy(
	() => import("./_components/projects/project-manager"),
);
const BlogManager = lazy(() => import("./_components/blog/blog-manager"));
const OpenSourceManager = lazy(
	() => import("@modules/open-source/components/open-source.index"),
);

const HRDashboard = lazy(() => import("./_components/hr/hr-dashboard"));
const Inbox = lazy(() => import("./_components/inbox/inbox"));
const SharedWorkspace = lazy(
	() => import("./_components/shared/shared-workspace"),
);
const Settings = lazy(() => import("./_components/settings/settings"));

// Dashboard Router
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
						<Route
							path="/dashboard"
							children={<DashboardHome params={{ lang }} />}
						/>
						{/* Modules */}
						<Route path="/dashboard/ai" children={<AIWorkspace />} />
						<Route
							path="/dashboard/documents"
							children={<DocumentManager params={{ lang }} />}
						/>

						{/* Separated Content Managers */}
						<Route
							path="/dashboard/projects"
							children={<ProjectManager params={{ lang }} />}
						/>
						<Route
							path="/dashboard/blog"
							children={<BlogManager params={{ lang }} />}
						/>
						<Route
							path="/dashboard/open-source"
							children={<OpenSourceManager lang={lang} />}
						/>
						<Route
							path="/dashboard/content"
							children={<ProjectManager params={{ lang }} />}
						/>

						{/* Fallback/Legacy */}
						<Route
							path="/dashboard/hr"
							children={<HRDashboard params={{ lang }} />}
						/>
						<Route
							path="/dashboard/inbox"
							children={<Inbox params={{ lang }} />}
						/>
						<Route path="/dashboard/shared" children={<SharedWorkspace />} />
						<Route path="/dashboard/tech" children={<SharedWorkspace />} />
						<Route
							path="/dashboard/settings"
							children={<Settings params={{ lang }} />}
						/>
						<Route
							path="/dashboard/profile"
							children={<Settings params={{ lang }} />}
						/>

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
