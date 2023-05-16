exports.doSomethingWithFile = async (buffer, info) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`${info.filename} File Uploaded`);
      return resolve();
    }, 500);
  });
};
