const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    const prisma = new PrismaClient()

    Controller.getOrganizationByID = async function (request, response) {

        var id = request.param('id')
        // const { id } = request.params
        try {
            const organization = await prisma.organization.findUnique({
                where: {
                    id: parseInt(id),
                },
            })
            response.json(organization)
        }catch (e) {
            console.error(e)
        }
    }

    Controller.getAllOrganizations = async function (request, response) {
        try {
            const organizations = await prisma.organization.findMany({
                select: {
                    id: true,
                    name: true
                },
            })
            response.json(organizations)
        }catch (e) {
            console.error(e)
        }

    }

    return Controller;
}