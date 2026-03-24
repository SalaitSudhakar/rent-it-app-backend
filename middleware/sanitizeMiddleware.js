const sanitizeObject = (obj) => {
    for (let key in obj){
        if (key.startsWith('$') || key.includes(".")){
            delete obj[key];
        }
    }

    return obj
}

const sanitizeMiddleware =  (req, res, next) => {
    sanitizeObject(req.query)
    sanitizeObject(req.params)
    sanitizeObject(req.body)

   next()
}

export default sanitizeMiddleware;