const express = require('express');
const controller = require('./controller');
const { fileUpload } = require('./middleware/fileUpload');
const { multipleFiles } = require('./middleware/multipleFilesUpload');
const {
  filesHandlerWithValidationForKeyAndLimit
} = require('./middleware/multipleFilesValidateLimit');

const router = express.Router();

router.post('/bus', controller.busboyWithoutMiddleware);
router.post('/file', fileUpload, controller.file);
router.post('/files', multipleFiles, controller.files);
// NOTE: This is the same as filesUpload but with validation
// Must have key and otherKey in the request body form data
// and limit to 2 files
router.post(
  '/only-two',
  filesHandlerWithValidationForKeyAndLimit(2, ['key', 'otherKey']),
  controller.filesWithValidation
);

module.exports = router;
