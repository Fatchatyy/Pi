import jwt from "jsonwebtoken"

export default (req, res, next) => {
    try {
        
        console.log("hello2",req.headers)
        console.log("hello3",req.headers.authorization)
        const token = req.headers.authorization;
        console.log("hello4",token)
        const decodedCode = jwt.verify(req.headers.authorization, process.env.secretKey)
        console.log("hello",decodedCode)
        if (decodedCode) next();
    } catch (error) {
        return res.status(401).send("Unauthorized access")
    }
}