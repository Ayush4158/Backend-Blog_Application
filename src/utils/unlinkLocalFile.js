import fs from 'fs'

const unlinkLocalFile = (localFilePath) => {
  try {
    if(!localFilePath) return null 
    fs.unlink(localFilePath , (err) => {
      if(err){
        console.log("Error wile removing file from the local folder: ", err)
      }

      console.log("file is deleted")
    })
  } catch (error) {
    
  }
}