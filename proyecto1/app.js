var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var path         = require('path');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var module       = require('module');
var passport     = require('passport');

const { url } =require('./config/database');
mongoose.connect(url,{
  useMongoClient:true
});

require('./config/passport')(passport);
//configuraciones
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
//middlewares
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret:'a new hope',
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//rutas
require('./routes/router.js')(app,passport);
//archivos estaticos
app.use(express.static(path.join(__dirname,'public')));

app.listen(app.get('port'), () =>{
  console.log('Servidor en el puerto',app.get('port'));
});