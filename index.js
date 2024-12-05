// server.js
const express = require('express');
const app = express();
const { sequelize } = require('./models');
const cors = require('cors');

app.use(cors({
  origin: 'https://9000-idx-gokul-outpass-1733323094795.cluster-bec2e4635ng44w7ed22sa22hes.cloudworkstations.dev', 
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
