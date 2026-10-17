export type AuthUserData = {
    id      : number
    name    : string
    email   : string
    role    : string
    avatar  : string
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUserData
        }
    }
}
