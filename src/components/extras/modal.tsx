import { cn } from "@infrastructure/utils/client/cn";
import { XIcon } from "lucide-preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact/jsx-runtime";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: JSX.Element | JSX.Element[] | null;
	className?: string; // For the overly, though usually fixed
	contentClassName?: string; // For the modal content
	closeButtonClassName?: string;
	showCloseButton?: boolean;
	isCloseButtonBackground?: boolean;
}

export default function Modal({
	isOpen,
	onClose,
	children,
	className,
	contentClassName,
	closeButtonClassName,
	showCloseButton = true,
	isCloseButtonBackground = false,
}: ModalProps) {
	const ref = useRef<HTMLDivElement>(null);

	// prevent scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const modalContent = (
		<div
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto",
				className,
			)}
			onClick={(e) => {
				if (e.target === e.currentTarget)
					isCloseButtonBackground ? onClose() : null;
			}}
		>
			<div
				ref={ref}
				className={cn(
					"relative bg-card border border-border text-card-foreground shadow-lg animate-in fade-in zoom-in-95 duration-200 self-start mt-10 mb-10",
					"max-w-[800px] w-full", // Default from rules
					contentClassName,
				)}
			>
				{showCloseButton && (
					<button
						type="button"
						onClick={onClose}
						className={cn(
							"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
							closeButtonClassName,
						)}
					>
						<XIcon className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</button>
				)}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);

	// Ensure document.body exists, strictly it should in client
	if (typeof document === "undefined") return null;

	return createPortal(modalContent, document.body);
}
