import { cn } from "@infrastructure/utils/client";
import { useSignal } from "@preact/signals";
import { MoreVertical } from "lucide-preact";
import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

interface EllipsisMenuProps {
	children: ComponentChildren;
	className?: string;
	triggerClassName?: string;
	position?: "left" | "right";
	isLoading?: boolean;
}

export function EllipsisMenu({
	children,
	className,
	triggerClassName,
	position = "right",
	isLoading = false,
}: EllipsisMenuProps) {
	const isOpen = useSignal<boolean>(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuPos = useSignal<{ top: number; left: number }>({ top: 0, left: 0 });

	function toggle() {
		if (isLoading) return;
		if (!isOpen.value && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			// Calculate position
			menuPos.value = {
				top: rect.bottom + window.scrollY + 5,
				left:
					position === "right"
						? rect.right + window.scrollX - 192 // 192px is approx width (w-48)
						: rect.left + window.scrollX,
			};
		}
		isOpen.value = !isOpen.value;
	}

	function close() {
		isOpen.value = false;
	}

	// Close on resize/scroll to avoid misplaced menu
	useEffect(() => {
		if (!isOpen.value) return;
		const handleScroll = () => close();
		window.addEventListener("scroll", handleScroll, true);
		window.addEventListener("resize", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", handleScroll);
		};
	}, [isOpen.value]);

	return (
		<div class={cn("inline-block", className)}>
			<button
				ref={buttonRef}
				type="button"
				onClick={toggle}
				class={cn(
					"p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
					isLoading && "opacity-50 cursor-not-allowed",
					triggerClassName,
				)}
				disabled={isLoading}
				aria-label="Opciones"
			>
				{isLoading ? (
					<div class="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
				) : (
					<MoreVertical class="w-4 h-4" />
				)}
			</button>

			{isOpen.value &&
				createPortal(
					<>
						{/* Backdrop to close when clicking outside */}
						<div class="fixed inset-0 z-9998" onClick={close} />

						<div
							class={cn(
								"fixed z-9999 bg-popover border border-border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200 w-48",
							)}
							style={{
								top: menuPos.value.top,
								left: menuPos.value.left,
							}}
							onClick={(e) => {
								// Check if the click was on a button or menu item
								const target = e.target as HTMLElement;
								if (target.closest("button") || target.closest("a")) {
									close();
								}
							}}
						>
							{children}
						</div>
					</>,
					document.body,
				)}
		</div>
	);
}

export default EllipsisMenu;
