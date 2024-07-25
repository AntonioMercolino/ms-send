import { Injectable } from '@nestjs/common';
import { Writable } from 'stream';
import { ClientsManagerService } from '../../clients-manager/services/clients-manager.service';
import { LogTopic } from '../topics/log.topic';

@Injectable()
export class ClientsManagerTransport extends Writable {
    constructor(private readonly clientsManagerService: ClientsManagerService) {
        super({ objectMode: true });
    }

    override async _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): Promise<void> {
        try {
            let res: boolean = await this.clientsManagerService.sendMessageAsync(LogTopic.LOG_SAVE, chunk);
            if (!res) {
                console.log(chunk);
            }
            callback();
        } catch (e) {
            console.log(e);
            console.log(chunk);
        }
    }
}