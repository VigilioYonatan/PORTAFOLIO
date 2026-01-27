import Button from "@components/extras/button";

function View404() {
	return (
		<div class="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-hidden">
			{/* Scanline Effect */}
			<div class="pointer-events-none absolute inset-0 z-10 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] animate-scanline" />

			<div class="relative z-20 flex flex-col items-center gap-6 max-w-2xl text-center">
				<div class="relative">
					<h1
						class="text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary animate-pulse-slow select-none"
						style={{
							textShadow:
								"2px 2px 0px var(--color-destructive), -2px -2px 0px var(--color-primary)",
						}}
					>
						404
					</h1>
					<div class="absolute inset-0 text-9xl font-black text-primary/20 animate-glitch mix-blend-screen select-none">
						404
					</div>
				</div>

				<div class="space-y-4">
					<h2 class="text-2xl font-bold text-foreground tracking-tight terminal-cursor">
						ERROR_PAGE_NOT_FOUND
					</h2>
					<p class="text-muted-foreground font-mono max-w-md mx-auto">
						&gt; The requested resource could not be found.
						<br />
						&gt; Check the URL or contact the administrator.
					</p>
				</div>

				<div class="mt-8">
					<Button as="a" href="/" variant="primary" size="lg">
						&lt; Return_Home /&gt;
					</Button>
				</div>
			</div>
		</div>
	);
}

export default View404;
