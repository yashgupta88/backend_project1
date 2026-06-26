import multer from "multer";

/*
Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.

NOTE: Multer will not process any form which is not multipart (multipart/form-data).

Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.

Basic usage example:

Don't forget the enctype="multipart/form-data" in your HTML form.

read multer npm docs as well as multer github repository

read in this 
(https://github.com/expressjs/multer#readme)

if we store the file just using 
"dest" : "uploads/"
then it creates a random filename and stores the file in "uploads/"

const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads/' })

or Advanced way is to store it in diskStorage or memoryStorage


DiskStorage
The disk storage engine gives you full control on storing files to disk.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })
There are two options available, destination and filename. They are both functions that determine where the file should be stored.

destination is used to determine within which folder the uploaded files should be stored. This can also be given as a string (e.g. '/tmp/uploads'). If no destination is given, the operating system's default directory for temporary files is used.

Note: You are responsible for creating the directory when providing destination as a function. When passing a string, multer will make sure that the directory is created for you.

filename is used to determine what the file should be named inside the folder. If no filename is given, each file will be given a random name that doesn't include any file extension.

Note: Multer will not append any file extension for you, your function should return a filename complete with a file extension.

Each function gets passed both the request (req) and some information about the file (file) to aid with the decision.

Note that req.body might not have been fully populated yet. It depends on the order that the client transmits fields and files to the server.

For understanding the calling convention used in the callback (needing to pass null as the first param), refer to Node.js error handling

MemoryStorage
The memory storage engine stores the files in memory as Buffer objects. It doesn't have any options.

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
When using memory storage, the file info will contain a field called buffer that contains the entire file.

WARNING: Uploading very large files, or relatively small files in large numbers very quickly, can cause your application to run out of memory when memory storage is used.

dest and deisk storage will store gile in Disk
while memory storage will in RAM
also memory storage does not need folder ,no file path , no filename or disk 

---->  A buffer is simply a chunk of memory that stores raw binary data , think of it like a temporary 
         container in RAM for a file 

*/
// we are using disk storage 
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // cb -> call back //
    cb(null, "./public/temp")  // all files inside public folder inside temp , so that we can easily access
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, file.originalname) // there are various props in this file , we can access others also , try to console that "file" object , here we are using "originalname" prop which give name entered by user 
    // we can also use others
  }
})

export const upload = multer(
    { storage: storage }
)

// this upload mainly has
/**
 * upload.single() --> for single file 
 * upload.array() ---> for multiple files 
 * upload.fields()
 */

// Now we can use multer as middleware , whenever there is a request multer will take that file and store in that local disk storage 

// app.post('/profile', upload.single('avatar'), function (req, res, next) {
//     req.file is the `avatar` file
//    req.body will hold the text fields, if there were any
// })


/***
 * multer will already put that file in tha folder and give you req.file
 * we can also access req.file.path to give it to cloudinary 
 * 
 */