import { CipherManagerService } from "./cipher-manager.service"
import { Test, TestingModule } from "@nestjs/testing";

describe('CipherManagerService', () => {
    let service: CipherManagerService;

    beforeAll(async () => {//executed before all test cases
        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [
                CipherManagerService
            ],
        }).compile();
        service = module.get<CipherManagerService>(CipherManagerService);
    });

    it('should encrypt and decrypt a text', () => {
        const PLAIN_TEXT: string = 'Plain text to encrypt';
        const KEY: string = '32bytepassword_00000000000000000';
        //encrypt
        let encryptedText: string | undefined = service.encrypt(PLAIN_TEXT, KEY);
        expect(encryptedText).toBeDefined();
        //decrypt
        let decryptedText: string | undefined = service.decrypt(encryptedText!, KEY);
        expect(decryptedText).toBeDefined();
        expect(decryptedText).toEqual(PLAIN_TEXT);
    });
})