let express = require('express');
let app = express();
const helper = require("./helper")
/**
 * public - имя папки где хранится статика
 */
app.use(express.static('public'));
/**
 *  задаем шаблонизатор
 */
app.set('view engine', 'pug');
/**
* Подключаем mysql модуль
*/
let mysql = require('mysql');
// post zaprosi body-n karuma karda u veradardzni vorpes JSON (req.body.---someThing---)
app.use(express.json())
/**
* настраиваем модуль
*/
let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mysql'
});

const converter = helper.converter

app.listen(3000, function () {
  console.log('node express work on 3000');
});

app.get('/', function (req, res) {
  let cat = new Promise(function (resolve, reject) {
    con.query(
      `select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category :=
      category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3`,
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  let catDescription = new Promise(function (resolve, reject) {
    con.query(
      "SELECT * FROM category",
      function (error, result, field) {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
  Promise.all([cat, catDescription]).then(function (value) {
    res.render('index', {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat: JSON.parse(JSON.stringify(value[1])),
    });
  });
});


app.get('/cat', function (req, res) {
  const catId = req.query.id
  const cat = new Promise((resolve, reject) => {
    con.query(
      'SELECT * FROM category WHERE id=' + catId,
      function (error, result) {
        if (error) reject(error)
        resolve(result)
      }
    )
  })

  const goods = new Promise((resolve, reject) => {
    con.query(
      'SELECT * FROM goods WHERE category=' + catId,
      function (error, result) {
        if (error) reject(error)
        resolve(result)
      }
    )
  })

  Promise.all([cat, goods]).then(value => {
    res.render('cat', {
      cat: converter(value[0]),
      goods: converter(value[1])
    });
  })

})

app.get('/goods', function (req, res) {
  const catId = req.query.id
  con.query(
    'SELECT * FROM goods WHERE id=' + catId,
    function (error, result) {
      if (error) throw error
      res.render("goods", { goods: converter(result[0]) })
    }
  )
})

app.get('/order', function (req, res) {
  res.render('order');
});

app.post('/get-category-list', function (req, res) {
  con.query(
    'SELECT id,category FROM category',
    function (error, result) {
      if (error) throw error
      res.json(result)
    }
  )
})

app.post('/get-goods-info', function (req, res) {
  const key = req.body.key.join(',')
  if (!req.body.key.length) return res.send('0')
  con.query(
    `SELECT id,name,cost FROM goods WHERE id IN(${key})`,
    function (error, result) {
      if (error) throw error
      let goods = {}
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i]
      }
      res.json(goods)
    }
  )
})

app.post('/finish-order', function (req, res) {
  if (req.body.key.length != 0) {
    let key = Object.keys(req.body.key);
    con.query(
      'SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',') + ')',
      function (error, result, fields) {
        if (error) throw error;
        sendMail(req.body, result).catch(console.error);
        res.send('1');
      });
  }
  else {
    res.send('0');
  }
});

function sendMail(data, result) {

}