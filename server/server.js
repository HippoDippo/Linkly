require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const massive = require('massive');

const app = express();
const PORT = 3005;
const CONNECTION_STRING = process.env.CONNECTION_STRING;

app.use(bodyParser.json());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../build'));

massive(CONNECTION_STRING)
.then(db => {
  app.set('db', db);
});

passport.use(new Auth0Strategy({
  domain: process.env.AUTH_DOMAIN,
  clientID: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  callbackURL: process.env.AUTH_CALLBACK,
  scope: 'openid profile'
}, function(accessToken, refreshToken, extraParams, profile, done) {
  const db = app.get('db');

  console.log(profile);
  db.find_user([ profile.user_id ])
  .then(user => {
    if (user[0]) {
      return done(null, { id: user[0].id });
    } else {
      db.create_user([ profile.displayName, profile.picture, profile.user_id ])
      .then(user => {
        return done(null, { id: user[0].id });
      });
    }
  })
}));

app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback', passport.authenticate('auth0', {
  successRedirect: 'http://localhost:3000/#/profile',
  failureRedirect: 'http://localhost:3005/auth'
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  app.get('db').find_session_user([user.id])
  .then(user => {
    return done(null, user[0]);
  });
});

app.get('/auth/me', (req, res, next) => {
  if (!req.user) {
    return res.status(401).send('Log In required');
  } else {
    return res.status(200).send(req.user);
  }
});

app.get('/auth/logout', (req, res) => {
  req.logOut();
  return res.redirect('http://localhost:3000/#/');
});

// app.get('/api/user', (res, res) => {
//   const db = req.app.get('db');

//   db.getUser();
// });

app.get('/api/posts', (req, res) => {
  const db = req.app.get('db');

  db.getAllPosts()
    .then(posts => {
      res.status(200).send(posts);
    });
});

app.get('/api/savedposts', (req, res) => {
  const db = req.app.get('db');

  db.getAllSavedPosts()
  .then(savedposts => {
    res.status(200).send(savedposts);
  });
});

app.post('/api/posts', (req, res) => {
  const db = req.app.get('db');

  db.create_post(req.body.userID, req.body.titleText, req.body.introText, req.body.bodyText);
});

app.post('/api/savedposts', (req, res) => {
  const db = req.app.get('db');

  db.create_savedpost(req.body.userID, req.body.titleText, req.body.introText, req.body.bodyText);
});

app.delete('/api/savedposts', (req, res) => {
  const db = req.app.get('db');

  db.deletePost(req.body.postID)
  .then(res => {
    res.status(200).send(res);
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});