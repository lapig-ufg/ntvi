const { PrismaClient } = require('@prisma/client')
const dotenv = require("dotenv-safe");

const result = dotenv.config({
    allowEmptyValues: true,
    example: '.env'
});
if (result.error) {
    throw result.error;
}
const { parsed: env } = result;

module.exports = function (app) {
    let Controller = {}
    const jwt = require('jsonwebtoken');
    const prisma = new PrismaClient()
    const CryptoJS = require("crypto-js");

    Controller.login = async function (request, response) {
        const { email, password } = request.body

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            })

            const hash = CryptoJS.MD5(password).toString();

            if(user.email === email && user.password === hash){
                const id = user.id;
                const token = jwt.sign({ id }, env.SECRET, {
                    expiresIn: 3800
                });
                return response.json({ auth: true, token: token });
            }
            response.status(500).json({message: 'Login inválido!'});
        }catch (e) {
            console.error(e)
            response.status(500).json({message: 'Erro ao consultar o usuário: ' + e + '.'});
        }
    }

    Controller.register = async function (request, response) {

        const {fullName, confirmPassword, email, terms } = request.body;
        const hash = CryptoJS.MD5(confirmPassword).toString();
        try {
            const user = await prisma.user.create({
                data:{
                    name: fullName,
                    email: email,
                    password: hash,
                    terms: terms
                },
            });
            response.json(user)
        } catch (e) {
            console.error(e)
            response.status(500).json({message: 'Erro ao consultar o usuário: ' + e + '.'});
        }
    }

    return Controller;
}