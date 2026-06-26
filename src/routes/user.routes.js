// agar humne method bana liya hai lekin method run kab ho , jab koi url hit ho tab run ho 
// toh us url ke liye hum routes likhte hai 
// now we make routes and export 

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser) // is route me "registerUser" method chalega 
// router.route("/login").post(login)// for eg , here login method runs 


/*
Now , we are going to use Postman or Thunder Client to test APIs , because these helps to test API 
without needing a frontend (website or mobile app )

paste that "http link" there and select the type of reques like which typw , get , post , patch aor anything and click on send and then you will get all thing 

and you will get the reponse you want and also with all information like status code , message etc 

Industry me sabse jyada use hota hai POSTMAN , aur yhi sabse jyada industry me use hota hai 
and thunder client bhi same hi hota hai , infact thunderclient toh vs code me hi pkugin hota hai 
and postman bhi vs code me extension me ho jata hai 

hum log mostly Postman use karenge 

this tool has many information like error type , time taken by the server and many more , we study later
 */





export default router 