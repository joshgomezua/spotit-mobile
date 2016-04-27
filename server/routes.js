module.exports = function(app) {

	app.get('/', function(req, res, next) {
		res.render('index');
	})

	app.get('*', function(req, res, next) {
	  res.status(404).send('Page not found');
	});

}