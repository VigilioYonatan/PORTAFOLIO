export class UserForgotPasswordEvent {
	constructor(
		public readonly email: string,
		public readonly recoveryUrl: string,
		public readonly tenantId: number,
	) {}
}
