import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { ClientsManagerConstants } from '../configs/clients-manager.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientsManagerService {
  private readonly logger = new Logger(ClientsManagerService.name);

  constructor(
    @Inject(ClientsManagerConstants.CLIENT_NAME) private client: ClientKafka | ClientProxy,
    private configService: ConfigService
  ) { }

  /**
   * The method allows to send an async message to the configured client by specifying the topic name and the message.
   * @example 
   * this.clientsManagerService.sendMessageAsync('topic1','message1');
   * 
   * @param topicName 
   * @param message 
   * @returns true if the input values are not empty and does not throws an error, false otherwise
   */
  async sendMessageAsync(topicName: string, message: any): Promise<boolean> {
    try {
      if (topicName && message) {
        if (this.configService.get('CLIENTS_MANAGER_MOCK_ENABLED') != 'true') {
          this.client.emit(topicName, message);
        }
        return true;
      }
    } catch (e) {
      this.logger.error(e);
    }
    return false;
  }

  /**
   * The method allows to send a sync message to the configured client by specifying the topic name and the message.
   * It return the broker response.
   * @example
   * let res = await this.clientsManagerService.sendMessageSync('topic1','message1');
   * 
   * @param topicName 
   * @param message 
   * @returns the received response from the broke, undefined otherwise
   */
  async sendMessageSync(topicName: string, message: any): Promise<any | undefined> {
    try {
      if (topicName && message) {
        if (this.configService.get('CLIENTS_MANAGER_MOCK_ENABLED') == 'true') {
          return message[ClientsManagerConstants.MOCK_RESPONSE_KEY];
        } else {
          if (this.client instanceof ClientKafka) {
            this.client.subscribeToResponseOf(topicName);
          }
          return await new Promise<any>((resolve, reject) =>
            this.client
              .send(topicName, message)
              .subscribe({
                next: (value) => resolve(value),
                error: (err) => reject(err),
              })
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
    return undefined;
  }

}