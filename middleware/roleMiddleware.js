export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)){
            const error = new Error("You are not authorized")
            error.statusCode = 403

            return next(error)
        }

        next()
    }
}