module.exports = function (app) {
    let Controller = {}
    let language   = app.util.language;
    const prisma   = app.repository.prisma;

    Controller.getAllImages = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const images = await prisma.image.findMany();
            response.json(images);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getImage = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const image = await prisma.image.findUnique({
                where: { id: parseInt(request.params.id) }
            });
            response.json(image);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createImage = async function (request, response) {
        const { url } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const image = await prisma.image.create({
                data: { url }
            });
            response.status(200).json(image);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateImage = async function (request, response) {
        const { id } = request.params;
        const { url } = request.body;
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const image = await prisma.image.update({
                where: { id: parseInt(id) },
                data: { url }
            });
            response.status(200).json(image);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteImage = async function (request, response) {
        const { id } = request.params;
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const image = await prisma.image.delete({
                where: { id: parseInt(id) }
            });
            response.status(200).json(image);
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}
