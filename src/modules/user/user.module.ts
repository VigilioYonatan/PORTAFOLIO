import { Module } from "@nestjs/common";
import { UserCache } from "./cache/user.cache";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";

@Module({
	controllers: [UserController],
	providers: [UserRepository, UserService, UserCache],
	exports: [UserRepository, UserService, UserCache],
})
export class UserModule {}
