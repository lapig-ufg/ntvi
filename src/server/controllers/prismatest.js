const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    const prisma = new PrismaClient()

    Controller.getUserByID = async function (request, response) {

        var id = request.param('id')
        // const { id } = request.params
        const post = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
            },
        })
        response.json(post)
    }

    return Controller;
}