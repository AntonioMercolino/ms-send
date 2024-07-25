# MS-SEND

MS-SEND is a [Nest](https://github.com/nestjs/nest) microservice project, written in Typescript, configured to communicate by using the [Kafka](https://kafka.apache.org/) broker. It already provides the following shared-modules:
* database: used for the database access by using TypeORM (PostgreSQL as default);
* clients-manager: used to communicate with other microservices by default using the [Kafka](https://kafka.apache.org/) broker;
* file-system: used for file system access (it can be used to apply the Claim Check pattern to exchange file between microservices);
* logging: used to log json-based data with [Pino](https://getpino.io/#/) to a clients-manager configured broker;
* cipher-manager: used to encrypt or decrypt text;

## Description

It uses the "@nestjs/config" library to access to the environment variables, configured inside a .env file, for which it is provided a starting example.
All the .env params are validated at startup by using the "Joi" library.
A ValidationPipe is configured to validate the content of objects, by using "class-validator" and "class-transformer" libraries (default exceptions are wrapped in RpcException). Responses are serialized by configuring a ClassSerializerInterceptor.
It provides an already configured Dockerfile.
The following params must be specified in the .env file:
* NODE_ENV: can be "development", "test" or "production";
* CLIENTS_MANAGER_KAFKA_CLIEND_ID: is the microservice client id for the broker;
* CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: is the group id which the microservice belong to;
* CLIENTS_MANAGER_KAFKA_BROKER_URL: is the Kafka broker url (for example 127.0.0.1:9093);
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: it allows to use an SSL communication to exchange message with the broker. If it is true, the CA, KEY and CERT file must be specified;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: is the CA in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: is the KEY in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: is the CERT in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: is the username used to authenticate the microservice with the broker by using 'scram-sha-512' algorithm. If it is missing, authetication will be disabled;
* CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: if authentication is enabled, it is the password used to authenticate the microservice with the broker by using 'scram-sha-512' algorithm;

In the "modules" directory, all the necessary self-consistent new modules can be implemented. 
Each new module:
* has an own directory inside "modules";
* can have custom environment params, configured and validated with Joi in the respective "Module" declaration;
* can have a configs directory, containing a 'modulename'.constants.ts with the custom module constants;
* can have all the necessary business logic directories (controller, services, repositories, entities, dtos, decorators ecc). For each repository, service, controller etc can be added a "Jest" unit test file. It's possible to add end-to-end test in /test directory, by using the "Supertest" library. It can be used "JsDoc" to add methods documentation;
* can import other modules by adding the necessary import in the module configurations;
* must be imported in app.module.ts in order to be loaded at startup;

The default "MS-SEND" project name can be updated inside package.json file.

The project contains the following modules (each module can be easily removed by deleted the respective directory):
#### Database: 
It provides a default configuration for a PostgreSQL database access with TypeORM (but can be changed from database.module.ts). 
Each module, that needs to access to the database, can import DatabaseModule by specifying its own entities in the respective "Module" declaration. The module automatically loads all the modules/'modulename'/entities/*.entity.ts entities. 
The module that needs to import the database module can specify the following in the respective Module imports declaration:
```javascript
DatabaseModule,
TypeOrmModule.forFeature([Entity1, Entity2]),
```
Each entity can extends the provided CustomBaseEntity, which contains some used columns (like id (generated with uuid), createdAt, updatedAt, version, deletedAt (used for soft delete)).
A soft delete can be made by calling the "softDelete" method on a repository, and the record can be restored by callind the "restore" one. Automatically, all find queries will include a where condition to read all records having a null deletedAt column. It's possible to read a soft deleted record by including a "withDeleted" constraint in find queries, as the following example:
```javascript
const category = await this.categoriesRepository.findOne(
    id, 
    {
      relations: ['posts'],
      withDeleted: true 
    }
  );
```
Each new service can use the pagination provided by [@nestjs-paginate](https://www.npmjs.com/package/nestjs-paginate):
```javascript
public findAll(query: PaginateQuery): Promise<Paginated<CatEntity>> {
    return paginate(query, this.catsRepository, {
      sortableColumns: ['id', 'name', 'color', 'age'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name', 'color', 'age'],
      select: ['id', 'name', 'color', 'age', 'lastVetVisit'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        age: true,
      },
    })
  }
```
It's possible to make a service method transactional by adding the following decorator:
```javascript
  @Transactional()
  public async save(exampleDto: ExampleDto): Promise<Example | undefined> {
    ...
  }
```
To test a service tagged with the transactional decorator, it's useful to mock the default behaviour with the following script before the test "describe":
```javascript
  jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
  }));
```
The following params must be specified in the .env file:
* DB_HOST: is the database host ip;
* DB_PORT: is the database port;
* DB_USERNAME: is the username used for database auth;
* DB_PASSWORD: is the password used for database auth;
* DB_SCHEMA: is the database schema name;
* DB_SYNCH: if "true" it allows to automatically create/update all database tables, in relation to the project entities. DB_SYNCH MUST BE false IN PRODUCTION TO AVOID DATA LOSS!
* API_KEY:
* API_URL:

#### Clients-manager
It provides a client which can be used to communicate with other microservices by default using a Kafka broker, by possibly using 'scram-sha-512' for authentication and SSL.
The client provides sync/async message sending.
The module that needs to import the clients-manager module can specify the following in the respective Module imports declarations:
```javascript
ClientsManagerModule,
```
The following params must be specified in the .env file, and they are related to the used client (default Kafka):
* CLIENTS_MANAGER_MOCK_ENABLED: allows to mock Kafka connection for development purposes. If enabled, all the async messages will not sent. In case of sync sendind, it will be returned the value contained in the "RES" key of send message;
* CLIENTS_MANAGER_KAFKA_CLIEND_ID: is the api gateway client id for the broker;
* CLIENTS_MANAGER_KAFKA_CLIENT_GROUP_ID: is the group id which the api gateway belong to;
* CLIENTS_MANAGER_KAFKA_BROKER_URL: is the Kafka broker url (for example 127.0.0.1:9093);
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_ENABLED: it allows to use an SSL communication to exchange message with the broker. If it is true, the CA, KEY and CERT file must be specified;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_CA: is the CA in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_KEY: is the KEY in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_SSL_CERT: is the CERT in case of enabled SSL;
* CLIENTS_MANAGER_KAFKA_BROKER_USERNAME: is the username used to authenticate the microservice with the broker by using 'scram-sha-512' algorithm. It is optional and if it is missing, the authentication will be disabled;
* CLIENTS_MANAGER_KAFKA_BROKER_PASSWORD: is the password used to authenticate the microservice with the broker by using 'scram-sha-512' algorithm, if the authentication is enabled;
In case of sync communication, a ResponseMessage dto is returned, which can contain an error message or the response body.

#### File-system
It provides the main methods to access to a file system for write/delete/read a file, by protecting the accesses from the main path traversal attacks. 
The module that needs to import the file-system module can specify the following in the respective Module imports declarations:
```javascript
FileSystemModule,
```
The following params must be specified in the .env file:
* FS_PATH: is the absolute path of the default directory used for file system access;
* FS_CAN_ONLY_WRITE_AND_DELETE_FROM_RELATIVE_PATH: is the optional relative path where the microservice/api-gateway can write/delete files. Anyway, it's possible to read from all FS_PATH subdirectory. It is used to limit permissions of microservices which only can access to existing files and can write/delete files from only a specified work directory (for the transfer to the microservice that manages files by using the claim-check pattern). In case of the microservice that manages files, it will not be valued because it can write/delete all FS_PATH files by also updating the db paths;

### Logging
It provides a module to manage app logs with Pino. It allows to send logs to a custom transport, which is able to send messages to the ClientsManagerModule.
The module that needs to import the logging module can specify the following in the respective Module imports declarations:
```javascript
LoggingModule,
```
The main app is already configured to use Pino logger:
```javascript
{ bufferLogs: true }
app.useLogger(app.get(Logger));
```
The following params must be specified in the .env file:
* LOGGING_NAME: is the app name and it can be used to distinguish the origin of logs;
* LOGGING_LEVEL: is the log level (one of "silent", "fatal", "error", "warn", "info", "debug", "trace");
* LOGGING_ENABLE_CLIENTS_MANAGER_TRANSPORT: if it is "true" it allows to send logs to the configured ClientsManagerModule. If it is disabled, logs will be written to console;

#### Cipher-manager
It provides the main methods to encrypt and decrypt texts.
The module that needs to import the cipher-manager module can specify the following in the respective Module imports declarations:
```javascript
CipherManagerModule,
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
