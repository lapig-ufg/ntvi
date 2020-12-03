const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    const prisma = new PrismaClient()

    Controller.login = async function (request, response) {
        const { email, password } = request.body

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(id),
                },
            })
            response.json(post)
        }catch (e) {
            console.error(e)
        }
    }

    Controller.register = async function (request, response) {

        const {fullName, confirmPassword, email, terms } = request.body

        response.json({
            confirmPassword: confirmPassword,
            email: email,
            fullName: fullName,
            terms: terms
        });
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true
                },
            })
            response.json(users)
        } catch (e) {
            console.error(e)
        }
    }

    return Controller;
}