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
var Auth0Strategy= require('passport-auth0')
var compression  = require('compression');
var mcache       = require('memory-cache');

//passport-auth0
var strategy = new Auth0Strategy({
  domain: 'smendoz.auth0.com',
  clientID: 'JDQ85x_CXjcwcwB1Q39CTCgG6hx8Z5G4',
  clientSecret: 'BJWx46YTaTtSC05gxEXyjk6E38MkbkqhTLL2Y_0yOgek3pXRoLYCJm-ms-CwO5wA', // Replace this with the client secret for your app
  callbackURL: 'https://carrea2.tk/callback'
 },
 function(accessToken, refreshToken, extraParams, profile, done) {
   // accessToken is the token to call Auth0 API (not needed in the most cases)
   // extraParams.id_token has the JSON Web Token
   // profile has all the information from the user
   return done(null, profile);
 }
);

passport.use(strategy);

app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



const { url } = require('./config/database');
mongoose.connect(url,{
  useMongoClient:true
});

// var DATABASE_URL = process.env.DATABASE_URL || 'localhost';
// mongoose.connect(`mongodb://${DATABASE_URL}/Proyecto1DB`);

// var db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", function(callback){
//   console.log("Connection Succeeded");
// });
require('./config/passport')(passport);
//configuraciones
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
//middlewares
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret:'a new hope',
  cookie: {},
  resave:false,
  saveUninitialized:true
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
