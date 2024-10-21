module.exports = function(app) {

	var Login = {};

	var users = app.repository.collections.users;
	var points = app.repository.collections.points;
	var campaigns = app.repository.collections.campaign;
	var statusLogin = app.repository.collections.status;

	Login.autenticateUser = function(request, response, next) {
		if(request.session.user && request.session.user.name) {
			next();
		} else {
			response.write("I should not be here !!!")
			response.end()
		}
	}

	Login.getUser = function(request, response) {
		var user = request.session.user;
		response.send(user);
		response.end();
	}

	Login.enterTvi = function(request, response) {
		const campaignId = request.param('campaign');
		const name = request.param('name');
		const senha = request.param('senha');

		// Variável para armazenar o resultado final
		const result = {
			campaign: "",
			name: "",
			type: false
		};

		campaigns.findOne({ "_id": campaignId }, function(err, campaign) {
			if (err) {
				return response.status(500).send('Erro ao buscar campanha');
			}

			if (!campaign) {
				// Se a campanha não for encontrada, envia o resultado vazio
				return response.status(404).send(result);
			}

			// Encontra o usuário admin para verificar as credenciais
			users.findOne({ _id: 'admin' }, function(err, adminUser) {
				if (err) {
					return response.status(500).send('Erro ao buscar usuário admin');
				}

				// Verifica se a senha é correta (da campanha ou do admin)
				if ((senha === campaign.password) || (senha === adminUser.password)) {

					// Cria a sessão do usuário
					request.session.user = {
						"name": name,
						"campaign": campaign._id,
						"type": "inspector"
					};

					// Verifica se o usuário é admin
					if (name === 'admin' && senha === adminUser.password) {
						request.session.user.type = 'supervisor';
					}

					// Salva a campanha na sessão
					request.session.user.campaign = campaign;
					const result = request.session.user;

					// Salva a sessão e envia a resposta
					request.session.save(function(err) {
						if (err) {
							console.log('Erro ao salvar sessão:', err);
							return response.status(500).send('Erro ao salvar sessão');
						}
						return response.send(result);  // Envia a resposta após salvar a sessão
					});
				} else {
					// Senha incorreta, envia o resultado padrão sem modificar a sessão
					return response.status(401).send('Senha incorreta');
				}
			});
		});
	};

	Login.logoff = function(request, response) {

		var name = request.session.user.name;
		var user = request.session.user;
		var campaign = request.session.user.campaign;

		if(user.type == 'inspector') {

			statusLogin.update({"_id": name+"_"+campaign._id}, {$set:{"status":"Offline"}})
			points.update({'_id': request.session.currentPointId}, {'$inc':{'underInspection': -1}})

			delete request.session.user;
			delete request.session.name;
			delete request.session.currentPointId;

			response.write("deslogado");
			response.end();

		} else {

			delete request.session.user;
			delete request.session.name;

			response.write("deslogado");
			response.end();
		}
	}

	app.on('socket-connect', function(session) {
	})

	app.on('socket-disconnect', function(session) {

		if(session && session.user && session.user.type == 'inspector') {

			var name = session.user.name;
			var campaign = session.user.campaign;

			statusLogin.update({"_id": name+"_"+campaign._id}, {$set:{"status":"Offline"}})
			points.update({'_id': session.currentPointId}, {'$inc':{'underInspection': -1}})
		}
	})

	return Login;
}