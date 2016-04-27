var express = require('express');
var path = require('path');
var app = express();

// port
var port = process.env.PORT || 3000;

// view engine setup
var ejsmate_engine = require('ejs-mate');
app.engine('ejs', ejsmate_engine);
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

// routes
app.use( express.static( __dirname + '/public' ) );
var routes = require('./server/routes')(app);

app.listen(port, "0.0.0.0", function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info("Server is listening on port %s. Open up http://localhost:%s/ in your browser.", port, port);
  }
});
