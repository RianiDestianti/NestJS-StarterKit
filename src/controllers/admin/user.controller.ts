import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from "@nestjs/common";
import Validator from "validatorjs";
import { hash } from "bcryptjs";
import type Knex from "knex";
import { UserModel } from "../../models/user.model";
import { AdminOnly, AuthMiddleware } from "../../middleware/auth.middleware";

@Controller()
@UseGuards(AuthMiddleware, AdminOnly)
export class UserController {
    @Get('users')
    async getData (@Query() query: any) {
        const { page = "1", limit = "10", keyword = "", role = "" } = query;
        const offset = (parseFloat(page) - 1) * parseFloat(limit);

        const result = await UserModel.query((qb: Knex.QueryBuilder) => {
            qb.orderBy('created_at', 'DESC')
            if (keyword) {
                qb.where(function (this: Knex.QueryBuilder) {
                this.where('name', 'like', `%${keyword}%`)
                    .orWhere('email', 'like', `%${keyword}%`)
                    .orWhere('phone', 'like', `%${keyword}%`)
                });
            }

            if (role) {
                qb.where('role_id', role)
            }
        })
        .fetchPage({
            limit       : parseFloat(limit),
            offset,
            withRelated : ['role']
        });

        let users = result.map((item: any) => {
            return {
                id      : item.id,
                name    : item.get('name'),
                phone   : item.get('phone'),
                email   : item.get('email'),
                avatar  : item.get('avatar'),
                role    : item.related('role')?.get('name')
            }
        })

        const totalPages = Math.ceil(result.pagination.rowCount / parseFloat(limit))

        return {
            status  : 200,
            message : 'Success return data user',
            data    : {
                data        : users,
                page        : parseFloat(page),
                limit       : parseFloat(limit),
                total       : {
                    pages   : totalPages,
                    data    : result.pagination.rowCount
                },
            }
        }
    }

    @Post('user/action')
    @HttpCode(200)
    async actionData (@Body() body: any) {
        const id   = body.id ?? 0

        let rules = {
            name        : 'required',
            email       : 'required|email',
            role        : 'required',
            password    : id ? 'min:6' : 'required|min:6',
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const checkEmail = await UserModel.where('email', body.email).where('id', '!=', id).fetch({ require: false })
        if(checkEmail) {
            return {
                status  : 422,
                message : 'The email has been registered',
                data    : {
                    email : ['The email has been registered']
                }
            }
        }

        try {
            const data = await UserModel.where('id', id).fetch({ require: false })

            if(data){

                data.set({
                    name        : body.name,
                    email       : body.email,
                    phone       : body.phone ?? null,
                    role_id     : body.role,
                });

                if(body.password) {
                    data.set({ password : await hash(body.password, 10) })
                }

                await data.save();
            }else{

                await new UserModel({
                    name        : body.name,
                    email       : body.email,
                    phone       : body.phone ?? null,
                    role_id     : body.role,
                    password    : await hash(body.password, 10),
                    avatar      : `https://ui-avatars.com/api/?format=png&name=${encodeURIComponent(body.name)}`,
                    verified_at : new Date(),
                }).save()
            }

            return {
                status  : 200,
                message : 'Success saved data'
            }
        }catch (error : any) {
            return {
                status  : 500,
                message : error?.message || 'Failed saved data'
            }
        }
    }

    @Get('user/:id')
    async getDetail (@Param('id') id: string) {

        const tmpData   = await UserModel.where('id', id).fetch({ require: false, withRelated: ['role'] })
        if(tmpData) {

            const data  = {
                ...tmpData.toJSON({ omitPivot: true }),
                role    : tmpData.get('role_id'),
                roleName: tmpData.related('role')?.get('name'),
            }

            return {
                status  : 200,
                message : 'Success return detail data',
                data    : data
            }
        }else{
            return {
                status  : 404,
                message : 'Data not found'
            }
        }
    }

    @Get('user/delete/:id')
    async deleteData (@Param('id') id: string) {

        const data = await UserModel.where('id', id).fetch({ require: false })
        if(data){

            await data.destroy()

            return {
                status  : 200,
                message : 'Success delete data'
            }
        }else{
            return {
                status      : 404,
                message     : 'Data not found'
            }
        }
    }
}
