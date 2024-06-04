const express = require('express');
const app = express();

app.use('/', (req,res)=>{

    return res.json({msg: "Hello from my own server"});
});

app.listen(8000,()=> console.log("server started at 8000"));