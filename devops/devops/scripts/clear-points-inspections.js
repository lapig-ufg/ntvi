db.getCollection('points').update({ }, { "$set": { "underInspection": 0, "userName" : [], "inspection" : [] }}, { multi: 1} )