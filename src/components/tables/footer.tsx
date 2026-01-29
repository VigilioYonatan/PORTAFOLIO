import { useContext } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";
import { VigilioTableContext } from "./vigilio-table";

interface FooterProps {
	className?: string;
	children: JSX.Element | JSX.Element[];
}
function Footer({
	className = "flex gap-2 rounded-b-xl  border border-x border-border   overflow-hidden w-full flex-wrap bg-muted/50 p-4 justify-center items-center",
	children,
}: FooterProps) {
	const tableContext = useContext(VigilioTableContext);

	if (!tableContext) {
		return null;
	}

	const table = tableContext;

	if (table.pagination.totalPages < 2) return null;
	return <div class={className}>{children}</div>;
}

export default Footer;
