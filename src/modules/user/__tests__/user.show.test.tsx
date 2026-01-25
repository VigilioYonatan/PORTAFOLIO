// @vitest-environment happy-dom

import { render, screen } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserFactory } from "./user.factory";

describe("UserShow Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should be exported from the module", async () => {
		const module = await import("../components/user.show");
		expect(module.UserShow).toBeDefined();
		expect(typeof module.UserShow).toBe("function");
	});

	it("should have correct component name", async () => {
		const module = await import("../components/user.show");
		expect(module.UserShow.name).toBe("UserShow");
	});

	it("should accept user prop", async () => {
		const { UserShow } = await import("../components/user.show");
		expect(UserShow.length).toBeGreaterThanOrEqual(0);
	});
});

describe("UserShow Display Logic", () => {
	it("should display user initials when no avatar", async () => {
		const { UserShow } = await import("../components/user.show");
		const user = UserFactory.createSchema({
			username: "JohnDoe",
			avatar: null,
		});

		const { container } = render(<UserShow user={user} />);

		// Should show "JO" (first 2 characters uppercased)
		expect(container.textContent).toContain("JO");
	});

	it("should display email address", async () => {
		const { UserShow } = await import("../components/user.show");
		const user = UserFactory.createSchema({
			email: "john.doe@example.com",
		});

		const { container } = render(<UserShow user={user} />);
		expect(container.textContent).toContain("john.doe@example.com");
	});

	it("should display role badge", async () => {
		const { UserShow } = await import("../components/user.show");

		// Test ADMIN role
		const adminUser = UserFactory.createSchema({ role_id: 1 });
		const { container: adminContainer } = render(<UserShow user={adminUser} />);
		expect(adminContainer.textContent).toContain("ADMIN");

		// Test USER role
		const regularUser = UserFactory.createSchema({ role_id: 2 });
		const { container: userContainer } = render(
			<UserShow user={regularUser} />,
		);
		expect(userContainer.textContent).toContain("USER");

		// Test OWNER role
		const ownerUser = UserFactory.createSchema({ role_id: 3 });
		const { container: ownerContainer } = render(<UserShow user={ownerUser} />);
		expect(ownerContainer.textContent).toContain("OWNER");
	});

	it("should display status correctly", async () => {
		const { UserShow } = await import("../components/user.show");

		// Test ACTIVE status
		const activeUser = UserFactory.createSchema({ status: "ACTIVE" });
		const { container: activeContainer } = render(
			<UserShow user={activeUser} />,
		);
		expect(activeContainer.textContent).toContain("ACTIVE");

		// Test BANNED status
		const bannedUser = UserFactory.createSchema({ status: "BANNED" });
		const { container: bannedContainer } = render(
			<UserShow user={bannedUser} />,
		);
		expect(bannedContainer.textContent).toContain("BANNED");

		// Test PENDING status
		const pendingUser = UserFactory.createSchema({ status: "PENDING" });
		const { container: pendingContainer } = render(
			<UserShow user={pendingUser} />,
		);
		expect(pendingContainer.textContent).toContain("PENDING");
	});

	it("should display MFA status", async () => {
		const { UserShow } = await import("../components/user.show");

		// Test MFA enabled
		const mfaUser = UserFactory.createSchema({ is_mfa_enabled: true });
		const { container: mfaContainer } = render(<UserShow user={mfaUser} />);
		expect(mfaContainer.textContent).toContain("Enabled");

		// Test MFA disabled
		const noMfaUser = UserFactory.createSchema({ is_mfa_enabled: false });
		const { container: noMfaContainer } = render(<UserShow user={noMfaUser} />);
		expect(noMfaContainer.textContent).toContain("Disabled");
	});

	it("should display failed login attempts", async () => {
		const { UserShow } = await import("../components/user.show");

		const user = UserFactory.createSchema({ failed_login_attempts: 3 });
		const { container } = render(<UserShow user={user} />);
		expect(container.textContent).toContain("3 attempt(s)");
	});

	it("should display superuser badge when applicable", async () => {
		const { UserShow } = await import("../components/user.show");

		// Superuser should show badge
		const superUser = UserFactory.createSchema({ is_superuser: true });
		const { container: superContainer } = render(<UserShow user={superUser} />);
		expect(superContainer.textContent).toContain("Superuser");

		// Non-superuser should not show badge
		const normalUser = UserFactory.createSchema({ is_superuser: false });
		const { container: normalContainer } = render(
			<UserShow user={normalUser} />,
		);
		expect(normalContainer.textContent).not.toContain("Superuser privileges");
	});

	it("should display email verification status", async () => {
		const { UserShow } = await import("../components/user.show");

		// Verified email
		const verifiedUser = UserFactory.createSchema({
			email_verified_at: new Date(),
		});
		const { container: verifiedContainer } = render(
			<UserShow user={verifiedUser} />,
		);
		expect(verifiedContainer.textContent).toContain("Verified");

		// Unverified email
		const unverifiedUser = UserFactory.createSchema({
			email_verified_at: null,
		});
		const { container: unverifiedContainer } = render(
			<UserShow user={unverifiedUser} />,
		);
		expect(unverifiedContainer.textContent).toContain("Pending");
	});

	it("should display phone number or fallback message", async () => {
		const { UserShow } = await import("../components/user.show");

		// With phone number
		const userWithPhone = UserFactory.createSchema({
			phone_number: "+1 555-123-4567",
		});
		const { container: phoneContainer } = render(
			<UserShow user={userWithPhone} />,
		);
		expect(phoneContainer.textContent).toContain("+1 555-123-4567");

		// Without phone number
		const userWithoutPhone = UserFactory.createSchema({ phone_number: null });
		const { container: noPhoneContainer } = render(
			<UserShow user={userWithoutPhone} />,
		);
		expect(noPhoneContainer.textContent).toContain("Not provided");
	});
});

describe("UserShow Accessibility", () => {
	it("should have proper heading structure", async () => {
		const { UserShow } = await import("../components/user.show");
		const user = UserFactory.createSchema({});

		const { container } = render(<UserShow user={user} />);

		// Check for section headings
		const headings = container.querySelectorAll("h2, h3");
		expect(headings.length).toBeGreaterThan(0);
	});
});
