import type { JSX } from "preact/jsx-runtime";

interface TheadProps {
	className?: string;
	children: JSX.Element | JSX.Element[];
}
function Thead({
	children,
	className = "bg-muted/50 border-b border-border",
}: TheadProps) {
	return <thead class={className}>{children}</thead>;
}

export default Thead;
