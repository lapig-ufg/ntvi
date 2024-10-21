module.exports = function (app) {
    let Controller = {}
    let language   = app.util.language;
    const prisma   = app.repository.prisma;

    Controller.getAllPoints = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const points = await prisma.point.findMany();
            response.json(points);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getPoint = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const point = await prisma.point.findUnique({
                where: { id: parseInt(request.params.id) }
            });
            response.json(point);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createPoint = async function (request, response) {
        const { latitude, longitude, info } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const point = await prisma.point.create({
                data: { latitude, longitude, info }
            });
            response.status(200).json(point);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updatePoint = async function (request, response) {
        const { id } = request.params;
        const { latitude, longitude, info } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const point = await prisma.point.update({
                where: { id: parseInt(id) },
                data: { latitude, longitude, info }
            });
            response.status(200).json(point);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deletePoint = async function (request, response) {
        const { id } = request.params;
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const point = await prisma.point.delete({
                where: { id: parseInt(id) }
            });
            response.status(200).json(point);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}
