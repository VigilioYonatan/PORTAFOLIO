import { fireEvent, render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "../components/NotificationCenter";

// Mock the API hooks
const refetchMock = vi.fn();
const mutateUpdateMock = vi.fn();
const mutateDestroyMock = vi.fn();

vi.mock("@modules/notification/apis/notification.api", () => ({
	notificationIndexApi: () => ({
		data: {
			results: [
				{
					id: 1,
					title: "New Message",
					content: "Hello there",
					type: "CONTACT",
					is_read: false,
					created_at: new Date().toISOString(),
				},
				{
					id: 2,
					title: "System Alert",
					content: "Update complete",
					type: "SYSTEM",
					is_read: true,
					created_at: new Date().toISOString(),
				},
			],
		},
		isLoading: false,
		refetch: refetchMock,
	}),
	notificationUpdateApi: () => ({
		mutate: mutateUpdateMock,
		isLoading: false,
	}),
	notificationDestroyAllApi: () => ({
		mutate: mutateDestroyMock,
		isLoading: false,
	}),
}));

// Mock SweetModal
vi.mock("@vigilio/sweet", () => ({
	sweetModal: vi.fn(),
}));

describe("NotificationCenter", () => {
	it("renders notifications correctly", () => {
		render(<NotificationCenter />);
		expect(screen.getByText("Neural_Feed")).toBeInTheDocument();
		expect(screen.getByText("New Message")).toBeInTheDocument();
		expect(screen.getByText("System Alert")).toBeInTheDocument();
	});

	it("calls mark as read when check button is clicked", () => {
		render(<NotificationCenter />);
		const checkButton = screen.getByTitle("Mark as read");
		fireEvent.click(checkButton);
		expect(mutateUpdateMock).toHaveBeenCalledWith(
			{ id: 1, body: { is_read: true } },
			expect.any(Object),
		);
	});
});
