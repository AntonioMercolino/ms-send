/* tslint:disable */
/* eslint-disable */
/**
 * Piattaforma Notifiche: API B2B per le Pubbliche Amministrazioni
 *  ## Abstract   API utilizzate dalle pubbliche amministrazioni per __inviare richieste di notifiche__ e    __ottenere informazioni in modalità pull__ sullo stato della    _\"richiesta di notifica\"_ (accettata o rifiutata) e, in caso di richiesta accettata,    sulle comunicazioni effettuate, o solo tentate, nei confronti dei destinatari della notifica.  ## Operazioni utilizzate, in sequenza temporale <table> <tr> <td>   <img src=\"https://raw.githubusercontent.com/pagopa/pn-delivery/e6f1db9eac9ace7fc2ad0fe6de241ab4525b6b6a/docs/openapi/images/invio-notifica.png\" height=\"790\" width=\"515\" alt=\"Invio notifica\" />     </br>    </br>    </br>      #### 3. Verifica accettazione richiesta di invio notifica    Per questa verifica possono essere utilizzate due modalità:      1. __richiesta puntuale__: consigliato solo ai fini di test   2. __lettura da stream configurato__: consigliato per ambienti di produzione      La differenza tra le due modalità è nell\'interazione e nell\'efficienza.      Con la modalità _\"richiesta puntuale\"_ è necessaria l\'invocazione per ogni notifica,   mentre con la modalità _\"stream\"_ è possibile avere gli aggiornamenti   di stato di più notifiche con una sola invocazione.      #### 3.1 Richiesta puntuale di verifica accettazione    Questa modalità è resa disponibile solo ai fini di test o di eventuali operazioni   di allineamento. Richiede l\'invio di una richiesta per ogni notifica.   Se il passo (2) avviene con successo si utilizza l\'operazione    [getNotificationRequestStatus](#/SenderReadB2B/retrieveNotificationRequestStatusV23)   per ottenere informazioni riguardo allo stato della \"richiesta di invio di notifica\". </br>   Nel campo _notificationRequestStatus_ sarà indicato:</br>   >\\- <strong>WAITING:</strong> se la validazione è ancora in corso.</br>   \\- <strong>ACCEPTED:</strong> se richiesta di notifica accettata, lo _IUN_ è valorizzato.</br>   \\- <strong>REFUSED:</strong> se richiesta di notifica rifiutata, è valorizzato il campo _errors_.</br>   </br>   </br>   </br>    #### 3.2 Richiesta avanzamento via \"stream\" di verifica di accettazione    Questa è la modalità consigliata. Per essere utilizzata è necessaria un\'operazione preliminare   tramite la chiamata alla API [createEventStream](https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpagopa%2Fpn-delivery-push%2Fmain%2Fdocs%2Fopenapi%2Fapi-external-b2b-webhook.yaml#/Streams/createEventStream)   per configurare uno \"stream\" che registri il cambio di stato della notifica con il seguente payload:</br></br>``   {     \"title\": \"NotificationAccepted\",     \"eventType\": \"STATUS\",     \"filterValues\": [       \"ACCEPTED\"     ]   }   ``</br></br>   Successivamente si possono ottenere i dati richiamando la API [consumeEventStream](https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpagopa%2Fpn-delivery-push%2Fmain%2Fdocs%2Fopenapi%2Fapi-external-b2b-webhook.yaml#/Events/consumeEventStream)         __NOTA__ saranno disponibili i dati di cambiamento di stato occorsi solo successivamente alla configurazione   dello stream.      </br>   </br>   </br>   </br>    </td> <td>    ### Ciclo di vita della notifica lato mittente      #### 1. Caricamento dei documenti della notifica    Prima di invocare la richiesta di notifica è necessario caricare i documenti della notifica (documenti e bollettini/metadata di pagamento).   [Schema Metadata F24](#/components/schemas/F24Metadata)    #### 1.a. Richiesta presigned Url      Invocare l\'operazione [presignedUploadRequest](#/NewNotification/presignedUploadRequest)    con cui prenotare il caricamento. Possono essere effettuate un massimo di <span id=\"numberOfPresignedRequest\">15</span> prenotazioni di caricamento   per ogni richiesta.</br>   In risposta si ottengono le seguenti informazioni:<br/>   \\- httpMethod <br/>   \\- secret <br/>   \\- url <br/>   L\'url restituito ha una validità di 1h.      </br>    #### 1.b Upload documenti della notifica      Per ogni documento utilizzare un richiesta HTTP con metodo _httpMethod_ (POST o PUT)    all\'url indicato dal campo _url_. <br/>   In tale richiesta vanno aggiunti i seguenti header: <br/>   \\- _content-type_: valorizzato come il campo \"contentType\" della richiesta di cui al punto (1.a) <br/>   \\- _x-amz-meta-secret_: valorizzato con il valore del campo \"secret\" della risposta di cui al punto (1.a) <br/>   \\- _trailer_: valorizzato con ```x-amz-checksum-sha256``` <br/>   \\- _x-amz-checksum-sha256_: valorizzato con il checksum sha256, codificato in base 64, del contenuto binario del file che verrà caricato. (__N.B.__ questo è un trailer HTTP non un header).     Vedi [HTTP Trailer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer) <br/>     __NOTA:__ se l\'operazione di upload è stata eseguita con successo, si otterrà come risposta _status 200 OK_. <br/>     Nell\'header di questa risposta, si otterrà il campo __x-amz-version-id__ che dovrà essere utilizzato durante <br/>      l\'inserimento della notifica, nel campo ref.__versionToken__ in corrispondenza del documento ad esso associato.      </br>   </br>   </br>      #### 2. Richiesta di invio della notifica    Per effettuare una richiesta di invio notifica, invocare l\'operazione    [sendNewNotification](#/NewNotification/sendNewNotificationV21) valorizzando il campo <b>payments</b> (scegliendo in base alla tipologia di file caricato <b>F24</b>/<b>pagoPa</b>) e il campo <b>documents</b> utilizzando i riferimenti dei file     caricati in precedenza nel seguente:     <br>     - <b>digests.sha256 </b>: SHA256 associato all\'allegato caricato     - <b>contentType </b>: in caso la tipologia dell\'allegato fosse <b>documento</b> e <b>avviso di pagamento</b> dovrà essere popolato con \"application/pdf\" in caso di <b>F24</b> invece dovrà contenere \"application/json\"     - <b>ref.key</b>: key ottenuta nella response della chiamata [presignedUploadRequest](#/NewNotification/presignedUploadRequest)     - <b>ref.versionToken</b>: valore dell\'header x-amz-version-id ottenuto dalla response in fase di upload dell\'allegato ad esso associato.     </br>     Nel caso si voglia valorizzare il campo <b>payments</b>  con un bolletino di pagamento <b>pagoPa</b> oltre al riferimento al file tramite la sezione <b>pagoPaForm</b> con le indicazioni riportate sopra, sono da valorizzare i campi <b>noticeCode</b> \"codice avviso pagoPA\" ,univoco, di pagamento del sistema pagoPA utilizzato , usato per pagamento online;     <b> creditorTaxId</b>: codice fiscale dell\'ente a cui fa riferimento il \"codice avviso pagoPA\"; il campo     <b>applyCost</b>: flag per indicare se l\'avviso pagoPA deve contenere i costi di notifica e il campo     </br>     Nel caso,invece, nel campo payments si voglia valorizzare un pagamento <b>F24</b>,oltre al riferimento al file caricato tramite la sezione <b>metadataAttachment</b> con le indicazioni riportate sopra, sono da valorizzare i campi <b> title</b>: titolo del documento pdf da mostrare all\'utente e       <b>applyCost</b>: flag per indicare se il modello F24 deve contenere i costi di notifica.    </br>   </br>   </br>     <img src=\"https://raw.githubusercontent.com/pagopa/pn-delivery/e6f1db9eac9ace7fc2ad0fe6de241ab4525b6b6a/docs/openapi/images/verifica-accettazione-richiesta-invio.png\" height=\"731\" width=\"489\" alt=\"Verifica accettazione richiesta\" /> </td>    </tr> </table>     ### 4. Monitorare l\'avanzamento di una notifica    Per questa verifica possono essere utilizzate due modalità:         1. __monitoraggio puntuale__: consigliato solo ai fini di test         2. __monitoraggio tramite stream__: consigliato per ambienti di produzione    #### 4.1 Monitoraggio puntuale    Se la \"richiesta di invio di notifica\" passa le validazioni viene trasformata in \"notifica\" . Sarà possibile   identificarla dallo IUN restituito dall\'operazione   [getNotificationRequestStatus](#/SenderReadB2B/retrieveNotificationRequestStatusV23).</br>    A questo punto, si potranno utilizzare l\'operazione _GET /delivery/v2.3/notifications/sent/{iun}_ per   ottenere i dettagli della notifica, la _timeline_ che dettaglia il perfezionamento della   notifica per il mittente e l\'avanzamento delle comunicazioni nei confronti dei destinatari.      #### 4.2 Monitoraggio tramite stream    Questa è la modalità consigliata in produzione. Per essere utilizzata è necessaria un\'operazione preliminare   tramite la chiamata alla API [createEventStream](#/Streams/createEventStream)   per configurare uno \"stream\" che registri il cambio di stato della notifica con il seguente payload di esempio:</br></br>``   {     \"title\": \"NotificationAccepted\",     \"eventType\": \"STATUS\"   }   ``</br></br>che permette di monitorare gli eventi di tipo \"STATO\". Successivamente si può ottenere il dettaglio della stream appena creata chiamando la    API [getEventStream](https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpagopa%2Fpn-delivery-push%2Fdevelop%2Fdocs%2Fopenapi%2Fapi-external-b2b-webhook.yaml#/Streams/getEventStream), mentre si possono ottenere i dati degli eventi richiamando la API [consumeEventStream](https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpagopa%2Fpn-delivery-push%2Fdevelop%2Fdocs%2Fopenapi%2Fapi-external-b2b-webhook.yaml#/Events/consumeEventStream)     ``</br></br>che permette di monitorare gli eventi di tipo \"STATO\". Successivamente si può ottenere il dettaglio    dello stream appena creato chiamando la API [getEventStream](#/Streams/getEventStream)), mentre si possono    ottenere i dati degli eventi richiamando la API [consumeEventStream](#/Streams/consumeEventStream)     __NOTA__ saranno disponibili i dati di cambiamento di stato occorsi solo successivamente alla configurazione   dello stream.    </br>    ### 5. Download dei Legal Facts    É possibile scaricare le Attestazioni Opponibili a Terzi e gli altri documenti conservati da Piattaforma Notifiche attraverso il servizio di [download Legal Fact](#/LegalFacts/downloadLegalFactById) passando all\'interno del path lo <strong>Iun</strong>, il <strong>legalFactType</strong> ed il <strong>legalFactId</strong>; si otterrà nella response un link che permette di scaricare il documento richiesto.</br> Per ottenere il <strong>legalFactType</strong> ed il <strong>legalFactId</strong> bisogna chiamare il servizio di [lettura dettaglio notifica](#/SenderReadB2B/retrieveSentNotificationV21) con lo <code>{Iun}</code> della notifica di interesse: all\'interno del campo <i>timeline</i> della response è possibile trovare l\'elenco degli eventi di quella notifica ed i <strong>legalFactType</strong> e <strong>legalFactId</strong> in corrispondenza degli eventi che generano documenti.    </br> <details>   <summary><strong><big><big><big><big>AMBIENTI</big></big></big></big></strong></summary> <ul>   <li><strong>https://api.notifichedigitali.it:</strong></br>Ambiente di produzione</li> <li><strong>https://api.uat.notifichedigitali.it:</strong></br>Ambiente di collaudo. Potrebbe subire modifiche/integrazioni in futuro, rimanendo comunque non-bloccante e rispettando il principio di retro compatibilità</li> </ul>   </details></br>
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface ConfigurationParameters {
    apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>);
    username?: string;
    password?: string;
    accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string) | ((name?: string, scopes?: string[]) => Promise<string>);
    basePath?: string;
    serverIndex?: number;
    baseOptions?: any;
    formDataCtor?: new () => any;
}

export class Configuration {
    /**
     * parameter for apiKey security
     * @param name security name
     * @memberof Configuration
     */
    apiKey?: string | Promise<string> | ((name: string) => string) | ((name: string) => Promise<string>);
    /**
     * parameter for basic security
     *
     * @type {string}
     * @memberof Configuration
     */
    username?: string;
    /**
     * parameter for basic security
     *
     * @type {string}
     * @memberof Configuration
     */
    password?: string;
    /**
     * parameter for oauth2 security
     * @param name security name
     * @param scopes oauth2 scope
     * @memberof Configuration
     */
    accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string) | ((name?: string, scopes?: string[]) => Promise<string>);
    /**
     * override base path
     *
     * @type {string}
     * @memberof Configuration
     */
    basePath?: string;
    /**
     * override server index
     *
     * @type {number}
     * @memberof Configuration
     */
    serverIndex?: number;
    /**
     * base options for axios calls
     *
     * @type {any}
     * @memberof Configuration
     */
    baseOptions?: any;
    /**
     * The FormData constructor that will be used to create multipart form data
     * requests. You can inject this here so that execution environments that
     * do not support the FormData class can still run the generated client.
     *
     * @type {new () => FormData}
     */
    formDataCtor?: new () => any;

    constructor(param: ConfigurationParameters = {}) {
        this.apiKey = param.apiKey;
        this.username = param.username;
        this.password = param.password;
        this.accessToken = param.accessToken;
        this.basePath = param.basePath;
        this.serverIndex = param.serverIndex;
        this.baseOptions = param.baseOptions;
        this.formDataCtor = param.formDataCtor;
    }

    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    public isJsonMime(mime: string): boolean {
        const jsonMime: RegExp = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
}
