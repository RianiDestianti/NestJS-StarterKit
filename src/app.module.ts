import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AdminRoutes } from "./routes/admin.routes";
import { UserRoutes } from "./routes/user.routes";

@Module({
  imports: [
    UserRoutes,
    AdminRoutes,
    RouterModule.register([
      { path: 'admin', module: AdminRoutes },
    ]),
  ],
})
export class AppModule {}
