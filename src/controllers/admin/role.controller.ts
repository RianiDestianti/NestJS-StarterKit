import { Controller, Get, UseGuards } from "@nestjs/common";
import { RoleModel } from "../../models/role.model";
import { AdminOnly, AuthMiddleware } from "../../middleware/auth.middleware";

@Controller()
@UseGuards(AuthMiddleware, AdminOnly)
export class RoleController {
    @Get('roles')
    async getData () {

        const data = await RoleModel
        .fetchAll().map((item: any) => {
            return {
                id      : item.id,
                name    : item.get('name'),
            }
        });

        return {
            status  : 200,
            message : 'Success return data',
            data    : data
        }
    }
}
