// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

import connectDB from "./db/index.js";
dotenv.config({
    path:'./env'
})

// or import 'dotenv/config'



connectDB()  // exported from another file 
//or 
/*

second approach ---> all thing in inex file 

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

        app.listen(process.env.PORT,()={
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error('Error',error)
        throw error;
        
    }
})()

*/