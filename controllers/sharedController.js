const imgbbUploader = require("imgbb-uploader");

exports.uploadImage = async(file) => {
  try{
   const response = await imgbbUploader(process.env.IMGBB_API_KEY,file.path);
   console.log(response.url);
   return response.url;
  }catch(err){
    console.log(err);
    return false;
  }
}