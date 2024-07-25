import { Injectable, Logger } from '@nestjs/common';
import { Encoding } from 'crypto';
import * as crypto from 'crypto';
import { createCipheriv, randomBytes } from 'crypto';

@Injectable()
export class CipherManagerService {

    private readonly logger = new Logger(CipherManagerService.name);

    private readonly ENCRYPTION_ALGORITHM: string = "aes-256-cbc";
    private readonly BUFFER_ENCODING_FORMAT: BufferEncoding = "hex";
    private readonly PLAINTEXT_FORMAT: Encoding = "utf-8";

    /**
     * This method, given a text encrypted with aes-256-cbc and the encryption key, 
     * return the decrypted text. If the decryption process fails or the key is invalid, returns undefined.
     * 
     * @param encryptedText string
     * @param key string
     * @returns string | undefined
     * @example
     * let plainText: string | undefined = CipherManager.decrypt(encryptedText, key);
     */
    decrypt(encryptedText: string, key: string): string | undefined {
        try {
            const ENCODING: BufferEncoding = this.BUFFER_ENCODING_FORMAT;
            const IV_STRING = encryptedText.slice(0, 32);
            const ENCRYPTED_DATA_STRING = encryptedText.slice(32);
            const IV = Buffer.from(IV_STRING, ENCODING);
            const ENCRYPTED_DATA = Buffer.from(ENCRYPTED_DATA_STRING, ENCODING);
            const DECIPHER = crypto.createDecipheriv(this.ENCRYPTION_ALGORITHM, key, IV);
            const DECRYPTED = DECIPHER.update(ENCRYPTED_DATA);
            return Buffer.concat([DECRYPTED, DECIPHER.final()]).toString();
        } catch (e) {
            this.logger.error(e);
        }
        return undefined;
    }

    /**
     * This method, given a plain text and a 32 bytes password, returns the text encrypted with aes-256-cbc.
     * It fails if the key given key is invalid.
     * 
     * @param textToEncrypt string
     * @param key string
     * @returns string | undefined
     * @example
     * let encryptedText: string | undefined = CipherManager.encrypt(plainText,key);
     */
    encrypt(textToEncrypt: string, key: string): string | undefined {
        try {
            const IV: Buffer = randomBytes(16);
            const ENCODING: BufferEncoding = this.BUFFER_ENCODING_FORMAT;
            //Encrypting
            const CIPHER = createCipheriv(this.ENCRYPTION_ALGORITHM, key, IV);
            const encrypted = Buffer.concat([
                CIPHER.update(textToEncrypt, this.PLAINTEXT_FORMAT),
                CIPHER.final(),
            ]);
            return IV.toString(ENCODING) + encrypted.toString(ENCODING);
        } catch (e) {
            this.logger.error(e);
        }
        return undefined;
    }

}