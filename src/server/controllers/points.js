const proj4 = require('proj4');

module.exports = function (app) {
    let Points = {};
    const campaign = app.repository.collections.campaign;
    const points = app.repository.collections.points;
    const mosaics = app.repository.collections.mosaics;
    const status = app.repository.collections.status;

    const getImageDates = function (path, row, callback) {
        const filterMosaic = {'dates.path': path, 'dates.row': row};
        const projMosaic = {dates: {$elemMatch: {path: path, row: row}}};

        mosaics.find(filterMosaic, projMosaic).toArray(function (err, docs) {
            let result = {}

            docs.forEach(function (doc) {
                if (doc.dates && doc.dates[0]) {
                    result[doc._id] = doc.dates[0]['date']
                }
            })

            callback(result)
        })
    }

    const getWindow = function (point) {
        const buffer = 4000
        const coordinates = proj4('EPSG:4326', 'EPSG:900913', [parseFloat(point.lon), parseFloat(point.lat)])

        const ulx = coordinates[0] - buffer
        const uly = coordinates[1] + buffer
        const lrx = coordinates[0] + buffer
        const lry = coordinates[1] - buffer

        const ul = proj4('EPSG:900913', 'EPSG:4326', [ulx, uly])
        const lr = proj4('EPSG:900913', 'EPSG:4326', [lrx, lry])

        return [[ul[1], ul[0]], [lr[1], lr[0]]]
    }

    const findPoint = function (campaign, username, callback) {

        const findOneFilter = {
            "$and": [
                {"userName": {"$nin": [username]}},
                {"$where": 'this.userName.length<' + campaign.numInspec},
                {"campaign": {"$eq": campaign._id}},
                {"underInspection": {$lt: campaign.numInspec}}
            ]
        };

        const currentFilter = {
            "$and": [
                {"userName": {"$nin": [username]}},
                {"$where": 'this.userName.length<' + campaign.numInspec},
                {"campaign": {"$eq": campaign._id}}
            ]
        };

        const countFilter = {
            "$and": [
                {"userName": {$in: [username]}},
                {"campaign": campaign._id}
            ]
        };

        const totalFilter = {
            "$and": [
                {"campaign": {"$eq": campaign._id}}
            ]
        };

        const findOneSort = [['index', 1]]
        const findOneUpdate = {'$inc': {'underInspection': 1}}

        //points.findOne(findOneFilter, { sort: [['index', 1]] }, function(err, point) {
        points.findAndModify(findOneFilter, findOneSort, findOneUpdate, {}, function (err, object) {
            point = object.value
            if (point) {
                points.count(totalFilter, function (err, total) {
                    points.count(countFilter, function (err, count) {
                        getImageDates(point.path, point.row, function (dates) {
                            point.dates = dates

                            point.bounds = getWindow(point)

                            var statusId = username + "_" + campaign._id
                            status.updateOne({"_id": statusId}, {
                                $set: {
                                    "campaign": campaign._id,
                                    "status": "Online",
                                    "name": username,
                                    "atualPoint": point._id,
                                    "dateLastPoint": new Date()
                                }
                            }, {
                                upsert: true
                            })

                            var result = {};
                            result['point'] = point;
                            result['total'] = total;
                            result['current'] = point.index;
                            result['user'] = username;
                            result['count'] = count;

                            callback(result);
                        })
                    })
                });
            } else {
                points.count(totalFilter, function (err, total) {
                    points.count(countFilter, function (err, count) {

                        var result = {};
                        result['point'] = {};
                        result['total'] = total;
                        result['current'] = total
                        result['user'] = username;
                        result['count'] = count;
                        callback(result);
                    })
                });
            }
        });
    };

    const classConsolidate = function (point, pointDb, user) {
        let landUseInspections = {}
        let classConsolidated = []

        pointDb.inspection.push(point.inspection)

        for (let i in pointDb.inspection) {

            let inspection = pointDb.inspection[i]
            for (let j in inspection.form) {

                let form = inspection.form[j]
                for (let year = form.initialYear; year <= form.finalYear; year++) {

                    if (!landUseInspections[year])
                        landUseInspections[year] = [];

                    landUseInspections[year].push(form.landUse)
                }

            }

        }

        for (let year = user.campaign.initialYear; year <= user.campaign.finalYear; year++) {
            let landUseCount = {};
            let flagConsolid = false;

            for (let i = 0; i < landUseInspections[year].length; i++) {
                let landUse = landUseInspections[year][i]

                if (!landUseCount[landUse])
                    landUseCount[landUse] = 0

                landUseCount[landUse]++
            }

            let numElemObj = Object.keys(landUseCount).length;
            let countNumElem = 0;

            for (let landUse in landUseCount) {
                countNumElem++

                if (landUseCount[landUse] > user.campaign.numInspec / 2 && flagConsolid == false) {
                    flagConsolid = true;
                    classConsolidated.push(landUse)

                } else if (numElemObj == countNumElem && flagConsolid == false) {
                    flagConsolid = true;
                    classConsolidated.push("Não consolidado")
                }
            }
        }

        return {"classConsolidated": classConsolidated}
    }

    const creatPoint = function(point, callback) {
        let years = [];
        let yearlyInspections = [];

        if(point) {
            for(let i=0; i < point.userName.length; i++) {
                let userName = point.userName[i];
                let inspections = point.inspection[i];

                let yearlyInspection = {
                    userName: userName,
                    landUse: []
                }

                inspections.form.forEach(function(i) {
                    for( let year = i.initialYear; year <= i.finalYear; year++) {
                        yearlyInspection.landUse.push(i.landUse);
                    }
                });

                yearlyInspections.push(yearlyInspection)
            }

            if(point.inspection[0]) {
                point.inspection[0].form.forEach(function(i) {
                    for( let year = i.initialYear; year <= i.finalYear; year++) {
                        years.push(year);
                    }
                });
            }
        } else {
            point = {};
        }

        point.inspection = yearlyInspections;
        point.years = years;

        getImageDates(point.path, point.row, function(dates) {
            point.dates = dates

            let result = {
                "point": point
            }

            return callback(result);
        });
    }

    Points.getCurrentPoint = function (request, response) {
        const user = request.session.user;

        findPoint(user.campaign, user.name, function (result) {
            request.session.currentPointId = result.point._id;

            response.send(result);
            response.end();
        })
    };

    Points.updatePoint = function (request, response) {
        const point = request.body.point;
        const user = request.session.user;

        point.inspection.fillDate = new Date();

        let updateStruct = {
            '$push': {
                "inspection": point.inspection,
                "userName": user.name
            }
        };

        points.findOne({'_id': point._id}, function (err, pointDb) {

            if (pointDb.userName.length === user.campaign.numInspec - 1) {
                updateStruct['$set'] = classConsolidate(point, pointDb, user);
            }

            points.update({'_id': pointDb._id}, updateStruct, function (err, item) {
                //findPoint(user.campaign, user.name, function(result) {
                //	request.session.currentPointId = result.point._id;

                var result = {"success": (err == null), "err": err}

                response.send(result);
                response.end();
                //});
            });

        });
    };

    Points.getPoint = async function (request, response) {
        try {

            const { campaignId, pointId } = request.params;

            const mos   = await mosaics.find({campaignId: parseInt(campaignId)}).toArray();
            const point = await points.findOne({index: parseInt(pointId), campaignId: parseInt(campaignId)})
            console.log(mos, point)
            if (mos.length > 0 && point) {

                point['bounds'] = getWindow(point);
                point['mosaics'] = mos;

                response.status(200).json(point);
                response.end();

            } else {
                response.status(404).json({status: 404, message: 'Point not found'});
                response.end();
            }

        } catch (e) {
            response.status(400).json({status: 400, message: e.message});
            response.end();
        }
    }
    Points.getPoints = async function (request, response) {
        try {

            const {campaignId} = request.params;

            const pontos = await points.aggregate(
                [
                    {$match: {campaignId: parseInt(campaignId)}},
                    {
                        "$project": {
                            _id: 1,
                            index: 1
                        }
                    },
                    {$sort: {index: 1}}
                ]
            ).toArray();

            if (pontos.length > 0) {

                response.status(200).json(pontos);
                response.end();

            } else {
                response.status(404).json({status: 404, message: 'Points not found'});
                response.end();
            }

        } catch (e) {
            response.status(400).json({status: 400, message: e.message});
            response.end();
        }
    }
    Points.getCampaign = async function (request, response) {
        try {
            const {campaignId} = request.params;
            const camp = campaign.findOne({_id: parseInt(campaignId)});
            camp.then(result => {
                response.status(200).json(result);
                response.end();
            }).catch(e =>{
                response.status(404).json({status: 404, message: e});
                response.end();
            })

        } catch (e) {
            response.status(400).json({status: 400, message: e.message});
            response.end();
        }
    }
    Points.getResults = async function(request, response) {
        let { campaignId, index, landUse, userName, biome, uf, timePoint, agreementPoint } = request.body;
        campaignId = parseInt(campaignId);
        index = parseInt(index);

        let pipeline = null;
        const filter = {
            "campaignId": campaignId
        };

        if( userName ) {
            filter["userName"] = userName;
        }

        if(landUse) {
            filter["inspection.form.landUse"] = landUse;
        }

        if(uf) {
            filter["uf"] = uf;
        }

        if(biome) {
            filter["biome"] = biome;
        }

        if(timePoint) {
            pipeline = [
                {"$match": filter},
                {"$project": {mean: {"$avg": "$inspection.counter"}}},
                {"$sort": {mean: - 1}},
                {"$skip": index - 1},
                {"$limit": 1}
            ]
        }

        if(agreementPoint) {
            if(userName || !landUse) {
               pipeline = [
                    {$match: filter},
                    {$project: {
                            consolidated: {
                                $size: {
                                    $ifNull: [
                                        {
                                            $filter: {
                                                input: "$classConsolidated",
                                                as: "consolidated",
                                                cond: { $and: [
                                                        { $eq: ['$$consolidated', 'Não consolidado']}
                                                    ]}
                                            }
                                        },
                                        []
                                    ]
                                }
                            }
                        }},
                    {$sort: {'consolidated': -1}},
                    {$skip: index - 1}
                ]
            } else {
               pipeline = [
                    {$match: filter},
                    {$project: {
                            consolidated: {
                                $size: {
                                    $ifNull: [
                                        {
                                            $filter: {
                                                input: "$classConsolidated",
                                                as: "consolidated",
                                                cond: { $and: [
                                                        { $eq: ['$$consolidated', landUse]}
                                                    ]}
                                            }
                                        },
                                        []
                                    ]
                                }
                            }
                        }},
                    {$sort: {'consolidated': -1}},
                    {$skip: index - 1}
                ]
            }
        }

        if(pipeline === undefined || pipeline === null) {
           pipeline = [
                {"$match": filter},
                {"$project": { index: 1, mean: {"$avg": "$inspection.counter"}}},
                {"$sort": { index: 1}},
                {"$skip": index - 1},
                {"$limit": 1 }
            ]
        }

        let objPoints = {};

        let aggregateElem = await points.aggregate(pipeline).toArray();

        aggregateElem = aggregateElem[0];

        points.findOne({'_id': aggregateElem._id}, function(err, newPoint) {
            let point = newPoint;
            let pointTimeList = [];
            let pointTimeTotal = 0;

            newPoint.inspection.forEach(function(timeInspectionUser) {
                pointTimeList.push(timeInspectionUser.counter)
                pointTimeTotal += timeInspectionUser.counter;
            })

            pointTimeTotal = pointTimeTotal / newPoint.userName.length;

            let map = function() {
                for(let i=0; i<this.userName.length; i++) {
                    emit(this.userName[i], this.inspection[i].counter)
                }
            }

            let reduce = function(keyName, values) {
                return Array.sum(values) / values.length;
            }

            points.mapReduce(map, reduce, {
                out: {inline: 1},
                query: {'campaignId': filter.campaignId}
            }, function(err, mapReducePoint) {
                let nameList = [];
                let meanPointList = [];
                let meanPointTotal = 0;

                newPoint.userName.forEach(function(nameUser) {
                    mapReducePoint.forEach(function(user) {
                        if(nameUser == user._id) {
                            nameList.push(user._id)
                            meanPointList.push(user.value)
                            meanPointTotal += user.value;
                        }
                    })
                })

                point.bounds = getWindow(point)

                point.dataPointTime = [];

                for(let i=0; i<newPoint.userName.length; i++) {
                    point.dataPointTime.push({
                        'name': nameList[i],
                        'totalPointTime': pointTimeList[i],
                        'meanPointTime': meanPointList[i]
                    })
                }

                point.dataPointTime.push({
                    'name': 'Tempo médio',
                    'totalPointTime': pointTimeTotal,
                    'meanPointTime': meanPointTotal
                })

                point.timePoints = point.timePoint;
                point.originalIndex = point.index;
                point.index = index;

                creatPoint(point, function(result) {
                    points.countDocuments(filter, function(err, count) {

                        result.totalPoints = count
                        response.send(result)
                        response.end()
                    })
                })
            })
        })
    }

    return Points;
}