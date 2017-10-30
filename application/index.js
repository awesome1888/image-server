let express = require('express');
let path = require('path');
// let logger = require('morgan');
let bodyParser = require('body-parser');

let config = require('../config.js');

let routes = require('./router/index');

let app = express();

// Secure traffic only
// todo: implement this
// if (false)
// {
//     app.all('*', function(req, res, next){
//         // console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
//         if (req.secure) {
//             return next();
//         };
//
//         res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
//     });
// }

// uncomment after placing your favicon in /public
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// passport config
// app.use(passport.initialize());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/:file', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.json({
//             message: err.message,
//             error: err
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.json({
//         message: err.message,
//         error: {}
//     });
// });

module.exports = app;
