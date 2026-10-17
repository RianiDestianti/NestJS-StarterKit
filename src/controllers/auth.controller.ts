import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import Validator from "validatorjs";
import { UserModel } from "../models/user.model";
import { VerificationModel } from "../models/verification.model";
import { JWT_SECRET } from "../middleware/auth.middleware";
import { generateNumber } from "../repositories/generate";
import RegistrationNotification from "../notifications/register.notification";
import RetryNotification from "../notifications/retry.notification";

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '1y') as SignOptions['expiresIn']

@Controller()
export class AuthController {
    @Post('login')
    @HttpCode(200)
    async login (@Body() body: any) {

        let rules = {
            email       : 'required|email',
            password    : 'required'
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const user = await UserModel.where('email', body.email).fetch({ require: false, withRelated: ['role'] })

        if(!user) {
            return {
                status  : 401,
                message : 'Invalid credentials'
            }
        }

        if(body.role && body.role != user.related('role').get('name')) {
            return {
                status  : 401,
                message : 'Invalid credentials'
            }
        }

        const match = await compare(body.password, user.get('password'))
        if (!match) {
            return {
                status  : 401,
                message : 'Invalid credentials'
            }
        }

        const token = sign({ email: user.get('email') , role: user.related('role').get('name') }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
        return {
            status  : 200,
            message : 'Success logined',
            data    : {
                key     : token,
                email   : user.get('email')
            }
        }
    }

    @Post('register')
    @HttpCode(200)
    async register (@Body() payload: any) {

        let rules = {
            name        : 'required',
            email       : 'required|email',
            password    : 'required|min:6'
        }

        let validation = new Validator(payload , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const checkUser = await UserModel.where('email', payload.email).fetch({ require: false })

        if(checkUser) {
            return {
                status  : 422,
                message : 'The email has been registered',
                data    : {
                    email : ['The email has been registered']
                }
            }
        }

        try {
            await new UserModel({
                email       : payload.email,
                name        : payload.name,
                password    : await hash(payload.password, 10),
                role_id     : 3,
                avatar      : `https://ui-avatars.com/api/?format=png&name=${encodeURIComponent(payload.name)}`
            }).save()

            const token     = generateNumber(6)
            await new VerificationModel({
                email   : payload.email,
                value   : token
            }).save()

            RegistrationNotification.send(payload.email, payload.name, token)
            const register  = sign({ email: payload.email , role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

            return {
                status  : 200,
                message : 'Successfully register',
                data    : {
                    key     : register,
                    email   : payload.email
                }
            }
        } catch (error: any) {
            return {
                status  : 500,
                message : error?.message || 'Failed register',
                data    : null
            }
        }
    }

    @Post('verify')
    @HttpCode(200)
    async verify (@Body() body: any) {

        let rules = {
            email       : 'required|email',
            code        : 'required'
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const user = await UserModel.where('email', body.email).fetch({ require: false })
        if(!user) {
            return {
                status  : 422,
                message : 'Invalid code',
            }
        }

        const getVerification = await VerificationModel.where('email', body.email).where('value', body.code).fetch({ require: false })
        if(!getVerification) {
            return {
                status  : 422,
                message : 'Invalid code',
            }
        }

        user.set({
            verified_at : new Date()
        })
        await user.save()

        await VerificationModel.query().where('email', body.email).del()

        return {
            status  : 200,
            message : 'Successfully verification',
        }
    }

    @Post('retry-code')
    @HttpCode(200)
    async retryCode (@Body() payload: any) {

        let rules = {
            email       : 'required|email',
        }

        let validation = new Validator(payload , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const user      = await UserModel.where('email', payload.email).fetch({ require: false })

        await VerificationModel.query().where('email', payload.email).del()

        const token     = generateNumber(6)
        await new VerificationModel({
            email   : payload.email,
            value   : token
        }).save()

        const name      = user ? user.get('name') : 'User'

        RetryNotification.send(payload.email, name, token)

        return {
            status  : 200,
            message : 'Successfully send code'
        }
    }

    @Post('reset-password')
    @HttpCode(200)
    async resetPassword (@Body() body: any) {

        let rules = {
            email       : 'required|email',
            password    : 'required|min:6'
        }

        let validation = new Validator(body , rules);
        if(validation.fails()){
            return {
                status  : 422,
                message : 'Validation failed',
                data    : validation.errors.all()
            }
        }

        const email = String(body.email ?? '').trim()
        const user  = await UserModel.where('email', email).fetch({ require: false })

        if(!user) {
            return {
                status  : 422,
                message : 'Email tidak ditemukan',
                data    : {
                    email : ['Email tidak ditemukan.']
                }
            }
        }

        user.set({
            password    : await hash(body.password, 10),
        })
        await user.save()

        return {
            status  : 200,
            message : 'Password berhasil direset'
        }
    }
}
