import { sizeIcon } from "@infrastructure/utils/client";
import { ChevronLeft, ChevronRight } from "lucide-preact";

export interface PaginationMeta {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface ServerPaginatorProps {
	pagination: PaginationMeta;
	baseUrl: string;
	className?: string;
}

export function ServerPaginator({
	pagination,
	baseUrl,
	className,
}: ServerPaginatorProps) {
	if (!pagination || pagination.totalPages <= 1) return null;

	function buildPageUrl(page: number): string {
		const separator = baseUrl.includes("?") ? "&" : "?";
		return page === 1 ? baseUrl : `${baseUrl}${separator}page=${page}`;
	}

	return (
		<nav
			class={`flex items-center justify-center gap-2 pt-8 border-t border-border mt-8 ${
				className || ""
			}`}
		>
			{/* Previous */}
			{pagination.hasPrevPage ? (
				<a
					href={buildPageUrl(pagination.currentPage - 1)}
					class="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-colors"
					aria-label="Previous page"
				>
					<ChevronLeft {...sizeIcon.medium} />
					Previous
				</a>
			) : (
				<span class="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
					<ChevronLeft {...sizeIcon.medium} />
					Previous
				</span>
			)}

			{/* Page Numbers */}
			<div class="items-center gap-1 hidden sm:flex">
				{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
					(pageNum) => (
						<a
							key={pageNum}
							href={buildPageUrl(pageNum)}
							class={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
								pageNum === pagination.currentPage
									? "bg-primary text-primary-foreground"
									: "bg-card border border-border hover:bg-muted hover:border-primary/50"
							}`}
						>
							{pageNum}
						</a>
					),
				)}
			</div>

			{/* Next */}
			{pagination.hasNextPage ? (
				<a
					href={buildPageUrl(pagination.currentPage + 1)}
					class="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-colors"
					aria-label="Next page"
				>
					Next
					<ChevronRight {...sizeIcon.medium} />
				</a>
			) : (
				<span class="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
					Next
					<ChevronRight {...sizeIcon.medium} />
				</span>
			)}
		</nav>
	);
}
