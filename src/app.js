import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

// app.use(cors())  // to configure cors , and we can also change vaious setting 
// read docs of cors that how to change origin and how to allow only specfic origin to access frontend or backend etc.
// and "use" is used for middlewares and config settings 
// also
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true // and many more properties 
}))
// vaise toh hume specifically mention karna hoga ki url kha se aa rha hai apne env ke variable me 
// but agar hum uski jagah "star" likh de , toh iska mtlb , har jgh se request allow hai 

// data backend me bhut jgh se aata hai aur bhut sari forms me aata hai , like forms me , json etc
// kuch security checks bhi lagenge ki isse jyada data nhi lenge etc.


app.use(express.json({limit:"16kb"}))

//   Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.
// now we are taking data which is in the forrm of json and there are various options like "limit" etc

// pahle express asani se json file nhi le pata tha , hum logo ko body parser use karna padta tha 
// for accepting json files,ab ye parser ka kaam by default ho gya hai 

/*express.json() helps express understand the incoming json request , 
it is a middleware that parses incoming json data from the request body and stores it in req.body

without express.json() we cant print req.body 

in conclusion
--->  express.json() parses the text and converts it into a javascript object 

----> we also use multer for configuring file uploading 
*/

/*
agar url se data aa rha hai toh us data ka encoded hona jaruri hai , kyoki data aata hai 
toh kahi url pe '+' symbol space ke liye kaga dete hai , aur kahi '%20' symbol laga dete hai 
toh use encode karna padta hai ,toh -->

usually "urlencoded" parse data sent from HTML
"extended" props allows parsing of nested objects and arrays 
"limit" , it limits the maximum size of the request body

 */
app.use(express.urlencoded({extended:true,limit:"16kb"})) // we can also want , to not give these peops 
// this extended props is for , encoding when data is in multiple objects form , usually not , but in case

app.use(express.static("public")) // "public" is the name of folder in which all files are stored which made public accessible 
// static is used to store files and folders , and these made as public assets and can be accessed by anyone 

/*or we can say that it is used to make images , css and frontend javascript files accessible to the browser , in express static means files that are served directly to the browser without any processing
by your server code  */


/*cookie-parser  --> ka kaam itna hai ki ,mai apne server se user ke browser ki cookies access kar pau 
aur cookies set bhi karpau , bascally crud operations kar pau

cookie-parser is an express middleware used to read sookies sent by browser
without it we can not access the cookies through req.cookies 
res.cookie()--> Send/store a cookie in the browser 

req -> contains information coming from the client / browser 
res --> res is used to send data to the client
 */
app.use(cookieParser())  // isme bhi props hoti hai lekin itna use nhi hoti hai 



/*
Middleware

for eg --> user ne "/instagram" url hit kiya aur hume us url pe kuch reposne send karna hai like

(req,res){
res.send("hitesh")
}

--> but what if we use to check earlier that whether user is logged in , then we had to send response , in that case , we use middleware 

-----/instagram      -      -                      ---->  (err,req,res,next){
                       |     |                            res.send("hitesh")
                       |     |                              }
                       |     |
                       |     check if user is admin (middleware)
                       check if user is logged in (middleware)

                       so before going to response . it check all these middleware conditions in sequence , that are given 
                       // also the two extra paramters include err, next 
                       where "next" is a flag , 
                       jab ek middleware apna kaam kar lega toh wo ek next flag pass karega ,
                       ki ab next apna kaam kar lo , aise hi aage jata jaega , aur akhir me response ke baad ruk jaega 



*/

// ---------  routes import 

import userRouter from './routes/user.routes.js'

// route declaration 

//  pahle jab hum app.get karke call kar rhe the toh usi me hum routes likh rhe the aur method yani ki 
// controller bhi hum usi me likh rhe the , 
// lekin an humsab router aur controller ko alag alag rakha hai 
// toh ab hume router ko lane ke  liye middleware lana hoga 

app.use("/api/v1/users",userRouter) // jaise hi '/users' hit hoga vaise hi "userRouter" activate ho jaega 
// jaise hi "/users" hit hoga phir sara control userRouter ke paas chala jaega and then waha par se
// jo bhi route pe jae aur jo bhi method ya controller chalaye vo route pe depend karta hai 

/** Now URL becomes
  
  http://localhost:8000/api/v1/users/register

  aage chalke hum api banaenge , toh standard way me aise hi likhenge , /api then uska version 1,2,3,then route 
  yhi standard practice hai 
 
 
http://localhost:8000/users/register  --> yha pe jake registerUser method call ho jaega 


 * similarly
 * http://localhost:8000/users/login
 */

//   '/users' is just working like a prefix after it all goes to route 






export { app }
