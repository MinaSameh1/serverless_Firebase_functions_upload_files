const Busboy = require('busboy');

// Ref
// https://github.com/mscdex/busboy/issues/296
// https://github.com/stripe/stripe-node/issues/341#issuecomment-617193575
// https://github.com/firebase/firebase-functions/issues/417#issuecomment-760762364
// https://cloud.google.com/functions/docs/writing/write-http-functions#multipart_data

const filesHandlerWithValidationForKeyAndLimit =
  (fileLimit, reqFormFilesNames = []) =>
  (req, res, next) => {
    // First check  the request type
    if (!req.headers['content-type'])
      return res.status(400).send({
        error: 'Invalid file',
        code: 'invalid_upload_file'
      });

    // Init the files obj
    if (!req.files) req.files = {};

    // Prepare busboy
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 0.5 * 1024 * 1024, // max image size to 2 MB
        files: fileLimit
      }
    });

    // Recieved File stream
    busboy.on('file', (key, file, info) => {
      if (!reqFormFilesNames.includes(key))
        return res
          .status(400)
          .json({ message: `Invalid Key name! Recieved ${key}` });

      // wait till file upload is finished
      const chuncks = [];

      // Every chunck is pure bytes
      file.on('data', (chunck) => chuncks.push(chunck));

      file.on('error', (err) => next(err));

      // Concat it in a single Buffer
      file.on('end', () => {
        // Add it to the shape of request (Type extended from folder types)
        req.files[key] = {
          file: Buffer.concat(chuncks),
          info: info
        };
      });
    });

    // On Error Stop
    busboy.on('error', (err) => next(err));

    // For the body
    busboy.on('field', (key, value) => {
      // You could do additional deserialization logic here, values will just be
      // strings, incase of obj call Json.parse!
      req.body[key] = value;
    });

    if (req.rawBody) {
      return new Promise((resolve) => {
        busboy.end(req.rawBody, () => {
          return resolve(next());
        });
      });
    } else {
      // On stream close finish
      // The issue with normally not using this event to finish the request
      // and instead using the busboy.end for firebase is that firebase
      // won't wait for the event to finish, it needs a promise to wait.
      busboy.on('close', () => {
        return next();
      });
      req.pipe(busboy);
    }
  };

exports.filesHandlerWithValidationForKeyAndLimit =
  filesHandlerWithValidationForKeyAndLimit;
