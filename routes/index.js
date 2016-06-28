'use strict';

var fs = require('fs');

module.exports = function(app) {

  fs.readdirSync(__dirname).forEach(function(file) {
    if ((file === 'index.js') || (file[0] === '.')) { return; }
    var name = file.substr(0, file.indexOf('.'));
    console.log(name);
    require('./' + name + '.routes')(app);
  });

  // home route
  app.route('/').get(function(req,res){
    return res.json({statusCode: 200, msg:'API'});
  });

  // final fallback
  app.route('/*')
    .get(function(req,res){
      return res.json({status: 'not found'});
    });
};
