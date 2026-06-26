/*

we can use "multer" or "express-fileupload" to get files from user

hum user se file upload karvaenge , "multer ke through hi file upload hoti hai " , cloudinary and aws SDK are just services 
hum multer ka use karte hue , us file ko user se lenge aur apne local server pe temporary us file ko rakh denge 
uske baad next step me hum cloudinary ka use karte hue , local storage se vo file lenge 
aur usko hum server pe daal denge 

---> hum directly bhi multer se file leke use cloudinary pe upload kara sakte hai 
----> lekin professionaly hum aisa hi karte hai 
----> production grade me hum aisa hi karte hai , taki , agar koi aisa case hota hai ,toh hum us file ko 
reattempt ya phir re upload kar pae 

Multer is a middleware for node.js and expree.js that is used to handle file uploads sent through multipart/
form-data forms 

when a user uploads files (images , PDFs , videos , etc) , the data is sent as multipart / form-data.
Express's built in middleware (expree.json() and express.urlencoded() )can not  process this type of data 

Multer helps by :
--> parsing multipart/form-data 
--> Accesssing uploaded files through req.file or req.files
---> saving files to disk or memory 
---> validating file types and sizes 




*/

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"  // file system , no need to install , by default with node js 
// fs bahut sari functionalities deta hai file handling ke , read write aur bahut sari , iske documentation me jake padho

/**
 unlink means delete a file from the filesystem 

 suppose a user uploads a profile picture , and then after that he uploads a new picture and then after saving the new image , you may want to delete the old one , otherwise server will keep storing unused files and waste disk space 

 this is all the concept of Operating System 
 */

 // Now configuring cloudinary 

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    // cloudinary pe jake setup le lo , api key wagyera 

const uploadOnCloudinary = async (localFilePath)=>{ // vhi local path jha , multer ne file leke save ki hai 
    try{
        if(!localFilePath) return null;

        // upload the file to cloudinary

      const response = await cloudinary.uploader.upload(localFilePath,{
            // upload options , there are many options like "public_key" or many that we can give , read on the website of cloudinary 
            resource_type:"auto"
        })
        // file has been uploaded succesfully
        // console.log("file is uploaded on cloudinary ",response) // there are many functionalities in response obj 
        console.log("file is uploaded on cloudinary ",response.url)
        
        await fs.unlink(localFilePath) // after uploading it to cloudinary , i had to delete it to free our storage 

        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) // removes the locally saved temporary file as the upload operation got failed , so remove that file as , it has some error , thats why , it is  not being uploaded 

        return null;
    }
}

/*
unlink -> delete file 
unlink with sync --> wait until deletion finishes before moving to the next line 

fs.unlinkSync() --> delete file and wait 

fs.unlink()   --> delete file asynchronously using a calback 

fs.promise.unlink()  --> delete file asynchronously using await  
 */

export {uploadOnCloudinary};