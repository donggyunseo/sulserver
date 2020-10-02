const express = require('express');
const router = express.Router();

const pool = require('../utils/mysql')
const { response } = require('express')

const crypto = require('crypto') // CRYPTO module
const jwt = require('jsonwebtoken')

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const connection = await pool.getConnection()
    const [ result ] = await connection.query('SELECT * FROM USERS')
    res.json({ status: 200, arr:  result })

    connection.release()
  } catch (err) {
    res.json({ status: 500, msg: 'Error' })
    console.log(err)

    connection.release()
  }
});

router.post('/', async (req, res, next) => {
  try {
    const email = req.body.email
    const pwd = req.body.pwd
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const image = req.body.image

    const salt = crypto.randomBytes(64) // 임의의 문자 생성
    const saltString = salt.toString('base64') // 문자화 시킴
    const hashedPwd = crypto.pbkdf2Sync(pwd, saltString, 100000, 64, 'SHA512')
    const hashedPwdString = hashedPwd.toString('base64')

    const connection = await pool.getConnection()
    await connection.query('INSERT INTO USERS(EMAILS, PWD_salts, PWD_hashed, FIRST_NAMES, LAST_NAMES, IMAGES) VALUES(?, ?, ?, ?, ?, ?)', [email, saltString, hashedPwdString, firstName, lastName, image])
    res.json({ status: 201, msg: 'success' })

    connection.release()
  } catch (err) {
    res.json({ status: 500, msg: 'Error' })
    console.log(err)

    connection.release()
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email
    const pwd = req.body.pwd

    const connection = await pool.getConnection()
    const [users] = await connection.query('SELECT * FROM USERS WHERE EMAILS = ?', [email])
    if (users.length === 0) {
      return res.json({ status: 401, msg: 'No EMAIL!' })
    }
    const user = users[0]
    const loginHashedPwd = crypto.pbkdf2Sync(pwd, user.PWD_salts, 100000, 64, 'SHA512')
    if (loginHashedPwd.toString('base64') !== user.PWD_hashed) {
      return res.json({ status: 401, msg: 'No PASSWORD!' })
    }

    const payload = { id: user.idUSERS }
    const token = jwt.sign(payload, process.env.JWT_SECRET)

    res.json({ status: 200, token: token })

    connection.release()
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })
    connection.release()
  }
})

router.get('/:id/email', async (req, res, next) => {
  try {
    const token = req.headers['x-access-token']
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      const userId = req.params.id
      if (payload.idUSERS !== userId) {
        return res.json({ status: 403, msg: 'Deny access!!', payload: payload })
      }
      const connection = await pool.getConnection()
      const [result] = await connection.query('SELECT * FROM USERS WHERE idUSERS = ?', [userId])
      res.json({ status: 200, arr: result })
      connection.release()
    } catch (err) {
      res.json({ status: 401, msg: 'Deny access' })
      connection.release()
    }
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })
    connection.release()
  }
})

router.post('/:iduser/write', async (req, res, next) => {
  try {
    const iduser = req.params.iduser
    const idalcohol = req.body.alcohol
    const rating = req.body.rating
    const comment = req.body.comment

    const connection = await pool.getConnection()
    const [ review ] = await connection.query('INPUT INTO REVIEWS(idUSERS, idALCOHOLS, RATINGS, COMMENTS) VALUES(?, ?, ?, ?)', [iduser,idalcohol,rating,comment])

    connection.release()
  } catch (err) {
    console.log(err)
    res.json({ status: 500, msg: 'error' })

    connection.release()
  }
})

module.exports = router;
