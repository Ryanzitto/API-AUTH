require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jxt = require('jsonwebtoken')

const app = express()

app.use(express.json())

app.get("/", (req,res) => {
    res.status(200).json({msg: "FUNCIONANDO!"})
})


//Registrar usuario
app.post('/auth/register', async (req, res) => {

  const {name, email, password}= req.body

  if(!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" })
  }






})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster1.0m1yepu.mongodb.net/?retryWrites=true&w=majority`)
.then(() => {
  app.listen(3000)
  console.log('conectou ao banco')
}).catch((err) => console.log(err))

