import express from "express"
import dotenv from "dotenv"
import path from "path"
import cookieParser from "cookie-parser";
import { urlencoded } from "body-parser";

dotenv.config();

const app = express()
const __dirname=path.resolve();

const PORT= process.env.PORT||3000;

app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended:true}))

app.get("/api",(req,res)=>{
  res.send("Hi");
})


if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")))
  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
  })
}


app.listen(PORT,()=>{
  console.log("Server running on port: "+PORT)
})