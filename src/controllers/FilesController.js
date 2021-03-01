import BaseController from './BaseController';
import FilesMetadataService from '../services/FilesMetadataService';
import S3Service from '../services/S3Service';

class FilesController extends BaseController {
  constructor(params) {
    super(params);
    this._filesMetadataService = new FilesMetadataService();
    this._s3Service = new S3Service();

  }

  getMany = async (req, res) => {
    console.log(`Starting FilesController.getMany.`);
    try {
      const result = await this._filesMetadataService.getByFilter({});
      res.status(200).send(result);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }

  getFileById = async (req, res) => {
    console.log(`Starting FilesController.getFileById.`);
    try {
      const id = this._getId(req);
      const result = await this._filesMetadataService.getById(id);
      res.status(200).send(result);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }

  getUploadUrl = async (req, res) => {
    console.log(`Starting FilesController.getUploadUrl.`);
    try {
      console.log(this._getBody(req), 'this._getBody(req)')
      const { name, type } = this._getBody(req);
      const signedUrl = await this._s3Service.getUploadUrl({
        name,
        type
      })
      res.status(200).send(signedUrl);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }

  updateFileMetadata = async (req, res) => {
    console.log(`Starting FilesController.updateFileMetadata.`);

    try {
      let file = this._getBody(req);
      const { id } = req.params;

      if (!id) {
        throw new MissingOrInvalidParameterError('ID is required for update.');
      }
      const result = await this._filesMetadataService.updateByFilter({ _id: id }, file);
      res.status(200).send(result);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }

  createFileMetadata = async (req, res) => {
    console.log(`Starting FilesController.createFileMetadata.`);
    try {
      const { name, type, tags, size } = this._getBody(req);
      const result = await this._filesMetadataService.create({ name, type, tags, size });

      res.status(200).send(result);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }

  getDownloadUrl = async (req, res) => {
    console.log(`Starting FilesController.getDownloadUrl.`);
    try {
      const { fileId } = this._getBody(req);
      const result = await this._s3Service.getDownloadUrl(fileId);

      res.status(200).send(result);
    } catch (err) {
      this._errorHandler(res, err);
    }
  }
}

export default FilesController;