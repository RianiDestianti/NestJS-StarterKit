import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { hash } from "bcryptjs";
import Validator from "validatorjs";
import { UserModel } from "../../models/user.model";
import { AuthMiddleware, AuthUser } from "../../middleware/auth.middleware";
import type { AuthUserData } from "../../types/auth";

@Controller()
@UseGuards(AuthMiddleware)
export class ProfileController {
    @Get('check-auth')
    async getProfile (@AuthUser() user: AuthUserData) {

        const getUser   = await UserModel.where('id', user.id).fetch({ require: false })

        return {
            status  : 200,
            message : 'Success return data user',
            data    : {
                ...user,
                verified    : getUser && getUser.get('verified_at') ? true : false
            }
        }
    }

    @Post('profile/action')
    @HttpCode(200)
    async action (@AuthUser() authUser: AuthUserData, @Body() body: any) {

        let rules = {
            name        : 'required',
            password    : 'min:6'
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        try {
            const user = await UserModel.where('id', authUser.id).fetch({ require: false })
            if(!user) {
                return {
                    status  : 404,
                    message : 'Data not found'
                }
            }

            user.set({
                name    : body.name,
                phone   : body.phone ?? user.get('phone'),
                avatar  : body.avatar ?? user.get('avatar'),
            })

            if(body.password) {
                user.set({ password : await hash(body.password, 10) })
            }

            await user.save()

            return {
                status  : 200,
                message : 'Success saved data'
            }
        } catch (error: any) {
            return {
                status  : 500,
                message : error?.message || 'Failed saved data'
            }
        }
    }
}
