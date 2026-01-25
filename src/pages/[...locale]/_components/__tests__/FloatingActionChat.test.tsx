// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { describe, expect, it, vi, beforeEach } from "vitest";
import FloatingActionChat from "../FloatingActionChat";

describe("FloatingActionChat Component", () => {
    it("renders the FAB by default", () => {
        render(<FloatingActionChat />);
        expect(screen.getByLabelText("Open Chat")).toBeInTheDocument();
    });

    it("opens the chat window when FAB is clicked", () => {
        render(<FloatingActionChat />);
        const fab = screen.getByLabelText("Open Chat");
        fireEvent.click(fab);
        expect(screen.getByTestId("chat-window")).toHaveClass("opacity-100");
    });

    it("can send a message and receive a mock response", async () => {
        render(<FloatingActionChat />);
        // Open chat first
        fireEvent.click(screen.getByLabelText("Open Chat"));
        
        const input = screen.getByLabelText("Chat Input");
        const sendButton = screen.getByLabelText("Send Message");

        fireEvent.input(input, { target: { value: "Hello AI" } });
        fireEvent.click(sendButton);

        expect(screen.getByText("Hello AI")).toBeInTheDocument();

        // Wait for mock response
        await waitFor(() => {
            expect(screen.getByText(/I processed: "Hello AI"/)).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it("closes the chat window when X button is clicked", () => {
        render(<FloatingActionChat />);
        // Open
        fireEvent.click(screen.getByLabelText("Open Chat"));
        // Close
        const closeBtn = screen.getByLabelText("Close Chat");
        fireEvent.click(closeBtn);
        expect(screen.getByTestId("chat-window")).toHaveClass("opacity-0");
    });
});
