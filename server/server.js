import express from 'express';
// import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import logger from 'morgan';
import session from 'express-session';
// import connectMongo from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import { User, hashPassword } from './models/models';

const app = express();
dotenv.config();
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
// mongoose.connection.on('connected', () => {
//   console.log('Success: connected to MongoDb!');
// });

app.use(express.static(path.resolve(__dirname, '../build')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// const MongoStore = connectMongo(session);
app.use(session({
  secret: process.env.SESSION_SECRET,
  // store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // proxy: true,
  resave: true,
  saveUninitialized: true,
  name: 'Brian Nguyen',
  // cookie: { maxAge: 2 * 60 * 60 * 1000 },
  // rolling: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy((username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { error: 'Username does not exist' });
    if (user.password !== hashPassword(password)) return done(null, false, { error: 'Password is incorrect' });
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// app.use('/auth', auth(passport));
// app.use('/user', userRoute);

app.get('/session', (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user.role });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.status(200).json({ success: true, message: 'Goodbye!' });
});

// DO NOT REMOVE THIS LINE :)
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500).json({ success: false, error: err.message });
});

console.log('Express started. Listening on port', process.env.PORT || 1337);
app.listen(process.env.PORT || 1337);
