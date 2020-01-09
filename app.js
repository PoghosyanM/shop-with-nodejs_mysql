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
/**
* настраиваем модуль
*/

let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'market'
});

const converter = helper.converter
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

app.listen(3000, function () {
  console.log('node express work on 3000');
});

app.get('/', function (req, res) {
  con.query(
    'SELECT * FROM goods',
    function (error, result) {
      if (error) throw error;
      const goods = {}
      for (let i = 0; i < result.length; i++) {
        goods[result[i]["id"]] = result[i]
      }
      res.render('main', {
        foo: 'hello',
        bar: 7,
        goods: converter(goods)
      });
    }
  );
});


app.get('/cat', function (req, res) {
  // res.render('cat', { foo: 5 });
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

app.post('/get-category-list', function (req, res) {
  console.log('11111', 11111)
  con.query(
    'SELECT id,category FROM category',
    function (error, result) {
      if (error) throw error
      console.log('result', result)
      res.json(result)
    }
  )
})