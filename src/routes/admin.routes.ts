import { Module } from "@nestjs/common";
import { UserController } from "../controllers/admin/user.controller";
import { RoleController } from "../controllers/admin/role.controller";

/**
 * Route admin (prefix /admin, didaftarkan di app.module.ts)
 *
 * GET  /admin/roles             (auth, admin)
 * GET  /admin/users             (auth, admin)
 * POST /admin/user/action       (auth, admin)
 * GET  /admin/user/:id          (auth, admin)
 * GET  /admin/user/delete/:id   (auth, admin)
 */
@Module({
  controllers: [
    UserController,
    RoleController,
  ],
})
export class AdminRoutes {}
