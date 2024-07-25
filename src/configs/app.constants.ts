export class AppConstants {
    //environments
    static readonly DEV_ENV: string = 'development';
    static readonly TEST_ENV: string = 'test';
    static readonly PROD_ENV: string = 'production';
    //regex
    static readonly IP_PORT_REGEX: string = '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$';
}