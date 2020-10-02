var express = require('express');
var router = express.Router();

const pool = require('../utils/mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/reviewList', async (req, res, next) => {
  try {
    const connection = await pool.getConnection()
    const [ reviews ] = await connection.query('SELECT * FROM REVIEWS')
    req.header("Access-Control-Allow-Origin", "*")
    res.json({ status: 200, arr: reviews })

    connection.release()
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })
    connection.release()
  }
})

router.get('/sulList', async (req, res, next) => {
  try {
    const connection = await pool.getConnection()
    const [ alcohols ] = await connection.query('SELECT * FROM ALCOHOLS')
    res.json({ status: 200, arr: alcohols })

    connection.release()
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })
    connection.release()
  }
})

module.exports = router;
