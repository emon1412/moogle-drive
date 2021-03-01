import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Config from 'config';
import cookieParser from 'cookie-parser';
import FilesController from '../controllers/FilesController.js';
import requiresCorrectOrigin from '../middlewares/requiresCorrectOrigin';

const filesController = new FilesController()
require('dotenv').config();
const server = express();

server.disable('x-powered-by'); // obscure AWS

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
const corsOptions = cors({
  preflightMaxAge: 5, // Optional
  origins: [Config.webUrl, 'localhost'],
  allowHeaders: [
    'authorization',
    'withcredentials',
    'x-requested-with',
    'x-forwarded-for',
    'x-real-ip',
    'user-agent',
    'keep-alive',
    'host',
    'accept',
    'connection',
    'upgrade',
    'content-type',
    'content-length',
    'dnt',
    'if-modified-since',
    'cache-control',
  ],
  exposeHeaders: [
    'authorization',
    'withcredentials',
    'x-requested-with',
    'x-forwarded-for',
    'x-real-ip',
    'user-agent',
    'keep-alive',
    'host',
    'accept',
    'connection',
    'upgrade',
    'content-type',
    'content-length',
    'dnt',
    'if-modified-since',
    'cache-control',
  ],
});
server.options(/.*/, corsOptions, (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'authorization, content-type, accept');
  res.header('Access-Control-Allow-Origin', Config.webUrl);
  res.header('Access-Control-Max-Age', 600);
  res.send(204);
});

server.use(corsOptions);
server.use(cookieParser());

server.post('/fileuploadurl', requiresCorrectOrigin, filesController.getUploadUrl);
server.post('/filedownloadurl', requiresCorrectOrigin, filesController.getDownloadUrl);
server.get('/files', requiresCorrectOrigin, filesController.getMany);
server.get('/files/:id', requiresCorrectOrigin, filesController.getFileById);
server.post('/filesmetadata', requiresCorrectOrigin, filesController.createFileMetadata);
server.put('/filesmetadata/:id', requiresCorrectOrigin, filesController.updateFileMetadata);


export default server;
