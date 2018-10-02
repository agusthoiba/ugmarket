
const http = require('http')
const express = require('express')
const config = require('./config')

const underscore = require('underscore')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

global.config = config
global.express = express
global.express_validator = expressValidator
global._ = underscore

global.slug = require('slug')

app.locals.strToArr = function (str, delimeter) {
  if (str.length === 0) return []
  if (!str.includes(delimeter)) return [str]
  return str.split(delimeter)
}

const numeral = require('numeral');
numeral.register('locale', 'id', {
  delimiters: {
    thousands: '.',
    decimal: ','
  },
  abbreviations: {
    thousand: 'k',
    million: 'j',
    billion: 'm',
    trillion: 't'
  },
  currency: {
    symbol: 'Rp. '
  }
})
numeral.locale('id')

app.locals.currency = numeral


/* locals.meta = {
    title: 'Situs Jual Beli Online Khusus Merchanise Mudah Dan Terpercaya | Pasar Underground',
    description: 'Tempat jual beli online terpercaya di Indonesia, belanja murah, di Pasar Underground'
} */

app.use(express.static('public'));

var cookieSession = require('cookie-session')

app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['secretkeysblabla'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(function (err, req, res, next) {
  if (!err) { return next() }

  console.error(err)
  return next()
})

// Using the .html extension instead of having to name the views as *.ejs
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)

app.use(function (req, res, next) {
  res.locals.session = req.session
  return next()
})

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))

app.use(expressValidator())

app.use(function (req, res, next) {
  var path = req.path.split('/')

  if (path[1] === 'account' &&
    req.session.login_type === undefined &&
    req.session.user === undefined) {
    return res.redirect('/')
  }

  return next()
});

app.use('/', require('./controllers/front/index'))
app.use('/p', require('./controllers/front/product'))
app.use('/auth', require('./controllers/front/auth'))
app.use('/account/product', require('./controllers/front/account/product'))
app.use('/account/profile', require('./controllers/front/account/profile'))

/* app.use(function(req, res, next){
  if (req.accepts('html')) {
    res.render('template/default/error')
    return;
  }

  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  // default to plain-text. send()
  res.type('txt').send('Not found');
}) */

const server = http.createServer(app)

server.listen(config.port, () => {
  var host = config.host
  var port = server.address().port

  console.log('Ugmarket listening http://%s:%s', host, port)
})
