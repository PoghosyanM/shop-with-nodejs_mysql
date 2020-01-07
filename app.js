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
  database: 'testdb'
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
    'SELECT * FROM one',
    function (error, result) {
      if (error) throw error;
      console.log(result);
      res.render('main', {
        foo: 'hello',
        bar: 7,
      });
    }
  );
});
