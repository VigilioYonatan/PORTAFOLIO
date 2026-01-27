import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { ChevronDown } from "lucide-preact";
import type { JSX } from "preact/jsx-runtime";

interface AccordionItem {
	id: string;
	title: string;
	content: string | JSX.Element | JSX.Element[];
}

interface AccordionProps {
	items: AccordionItem[];
	allowMultiple?: boolean;
	className?: string;
}

function Accordion({
	items,
	allowMultiple = false,
	className,
}: AccordionProps) {
	const openItems = useSignal<Set<string>>(new Set());

	function toggleItem(itemId: string) {
		const newSet = new Set(openItems.value);
		if (newSet.has(itemId)) {
			newSet.delete(itemId);
		} else {
			if (!allowMultiple) newSet.clear();
			newSet.add(itemId);
		}
		openItems.value = newSet;
	}

	return (
		<div
			class={cn(
				"bg-card border border-border rounded-(--radius-lg) overflow-hidden transition-all",
				className,
			)}
		>
			{items.map((item) => {
				const isOpen = openItems.value.has(item.id);
				return (
					<div key={item.id} class="border-b border-border last:border-b-0">
						<button
							type="button"
							onClick={() => toggleItem(item.id)}
							class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-hover transition-colors"
						>
							<div class="flex items-center gap-2">
								<span class="text-sm font-medium text-foreground">
									{item.title}
								</span>
							</div>
							<ChevronDown
								className={cn(
									"w-4 h-4 text-muted-foreground transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</button>

						<div
							class={cn(
								"overflow-hidden transition-all duration-300 ease-in-out",
								isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
							)}
						>
							<div class="px-4 pb-3 text-sm text-muted-foreground border-t border-border/50 bg-card/50">
								{item.content}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default Accordion;
