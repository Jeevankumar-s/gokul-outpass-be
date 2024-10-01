// server.js
const express = require('express');
const app = express();
const { sequelize } = require('./models');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));

app.use(express.json());
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/outpass', require('./routes/outpassRoutes'));

app.get('/helloworld',(req,res)=>{
    res.send("Hello World")
})


sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, () => console.log('Server is running on port 3000'));
});
