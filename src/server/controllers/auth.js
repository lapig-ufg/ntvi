const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const env = process.env;

module.exports = function (app) {
    let Controller = {}
    let _language  = app.util.language;
    const prisma   = app.repository.prisma;

    Controller.login = async function (request, response) {
        const { lang } = request.headers;
        const texts = _language.getLang(lang);

        try {
            const { email, password } = request.body
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            })

            const hash = CryptoJS.MD5(password).toString();

            if(user.email === email && user.password === hash){
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    role: user.typeUser,
                    theme: user.theme,
                    language: user.language,
                };
                const token = jwt.sign(payload, env.SECRET, {
                    expiresIn: '24h'
                });
                return response.json({
                    token: token,
                });
            }
            response.status(500).json({message: texts.login_msg_invalid});
        }catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.register = async function (request, response) {
        const { lang } = request.headers;
        const texts = _language.getLang(lang);

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
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.typeUser,
                theme: user.theme,
                language: user.language,
            };
            const token = jwt.sign(payload, env.SECRET, {
                expiresIn: '24h'
            });
            return response.json({
                token: token,
            });

            response.status(500).json({message: texts.login_msg_invalid});
        } catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.oauth = async function (request, response) {
        const { name, email, picture, locale } = request.body;

        let { lang } = request.headers;

        // Check if locale exists and if not, set lang to default
        if (!lang) {
            if (locale && typeof locale === 'string' && locale.includes('pt')) {
                lang = 'pt';
            } else {
                lang = 'en';
            }
        }

        const texts = _language.getLang(lang);
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (user) {
                if (!user.picture && picture != '') {
                    await prisma.user.update({
                        where: { id: parseInt(user.id) },
                        data: { picture: picture },
                    });
                }
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    role: user.typeUser,
                    theme: user.theme,
                    language: user.language,
                };
                const token = jwt.sign(payload, env.SECRET, {
                    expiresIn: '24h',
                });

                return response.json(token);
            } else {
                const newUser = await prisma.user.create({
                    data: {
                        name: name,
                        email: email,
                        picture: picture,
                        terms: false,
                    },
                });

                const payload = {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    picture: newUser.picture,
                    role: newUser.typeUser,
                    theme: newUser.theme,
                    language: newUser.language,
                };
                const token = jwt.sign(payload, env.SECRET, {
                    expiresIn: '24h',
                });

                return response.json(token);
            }
        } catch (e) {
            console.error(e);
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    };

    Controller.logout   = async function (request, response) {
        response.json({ auth: false, token: null });
    }

    return Controller;
}