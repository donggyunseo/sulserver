var express = require('express');
const pool = require('../utils/mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/reviewList', async (req, res, next) => {
  try {
    const connection = await pool.getConnection()
    const [ reviews ] = await connection.query('SELECT * FROM REVIEWS')
    console.log('1234')
    res.json({ status: 200, arr: reviews })
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })
  }
})

module.exports = router;
