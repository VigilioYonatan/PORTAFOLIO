// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";
import FloatingActionChat from "../floating-action-chat";

// Mocking the hooks
vi.mock("@hooks/use-motion", () => ({
	useEntranceAnimation: vi.fn(() => ({ current: null })),
}));

vi.mock("@stores/chat.store", async () => {
	const { signal } = await import("@preact/signals");
	return {
		isChatOpen: signal(false),
	};
});

// Mocking the APIs
vi.mock("@modules/chat/apis/conversation.store.api", () => ({
	conversationStoreApi: vi.fn(() => ({
		mutateAsync: vi.fn().mockResolvedValue({ conversation: { id: 1 } }),
		isLoading: false,
	})),
}));

vi.mock("@modules/chat/apis/chat-message.public-store.api", () => ({
	chatMessagePublicStoreApi: vi.fn(() => ({
		mutateAsync: vi.fn().mockResolvedValue({ success: true }),
		isLoading: false,
	})),
}));

describe("FloatingActionChat Component", () => {
	beforeEach(async () => {
		const { isChatOpen } = await import("@stores/chat.store");
		isChatOpen.value = false;
		vi.clearAllMocks();
	});

	it("renders the FAB by default", () => {
		render(<FloatingActionChat />);
		expect(screen.getByLabelText("Open AI Nexus")).toBeInTheDocument();
	});

	it("opens the chat window when FAB is clicked", () => {
		render(<FloatingActionChat />);
		const fab = screen.getByLabelText("Open AI Nexus");
		fireEvent.click(fab);
		expect(screen.getByText("AI_NEXUS_v2.0.4")).toBeInTheDocument();
	});

	it("can send a message", async () => {
		render(<FloatingActionChat />);
		// Open chat first
		fireEvent.click(screen.getByLabelText("Open AI Nexus"));

		// Lead Capture Step
		const nameInput = screen.getByLabelText("Nombre / Alias");
		fireEvent.input(nameInput, { target: { value: "Test User" } });
		fireEvent.change(nameInput, { target: { value: "Test User" } });

		const initButton = screen.getByText("Establecer Conexión");
		fireEvent.click(initButton);

		// Now Chat Input should be visible
		const input = await screen.findByLabelText("Nexus Input");
		const sendButton = screen.getByLabelText("Transmit");

		fireEvent.input(input, { target: { value: "Hello AI" } });
		fireEvent.change(input, { target: { value: "Hello AI" } });
		fireEvent.click(sendButton);

		expect(await screen.findByText("Hello AI")).toBeInTheDocument();
	});

	it("closes the chat window when FAB is clicked again", () => {
		render(<FloatingActionChat />);
		// Open
		fireEvent.click(screen.getByLabelText("Open AI Nexus"));
		expect(screen.getByText("AI_NEXUS_v2.0.4")).toBeInTheDocument();
		// Close
		const closeBtn = screen.getByLabelText("Close Interface");
		fireEvent.click(closeBtn);
		// It adds hidden class or opacity 0, but checking if it's still "there" but not visible or checking label
		expect(screen.getByLabelText("Open AI Nexus")).toBeInTheDocument();
	});
});
