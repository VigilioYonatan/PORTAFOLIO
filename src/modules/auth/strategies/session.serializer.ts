import type { UserAuth } from "@modules/user/schemas/user.schema";
import { UserService } from "@modules/user/services/user.service";
import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly userService: UserService) {
		super();
	}

	serializeUser(
		user: UserAuth,
		done: (
			err: Error | null,
			payload: { id: number; tenant_id: number },
		) => void,
	): void {
		done(null, { id: user.id, tenant_id: user.tenant_id });
	}

	async deserializeUser(
		payload: { id: number; tenant_id: number },
		done: (err: Error | null, user: UserAuth | null) => void,
	): Promise<void> {
		try {
			// Delegate to UserService.show() which handles cache internally
			const { user: userSchema } = await this.userService.show(
				payload.tenant_id,
				payload.id,
			);

			// Convert UserSchema to UserAuth (exclude password)
			done(null, userSchema as UserAuth);
		} catch (error) {
			done(error as Error, null);
		}
	}
}
