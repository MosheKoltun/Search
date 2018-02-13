var fs = require('fs');
var path = require('path');

//Invoke 'search' function
search();

/* ---------------------- function search -------------------
This function:
1) verifies command prompt user input 
2) calls recursive search function 
3) prints list of files that contain the specific text
 ------------------------------------------------------------*/

function search() {
    //variables area
    var args = process.argv;    // arguments from command prompt
    var ext = args[2];          // file extension 
    var text = args[3];         // text to search inside file
    var currDir = process.cwd(); // currnet work directory in shell 
    var fileList = [];           // list of files that contain the text (files have absolute path)

    //verify that input is correct
    //should be only two arguments in command prompt 
    if (args.length !== 4) {
        //print message with directions about command usage 
        console.log('USAGE: node search [EXT] [TEXT]');
        //return from function because input is incorrect 
        return;
    }
    
    //invoke 'searchRecursive' function
    //result is saved in array 'fileList' 
    fileList = searchRecursive(currDir, ext, text, fileList);
    
    //print message if files list is empty 
    if (fileList.length === 0) {
        console.log('No file was found');
    } 
    //if list is not empty then print list 
    else {
        //sort list before printing
        fileList.sort();
        //print list 
        fileList.forEach(function(fileOrDir) {
            console.log(fileOrDir);
        });         
    }
}

/* -------------- function searchRecursive --------------------
This function does recursive search in file system 
It looks for:
1) files with a specific extension
2) files that contain a specific text
It returns a list of files that were found 
The files contain absolute paths
 ------------------------------------------------------------*/

function searchRecursive(dir, ext, text, fileList) {   
    // variables area
    var statObj;
    var content;
    
    // check if directory (variable 'dir') is not a junction point - issue of windows 7 
    // 'readdirSync' will fail if the directory is merely a junction point
    // read more here:
    // https://www.svrops.com/svrops/articles/jpoints.htm
    try {
        //get list of files and directories from file system
        filesAndDirsList = fs.readdirSync(dir);
    } 
    catch (err) {
        if (err.code === 'EPERM') {
            return fileList;
        }
    }
    
    //loop to check for each element in list if it is directory or file  
    filesAndDirsList.forEach(function(fileOrDir) {
        fileOrDir = path.join(dir, fileOrDir);
        
        //handle cases if resource is busy or locked
        try { 
            statObj = fs.statSync(fileOrDir); 
        }
        catch (err) {
            return fileList;
        }  

        //if the element in list is a directory 
        //then do recursive search inside the directory

        if (statObj.isDirectory())
        {
            //call function in recursive mode
            //traverse entire files system 
            //starting from current work dir
            fileList = searchRecursive(fileOrDir, ext, text, fileList);
        }
        // else if element in list is a file
        // and file extension equals user input 
        // then search for text inside file 
        else if (statObj.isFile() && path.extname(fileOrDir) === ('.' + ext))
        {
            //read file and save file content in variable
            //no need to close file afterwards because 'readFileSync' handles it 
            content = fs.readFileSync(fileOrDir);
            //if the file content contains the text 
            //'indexOf' return -1 if text does not appear in string
            //otherwise it returns the position of the first occurrence in the string 
            if (content.indexOf(text)>-1) 
            {
                //return file name with absolute path
                absolute = path.resolve(fileOrDir);
                //push file with absolute path to list of files that contains the text
                fileList.push(absolute);
            }
        }
    });
    // return list of files that contains the text 
    return fileList;
}
