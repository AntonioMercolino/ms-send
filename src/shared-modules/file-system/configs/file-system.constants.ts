export class FileSystemConstants {
    //random file name length
    static readonly FILE_NAME_LENGTH: number = 32;
    //regex
    static readonly PATH_REGEX: RegExp = /^[0-9a-zA-Z_-]+((\\|\/)[0-9a-zA-Z_-]+)*?$/;
    static readonly FILE_NAME_REGEX: RegExp = /^[0-9a-zA-Z_-]+(.[0-9a-zA-Z_-]+)*$/;
}