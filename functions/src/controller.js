const Busboy = require('busboy');
const { doSomethingWithFile } = require('./util');

/**
 * NOTE: This is just a dummy function to simulate the upload process
 * Since its async (The function itself), we don't need to return anything or wrap it in a promise
 */
exports.busboyWithoutMiddleware = async (req, res, next) => {
  if (!req.headers['content-type']) {
    res.status(400).send({
      error: 'Invalid file',
      code: 'invalid_upload_file'
    });
  }

  // async function call here
  // like a db call or something will run first

  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: 0.5 * 1024 * 1024, // max image size to 2 MB
      files: 1 // Limit to one file upload
    }
  });

  busboy.on('file', (key, file, info) => {
    const { mimeType: mimetype, filename, encoding } = info;
    console.log(
      `Process File: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
    );

    // Wait till file is uploaded
    const chuncks = [];
    file.on('data', (data) => {
      // NOTE: You can upload the chuncks to S3 or Google Cloud Storage
      // if you don't want to do anything with the file in memory
      chuncks.push(data);
    });

    file.on('error', (err) => next(err));

    /**
     * This will run on EVERY file uploaded,
     * if you have multiple files, you can use
     * the key to identify them.
     * Also, you can use the info object to get the
     * mimetype, encoding, filename (name of the file on the client's computer),
     * and other stuff
     * This is useful if you want to validate the file
     *
     * Also useful if you want to do same operation on every file, like parsing XML files.
     */
    file.on('end', async () => {
      try {
        // Concat it in a single Buffer
        const buffer = Buffer.concat(chuncks);
        // async function or operation, also you can upload
        // buffers to S3 or Google Cloud Storage here easily,
        // no need to save it to disk
        await doSomethingWithFile(buffer, info);
        // Don't forget to call res.send() or next() to finish the request
        res.send('File uploaded successfully');
      } catch (err) {
        next(err);
      }
    });
  });

  if (req.rawBody) {
    // RETURN A PROMISE IF YOU ARE USING RAW BODY!!!!
    // Since the function is async, we don't need to return anything
    busboy.end(req.rawBody);
  } else {
    req.pipe(busboy);
  }
};

exports.file = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: 'No file uploaded',
        error: true
      });
    }
    const { buffer, info } = req.file;
    await doSomethingWithFile(buffer, info);
    res.send('File uploaded successfully');
  } catch (err) {
    next(err);
  }
};

exports.files = async (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(400).send({
        message: 'No files uploaded',
        error: true
      });
    }
    for (const file of req.files) {
      const { buffer, info } = file;
      await doSomethingWithFile(buffer, info);
    }
    res.send('Files uploaded successfully');
  } catch (err) {
    next(err);
  }
};

exports.filesWithValidation = async (req, res, next) => {
  try {
    await doSomethingWithFile(req.files['key'].buffer, req.files['key'].info);
    await doSomethingWithFile(
      req.files['otherKey'].buffer,
      req.files['otherKey'].info
    );
    res.send('Files uploaded successfully');
  } catch (err) {
    next(err);
  }
};
