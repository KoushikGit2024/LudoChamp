import express from "express";
import ImageKit from '@imagekit/nodejs';

const client = new ImageKit({
  privateKey: process.env['IMAGEKIT_PRIVATE_KEY'], // This is the default and can be omitted
});

const response = await client.files.upload({
  file: fs.createReadStream('path/to/file'),
  fileName: 'file-name.jpg',
});

console.log(response);
async function loginHandler(req, res) {
    res.send("Login");
}

async function registerHandler(req, res) {
    res.send("Register");
}

export { loginHandler, registerHandler };
