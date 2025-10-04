const express = require('express');
const router = express.Router();

//controller imports
const controller = require('../../controllers/imagekit.controller')


//routes
router.get('/getUploadKeys',controller.getUploadKeys)

router.post('/getFileUrl' , controller.getFileURL)
//for public
router.post('/uploadImage', controller.uploadImage)


module.exports = router