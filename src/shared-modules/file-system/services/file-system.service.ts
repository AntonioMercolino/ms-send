import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { FileSystemConstants } from '../configs/file-system.constants';

@Injectable()
export class FileSystemService {
  private readonly logger = new Logger(FileSystemService.name);

  constructor(
    private readonly configService: ConfigService
  ) { }

  /**
   * The method writes the received data inside "relativeDirectory" directory,
   * by generating a random file name and appending the specified format.
   * If it does not exist, the specified directory will be created in the configured file system. 
   * @example 
   * const fileName = this.fileSystemService.writeFileBuffer('dir1/subdir1','pdf', Buffer.from(rawData));
   * 
   * @param relativeDirectory is the directory in which the file will be saved
   * @param fileFormat is the file format
   * @param data contains the buffer that will to be saved on the file system
   * @returns the generated file name or undefined in case of error
   */
  writeFileBuffer(relativeDirectory: string, fileFormat: string, data: Buffer): string | undefined {
    try {
      if (relativeDirectory && fileFormat && data) {
        if (!this.configService.get('FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH')
          || this.configService.get('FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH') == relativeDirectory) {
          //generate a random fileName
          let fileName: string = crypto.randomBytes(FileSystemConstants.FILE_NAME_LENGTH).toString("hex") + "." + fileFormat;
          let safePath: string | undefined = this.getSafeFilePath(relativeDirectory, fileName, true);//make directory if it does not exist
          if (safePath) {
            //save the file
            writeFileSync(safePath, data);
            return fileName;
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
    return undefined;
  }

  /**
   * The method deletes the file "fileName" from "relativeDirectory" directory.
   * @example  
   * const res = this.fileSystemService.deleteFile('dir1/subdir1','file.pdf');
   * 
   * @param relativeDirectory is the directory from which the file will be deleted
   * @param fileName is the name of the file that will be deleted
   * @returns true if the deletion succeeded, false otherwise
   */
  deleteFile(relativeDirectory: string, fileName: string): boolean {
    try {
      if (relativeDirectory && fileName) {
        if (!this.configService.get('FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH')
          || this.configService.get('FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH') == relativeDirectory) {
          let safePath: string | undefined = this.getSafeFilePath(relativeDirectory, fileName);
          if (safePath) {
            //delete the file
            unlinkSync(safePath);
            return true;
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
    return false;
  }

  /**
   * The method reads the "fileName" file from "relativeDirectory" directory.
   * @example  
   * const file = this.fileSystemService.readFileBuffer('dir1/subdir1','filename.pdf');
   * response.send(file);
   * 
   * @param relativeDirectory is the directory from which the file will be read
   * @param fileName is the name of the file that will be read
   * @returns the buffer of the read file, undefined in case of error
   */
  readFileBuffer(relativeDirectory: string, fileName: string): Buffer | undefined {
    try {
      if (relativeDirectory && fileName) {
        let safePath: string | undefined = this.getSafeFilePath(relativeDirectory, fileName);
        if (safePath) {
          return readFileSync(safePath);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
    return undefined;
  }

  /**
   * The method check the relativeDirectory and the filename to avoid path traversal attack.
   * If createdDirectory is true, it creates the relative directory inside the base path.
   * 
   * @param relativeDirectory 
   * @param filename 
   * @param createDirectory 
   * @returns a safe path or undefined in case of non-valid inputs
   */
  private getSafeFilePath(relativeDirectory: string, filename: string, createDirectory: boolean = false): string | undefined {
    let basePath: string = this.configService.get('FS_PATH')!;
    if (!FileSystemConstants.PATH_REGEX.test(relativeDirectory)
      || !FileSystemConstants.FILE_NAME_REGEX.test(filename)) {
      return undefined;
    }
    let normalizedRelativeDirectory: string = path.normalize(relativeDirectory);
    let normalizedFilename: string = path.normalize(filename);
    let safePath: string = path.join(basePath, normalizedRelativeDirectory, normalizedFilename);
    if (safePath.indexOf(basePath) !== 0) {
      return undefined;
    }
    if (createDirectory) {
      //create the directory if it does not exists
      if (!existsSync(path.join(basePath, relativeDirectory))) {
        mkdirSync(path.join(basePath, relativeDirectory), { recursive: true })
      }
    }
    return safePath;
  }
}