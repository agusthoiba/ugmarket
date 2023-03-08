
const http = require('http')
const express = require('express')
const config = require('./config')

const underscore = require('underscore')
const app = express()
const ejs = require('ejs')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const cloudinary = require('cloudinary').v2;

const CategoryModel = require('./models/category');

global.config = config
global.express = express
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
app.locals.config = config;

cloudinary.config({
  secure: true
});

app.locals.cloudinary = cloudinary;

/* locals.meta = {
    title: 'Situs Jual Beli Online Khusus Merchanise Mudah Dan Terpercaya | Pasar Underground',
    description: 'Tempat jual beli online terpercaya di Indonesia, belanja murah, di Pasar Underground'
} */


app.use(morgan('combined'));
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
  /* if (err.type == 'redirect') {
    res.redirect('/error')
  } */

  const errResp = {
    code: err.code,
    message: 'An error occured'
  }
  return res.status(err.statusCode).json(errResp)
  return next()
})

// Using the .html extension instead of having to name the views as *.ejs
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)

app.use(async function (req, res, next) {
  res.locals.session = req.session
  res.locals.uri = {
    query: req.query
  }

  return next()
})

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))

app.use(function (req, res, next) {
  var path = req.path.split('/')

  if (path[1] === 'account' &&
    req.session.login_type === undefined &&
    req.session.user === undefined) {
    return res.redirect('/')
  }

  return next()
});

const { connectDb, modelMid } = require('./middleware')

/**
 * dbInitialization
 * @param {Object} app - app
 */
const connect = require('./connect')
const { SIZES } = require('./constant')
const connMysql = async() => {
  app.locals.db = await connect()
  const catModel = new CategoryModel({
    db: app.locals.db
  });

  const findCats = await catModel.find();

  app.locals.categoryList = findCats;

  const categoriesNested = findCats.filter(cat => {
    return cat.cat_parent_id === 0
  });

  for (let i = 0; i < categoriesNested.length; i++) {
    const catChilds = findCats.filter(cat => {
      return cat.cat_parent_id === categoriesNested[i].cat_id
    })

    categoriesNested[i] = Object.assign(categoriesNested[i], {
      childs: catChilds
    })
  }

  app.locals.categories = categoriesNested;

  app.locals.sizes = SIZES;
}

connMysql()
app.use(modelMid)

app.use('/', require('./controllers/front/index'))
app.use('/about', require('./controllers/front/about'))
app.use('/contact', require('./controllers/front/contact'))
app.use('/products', require('./controllers/front/product'))
app.use('/bands', require('./controllers/front/band'))
app.use('/auth', require('./controllers/front/auth'))
app.use('/account/product', require('./controllers/front/account/product'))
app.use('/account/profile', require('./controllers/front/account/profile'))

app.use('/admin/band', require('./controllers/admin/band'))

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

const port = config.port || 4000;

server.listen(port, () => {
  var host = config.host

  console.log('Ugmarket listening http://%s:%s', host, port)
});

const closeConnDb = async () => {
  await app.locals.db.close()
}
/**
 * stopServer
 * @param {object} signal - signal object
 * @returns {function} - stop signal
 */
const stopServer = () => {
  closeConnDb
  return server.close();
};

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

