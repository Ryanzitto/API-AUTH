require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

const User = require('./models/User')

app.get("/", (req,res) => {
    res.status(200).json({msg: "FUNCIONANDO!"})
})

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.status(401).json({ msg: "Acesso negado!" });
  
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
    } catch (err) {
      res.status(400).json({ msg: "O Token é inválido!" });
  }
}
    
//Registrar usuario
app.post('/auth/register', async (req, res) => {

  const {name, email, password, confirmPassword} = req.body

  if(!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" })
  }

  if(!email) {
    return res.status(422).json({ msg: "O email é obrigatório" })
  }

  if(!password) {
    return res.status(422).json({ msg: "A senha é obrigatórias" })
  }

  if(password !== confirmPassword) {
    return res.status(422).json({ msg: "As senhas não coincidem!" })
  }

  //checando se usuario ja existe
  const userExist = await User.findOne({email: email})

  if(userExist){
    return res.status(422).json({ msg: "Email já está em uso, tente outro email." })
  }

  //create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //create User
  const user = new User({
    name,
    email,
    password: passwordHash,
  })

  try {
    await user.save() 
    res.status(201).json({msg: "Usuario criado com sucesso!"})
  } catch (error) {
    res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde."})
    console.log(error)
  }
})

//Loga usuario
app.post('/auth/login', async (req, res) => {

  const {email,password} = req.body

  if(!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" })
  }

  if(!email) {
    return res.status(422).json({ msg: "O email é obrigatório" })
  }

  //checa se usuario existe
  const user = await User.findOne({email: email})

  if(!user){
    return res.status(404).json({ msg: "Usuario não encontrado!." })
  }

  //checa se password está correto
  const checkPassword = await bcrypt.compare(password, user.password)

  if(!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" })
  }

  try {

    const secret = process.env.secret
    const token = jwt.sign({
        id: user._id,    
    },secret)

    res.status(200).json({msg: "Autenticação realizada com sucesso", token})

    
  } catch (error) {
    res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde."})
    console.log(error)
  }
})

//Rota Privada
app.get('/user/:id', checkToken, async (req,res) => {
    const id = req.params.id

    //checa de se usuario existe
    const user = await User.findById(id, '-password')

    if(!user){
      return res.status(404).json({msg: "Usuario não encontrado"})
    }

    res.status(200).json({ user })
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster1.0m1yepu.mongodb.net/?retryWrites=true&w=majority`)
.then(() => {
  app.listen(3000)
  console.log('conectou ao banco')
}).catch((err) => console.log(err))

