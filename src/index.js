

import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";

import connectDB from "./db/index.js";
dotenv.config({
    path:'./env'
})


connectDB() 
.then(()=>{
    app.on("error",(error)=>{
         console.log("ERROR ", error);
            throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is runnning at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB Connection failed !!!", err)
})


