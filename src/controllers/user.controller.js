//  main logic wala part hota hai controller , how to write controller ,
// jitna jyada controller likhenge , badi problems ko chote chote me todenge , utna hi logic building acha hoga 

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import validator from 'validator';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// method for registering user 
// as we know that whenever we make an app from express we get four parameter out of 
// which two are (req , res)

// const registerUser = asyncHandler(async (req , res)=>{  // takes an function
//     res.status(500).json({
//         message:"Chai aur Code "
//     })
// })


// Now we are going to write controller to register user 

const registerUser=asyncHandler(async (req,res)=>{
    // steps
    // get user details from frontend (humare liye frontend ka kaam POSTMAN kar dega )
    // Validation (username shi hai ki nhi , email shi format me hai ya nhi , to check not empty)
    // check if user already exists :(username already exists or email already exists )
    // check for images , check for avatar 
    // upload them to cloudinary , avatar 
    // create user object -- create entry in db (mongo db me bhejne ke liye hum object banaenge )
    // remove password and refresh token field from response (because we dont want to give frontend these fields )
    // ckeck for user creation (user create hua hai ya nhi ya null aaya hai )
    // return response , if user created else return error  



    // jitni bhi details body ya frontend se aaati hai , vo "req.body" me mil jaati hai 
    // jo data form se ya phir direct json se data aa rha hai vo req.body me jaega 
    // baki url ka data bhi hum dekhenge 

    // Postman me jake hum log params bhi de sakte ha ya phir body me jake data de sakte hai like form data 
    // text etc , hum log form data bhi bhej sakte hai , urlencoded bhi 
    // abhi ke liye hum raw data bhejenge , raw pe jake , seedhe json data de sakte hai .
    // raw mw jake , text me jake JSON select kar lo 

    const {fullName , email , username ,password} = req.body; // using destructuring 
    console.log("email : " ,email)

    // ----------------------------> validation 


    // if(fullName === "") {
    //     throw new ApiError(400 , "Fullname is required")
    // }
    // or 
    // in this way we had to write if , else for each fiels , we can use map or something else for that 

    // const arr=[fullName,email,username, password]
    // const newarr=arr.filter((item)=> item.trim()==="")
    // if(newarr.length>0) throw new ApiError(400 , "All fiels are required ")

    // or we can also use some() ,since we only need to know whether at least one field is empty, some()

    if(
        [fullName,email,username,password].some((field)=>field?.trim()=== "")
    ){
        throw new ApiError(400,"All Fields required ")
    }

    
    // if ( (!email.includes("@")) || (!email.includes("gmail.com")) ){
    //     throw new ApiError(400,"Please enter valid email")
    // } // this only works for email and also in only some case 

    // to validate email , either we use regex or validator libraries 

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //    if (!emailRegex.test(email)) {
    //        throw new ApiError(400, "Invalid email");
    // }

   // A Regex (Regular Expression) is just a pattern used to check whether a string follows a certain format.
   // Reges has many other properties , you can see in docs 

   /**
    * Most important use library validator.js , to validate , email , password  IMEI number and many more 
    * there are many functinalities it provide , go to npm docs 
    * npm i validator and use 
    * 
    */

   if(!validator.isEmail(email)){  // we can also give options in isEmail , setting props , check in docs 
    throw new ApiError(400 , "Enter valid email")
   }

   if(!validator.isStrongPassword(password)){
    throw new ApiError(400 , "Please enter a strong password.\nMinimum length: 8\nAt least one lowercase letter\nAt least one uppercase letter\nAt least one number\nAt least one symbol" )
   }

   // ---------------------- check whether user exist or not 


   // we take "User" from user model , as it is directly interacting with database 

   const existedUser =await User.findOne({  // findone is an async function and return a promise 
    $or : [{username} ,{email}] // ya toh ye username ho , ya toh ye email ho 
   })  

   if(existedUser){
    throw new ApiError(409 , " User with email or username already exists ")
   }  // we can also check username and email explicitly seperately 


   // sabse pahla user with given details jo find hoga , wo document return karega , we can also find using "find" method , many optiona like updateOne etc are available 

   /**
    
   In MongoDB, $ operators are special keywords used in queries and updates.

   $or  --> Used when any one condition can be true.

   const user = await User.findOne({
    $or: [
        { email: email },
        { username: username }
    ]
    });


    Operator	Purpose
$or ->	At least one condition must be true
$and ->	All conditions must be true , by default if all conditions are given then they are treated as and , so no need to "$and" operator 
$set ->	Update specific fields
$gt ->	Greater than (>)
$lt ->	Less than (<)
$gte ->	Greater than or equal (>=)
$lte ->	Less than or equal (<=)
$in ->	Value is in a list
$ne	-> Not equal
$ -> Positional operator (matched array element) or prefix for MongoDB operators

eg :
User.find({
    age: { $gt: 18 }
});

Age > 18.


   findOne()	                             find()
Returns one document	           Returns all matching documents
Return type: Object (or null)	   Return type: Array

    */

// -------------->  check for images , check for avatar 


// we can take images using req.files , because multer has already added these files and also  provides various methods
// read props  by consoling , req.body and req.files 
// avatar[0] because there are many files inside any fields 

const avatarLocalPath=req.files?.avatar[0]?.path

const coverImageLocalPath=req.files?.coverImage[0]?.path

if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar file is required ")
}

// --------------- upload them to cloudinary 

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

//--------------- check whether avatar is uploaded or not on cloudinary 

if(!avatar){
     throw new ApiError(400 , "Avatar file is required ")
}

// ---------------now create an object and entry in database

const user= await User.create({
    fullName,
    avatar : avatar.url ,// beacuse cloudinary is returning whole response object 
    coverImage: coverImage?.url || "" , // agar coverImage hai toh url nikal ke de do , varna empty string de do 
    email,
    password,
    username : username.toLowerCase()

})

// User.create() is used to create a new document and save it to the MongoDB database in one step.

// if i want to check user is created or not , or empty is returned 
// find that if the user i had created , its id exists in data base or not 
// mongo db already creates an id(_id field ) for every entry in database 
// we can check if user is created or not by finding it by _id , if find then it return 
// that document of user 

// hum chahte toh humne jo uper user create karte waqt document banaya hai usme bhi 
// remove kar sakte the , password or refresh token by using ".select()" 

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
) // refresh token and password are removed from document 

if(!createdUser){ // if user not created , then null is returned 
    throw new ApiError(500 , "Something went wrong while registering the user ")
}


/**
 * .select() is used to choose which fields you want to return from the database.

Think of it like this:

"Give me only these fields."

or

"Don't give me these fields."

const user = await User.findById(id).select("username email");

Only these fields are returned.

---->  Exclude fields

Prefix the field with "-".

const user = await User.findById(id)
    .select("-password -refreshToken");

    ---> password and refreshToken are excluded from the document you are getting returned from the database after finding 
 */

    //  -----------------> now return response 
    //  but hum response aise nhi send karenge , api me response send  karenge 
    // we are going to use utility of Apiresponse that we had created 
    // we can also send directly "createdUser" , inside json reponse 
    // but we had made Api response so we used it  

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered Successfully ")
    )



})

export {registerUser}