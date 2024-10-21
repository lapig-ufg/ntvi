module.exports = function (app) {
    let Controller = {}
    let language   = app.util.language;
    const prisma   = app.repository.prisma;

    Controller.getAllInspections = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const inspections = await prisma.inspection.findMany();
            response.json(inspections);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getInspection = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const inspection = await prisma.inspection.findUnique({
                where: { id: parseInt(request.params.id) }
            });
            response.json(inspection);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createInspection = async function (request, response) {
        const { date, useClassId, inspectorId, pointId } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const inspection = await prisma.inspection.create({
                data: { date, useClassId, inspectorId, pointId }
            });
            response.status(200).json(inspection);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateInspection = async function (request, response) {
        const { id } = request.params;
        const { date, useClassId, inspectorId, pointId } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const inspection = await prisma.inspection.update({
                where: { id: parseInt(id) },
                data: { date, useClassId, inspectorId, pointId }
            });
            response.status(200).json(inspection);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteInspection = async function (request, response) {
        const { id } = request.params;
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const inspection = await prisma.inspection.delete({
                where: { id: parseInt(id) }
            });
            response.status(200).json(inspection);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}
