export interface PaginatorResult<T> {
	success: true;
	results: T[];
	count: number;
	next: string | null;
	previous: string | null;
}
export interface PaginatorResultError {
	success: false;
	message: string;
}

export type Refetch<T> = T extends (infer U)[] ? U : T;
