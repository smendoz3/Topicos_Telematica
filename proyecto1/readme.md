# Primer proyecto de la materia Topicos Especiales en Telemática - QA: Seguridad

## Analisis

Se quiere implementar un servicio single sign-on para manejar el login del usuario por medio de cookies del navegador. Adicionalmente implementar un firewall a nivel de maquina y por último usar certificados SSL validados con Let's Encrypt.

## Diseño

- Usando el servicio de Auth0 (SaaS) solucionaremos el problema de API Key, de SSO y de Confidencialidad.
- Amazon facilita el requisito de seguridad usando protocolos de Security groups.
- Let's encrypt permite tener certificados SSL validados de manera muy sencilla con CertBot.

## Implementación

La implementación se hizo en una maquina EC2 dada por Amazon Web Services con sistema operativo Centos7. 
Los pasos a seguir fue primero sacar el certificado SSL con una pagina dummy agregando esto a los volumens del ```docker-compose.yml ```
   ```
   - ./nginx.conf:/etc/nginx/conf.d/default.conf
   - ./letsencrypt-site:/usr/share/nginx/html
   ```
y adicionalmente se modifica el ```nginx.conf``` agregandole lo siguiente para que pase el test de let's encrypt
   ```
   location ~ /.well-known/acme-challenge {
        allow all;
        root /usr/share/nginx/html;
    }

    root /usr/share/nginx/html;
    index index.html;
   ```
El comando para generar el certificado:
   ```
   sudo docker run -it --rm \
   -v /docker-volumes/etc/letsencrypt:/etc/letsencrypt \
   -v /docker-volumes/var/lib/letsencrypt:/var/lib/letsencrypt \
   -v /docker/letsencrypt-docker-nginx/src/letsencrypt/letsencrypt-site:/data/letsencrypt \
   -v "/docker-volumes/var/log/letsencrypt:/var/log/letsencrypt" \
   certbot/certbot \
   certonly --webroot \
   --email youremail@domain.com --agree-tos --no-eff-email \
   --webroot-path=/data/letsencrypt \
   -d carrea2.tk -d www.carrea2.tk
   ```
Una vez tenemos el certificado se desarrolló la acoplación de Auth0, editando primero el  ```app.js``` agregandole :
   ```
   var Auth0Strategy = require('passport-auth0'),
    passport = require('passport');

   //passport-auth0
   var strategy = new Auth0Strategy({
     domain: 'smendoz.auth0.com',
     clientID: 'JDQ85x_CXjcwcwB1Q39CTCgG6hx8Z5G4',
     clientSecret: 'CLIENT_SECRET',
     callbackURL: 'http://carrea2.tk/callback'
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
   app.use(passport.session());
   ```
A nivel de rutas solo fue necesario modificar ```routes/router.js``` los GET de ```/login``` y ```/callback``` de esta forma:
   ```
   router.get('/login',
     passport.authenticate('auth0', {scope: 'openid email profile'}), function (req, res) {
     res.redirect("/");
   });
   
   // Perform the final stage of authentication and redirect to '/user'
   router.get('/callback',
     passport.authenticate('auth0', { failureRedirect: '/login' }),
     function(req, res) {
       if (!req.user) {
         throw new Error('user null');
       }
       res.redirect("/user");
     }
   );
   ```
El resto solo fue pulir vistas y links de navegación

## Pruebas

La prueba mas clara es acceder a la [Pagina Web](https://carrea2.tk) para ver el certificado y probar el login.
Para hacer la prueba del Security group inbound, intentar conectarse con un puerto que no sea HTTP (80), HTTPS (443), SSH (22)

__Condiciones Especiales__
   Al ejecutar la aplicación es necesario tener en cuenta algunos aspectos especiales.
   - Es necesario tener instalado nginx 
   ```
   $ sudo apt-get update
   $ sudo apt-get install nginx 
   ```
   - Una vez instalado, se procede a generar los certificados autofirmados
   ```
   $ sudo mkdir /etc/nginx/ssl
   $ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
   ```
   - Al realizar el ultimo comando, se daran una serie de preguntas de la siguiente forma:
   ```
   Country Name (2 letter code) [AU]:CO
   State or Province Name (full name) [Some-State]:Antioquia
   Locality Name (eg, city) []:Medellin
   Organization Name (eg, company) [Internet Widgits Pty Ltd]:Universidad EAFIT
   Organizational Unit Name (eg, section) []:Departamento de Sistemas
   Common Name (e.g. server FQDN or YOUR name) []:dbenite2.dis.eafit.edu.co
   Email Address []:dbenite2@eafit.edu.co
   ```
   - Con esto listo , ejecutamos la aplicacion en su carpeta.

__Ejecucion de la aplicacion__
* Es necesario tener instalado en la máquina los servicios de Docker y Docker-compose
* Una vez descargado el repositorio, se realizan los siguientes comandos:
###
   ```
    $ sudo docker-compose build
    $ sudo docker-compose up
   ```
   - Se recomienda terminar la ejecución cuando se forme un error, luego de esto realizar el siguiente comando en la carpeta    /etc/nginx/ssl
   
   ```
   $sudo cp nginx.crt ../../../home/username/path/ssl/
   $sudo cp nginx.key ../../../home/username/path/ssl/
   ```
   
###  
* Ejecutar de nuevo los comandos de docker y listo, nuestra aplicacion estará corriendo en nuestro servidor

Se puede acceder a la aplicación actual a través del siguiente link:[smendoz3.dis.eafit.edu.co](https://smendoz3.dis.eafit.edu.co)
O tambien por servicio [Amazon](https://carrea2.tk)
