import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/auth.controller";
import { ProfileController } from "../controllers/user/profile.controller";

/**
 * Route user (tanpa prefix)
 *
 * POST /login
 * POST /register
 * POST /verify
 * POST /retry-code
 * POST /reset-password
 * GET  /check-auth        (auth)
 * POST /profile/action    (auth)
 */
@Module({
  controllers: [
    AuthController,
    ProfileController,
  ],
})
export class UserRoutes {}
