

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { FileSystemService } from './file-system.service';

describe('FileSystemService', () => {
    let service: FileSystemService;
    let fsMap = new Map<string, Buffer>();//mock file system

    beforeAll(async () => {//executed before all test cases
        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [
                ConfigService,
                FileSystemService,
            ],
        }).compile();
        service = module.get<FileSystemService>(FileSystemService);
        //Mock fs used methods
        jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any): any => {
            return fsMap.get(filePath);
        });
        jest.spyOn(fs, 'writeFileSync').mockImplementation((filePath: any, buffer: any) => {
            fsMap.set(filePath, buffer)
            return;
        });
        jest.spyOn(fs, 'unlinkSync').mockImplementation((filePath: any) => {
            return fsMap.delete(filePath);
        });
        jest.spyOn(fs, 'existsSync').mockImplementation((filePath: any) => {
            return fsMap.has(filePath);
        });
        jest.spyOn(fs, 'mkdirSync').mockImplementation((filePath: any, options) => {
            return filePath;
        });
        process.env.FS_PATH = "fakepath"
    });

    afterAll(async () => {//executed after all test cases

    });

    beforeEach(async () => {//executed before each test case

    });

    afterEach(() => {//executed after each test case

    });

    //TEST CASES
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should write, read and delete a file', async () => {
        let directory: string = 'dir1/subdir1';
        let fileFormat: string = 'pdf';
        let data: Buffer = Buffer.from('Hello world');
        //file write error
        let fileName1 = service.writeFileBuffer(directory, fileFormat, undefined!);
        expect(fileName1).toBeUndefined();
        //file write success
        let fileName2 = service.writeFileBuffer(directory, fileFormat, data);
        expect(fileName2).toBeDefined();
        //file read error
        let file1: Buffer | undefined = service.readFileBuffer(directory, 'fakename');
        expect(file1).toBeUndefined();
        //file read success
        let file2: Buffer | undefined = service.readFileBuffer(directory, fileName2!);
        expect(file2?.compare(data)).toBe(0);
        //file delete error
        const res1 = service.deleteFile(directory, undefined!);
        expect(res1).toBeFalsy();
        //file delete success
        const res = service.deleteFile(directory, fileName2!);
        expect(res).toBeTruthy();
    });

});
