const express=require('express');
const cors = require('cors');
const User = require('./models/User.js');
const jwt = require('jsonwebtoken');
const connectDB = require('./models/Connectdb')
const bcrypt = require('bcryptjs');

require('dotenv').config()
const app =express();
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: 'http://127.0.0.1:5173',
}));

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

app.get('/test',(req,res)=>{
    res.json('test ok');
});


app.post('/register', async (req,res) => {
  
  const {name,email,password} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }

});

app.post('/login', async (req,res) => {

  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

const port = process.env.PORT || 4000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`server is listening port ${port}... `));
    } catch (error) {
        console.log(error);
    }
};
start();