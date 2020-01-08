let express = require('express');
let app = express();
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
      console.log(result);
      const goods = {}
      for (let i = 0; i < result.length; i++) {
        goods[result[i]["id"]] = result[i]
      }
      console.log(goods)
      res.render('main', {
        foo: 'hello',
        bar: 7,
        goods: JSON.parse(JSON.stringify(goods))
      });
    }
  );
});


app.get('/cat', function (req, res) {
  console.log(req.query.id)
  res.render('cat', {});
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
    console.log(value)
  })

})