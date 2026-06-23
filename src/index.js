// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";

import connectDB from "./db/index.js";
dotenv.config({
    path:'./env'
})

// or import 'dotenv/config'



//connectDB()  // exported from another file , that is in db 

//  Note -- here is no need to write import mongoose , dotenv, and DB name ,in this file  since it all being declared in that function 
// file so , function will take variable from his file 


//or 
/*

second approach ---> all thing in index file 

import express from "express"
const app=express()

// function connectDB(){}

// connectDB()

// for  immediate calling we can use IIFE
// use or apply semicolon after every IIFE


(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error)=>{  // listeners in app, and there is an event named "error" , and app is listening
            console.log("ERROR ", error);
            throw error
        })

        app.listen(process.env.PORT,()=>{  // to start server  
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error('Error',error)
        throw error;
        
    }
})()

*/

connectDB() // async await always return a promise 
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



// ---> do baate yaad rakho jab bhi datbase se connection karo 
// 1.---> always wrap in try/catch , because there can be problems while connecting to database
// 2----> assume database is in another continent , means it takes time to communicate to database 
// so use async await