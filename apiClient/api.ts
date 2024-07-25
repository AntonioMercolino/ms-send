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


import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, BaseAPI, RequiredError, operationServerMap } from './base';

/**
 * 
 * @export
 * @interface AarCreationRequestDetails
 */
export interface AarCreationRequestDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof AarCreationRequestDetails
     */
    'recIndex': number;
    /**
     * Chiave per recupero da safe-storage del documento aar
     * @type {string}
     * @memberof AarCreationRequestDetails
     */
    'aarKey': string;
    /**
     * numero di pagine del PDF generato
     * @type {number}
     * @memberof AarCreationRequestDetails
     */
    'numberOfPages': number;
}
/**
 * 
 * @export
 * @interface AarGenerationDetails
 */
export interface AarGenerationDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof AarGenerationDetails
     */
    'recIndex': number;
    /**
     * Chiave per recupero da safe-storage del documento aar
     * @type {string}
     * @memberof AarGenerationDetails
     */
    'generatedAarUrl': string;
    /**
     * numero di pagine del PDF generato
     * @type {number}
     * @memberof AarGenerationDetails
     */
    'numberOfPages': number;
}
/**
 * 
 * @export
 * @interface AnalogFailureWorkflowDetails
 */
export interface AnalogFailureWorkflowDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof AnalogFailureWorkflowDetails
     */
    'recIndex': number;
    /**
     * Chiave per recupero da safe-storage del documento aar
     * @type {string}
     * @memberof AnalogFailureWorkflowDetails
     */
    'generatedAarUrl'?: string;
}
/**
 * 
 * @export
 * @interface AnalogSuccessWorkflowDetails
 */
export interface AnalogSuccessWorkflowDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof AnalogSuccessWorkflowDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof AnalogSuccessWorkflowDetails
     */
    'physicalAddress': PhysicalAddress;
}
/**
 * 
 * @export
 * @interface AttachmentDetails
 */
export interface AttachmentDetails {
    /**
     * 
     * @type {string}
     * @memberof AttachmentDetails
     */
    'id'?: string;
    /**
     * Codici documentType: - Plico: Indica il plico cartaceo - AR: Indica la ricevuta di ritorno - Indagine: Indica la ricevuta dell\'analisi dell\'indagine - 23L: Indica la ricevuta 23L 
     * @type {string}
     * @memberof AttachmentDetails
     */
    'documentType'?: string;
    /**
     * 
     * @type {string}
     * @memberof AttachmentDetails
     */
    'url'?: string;
    /**
     * 
     * @type {string}
     * @memberof AttachmentDetails
     */
    'date'?: string;
}
/**
 * 
 * @export
 * @interface BaseAnalogDetails
 */
export interface BaseAnalogDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof BaseAnalogDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof BaseAnalogDetails
     */
    'physicalAddress': PhysicalAddress;
    /**
     * 
     * @type {ServiceLevel}
     * @memberof BaseAnalogDetails
     */
    'serviceLevel': ServiceLevel;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof BaseAnalogDetails
     */
    'sentAttemptMade': number;
    /**
     * Id relativo alla eventuale precedente richiesta di invio cartaceo
     * @type {string}
     * @memberof BaseAnalogDetails
     */
    'relatedRequestId'?: string;
}


/**
 * 
 * @export
 * @interface BaseRegisteredLetterDetails
 */
export interface BaseRegisteredLetterDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof BaseRegisteredLetterDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof BaseRegisteredLetterDetails
     */
    'physicalAddress': PhysicalAddress;
}
/**
 * Company Data (Dati Anagrafici PNF) object
 * @export
 * @interface CompanyData
 */
export interface CompanyData {
    /**
     * Company name
     * @type {string}
     * @memberof CompanyData
     */
    'name'?: string;
    /**
     * 
     * @type {TaxAddress}
     * @memberof CompanyData
     */
    'taxAddress'?: TaxAddress;
}
/**
 * 
 * @export
 * @interface CompletelyUnreachableCreationRequestDetails
 */
export interface CompletelyUnreachableCreationRequestDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof CompletelyUnreachableCreationRequestDetails
     */
    'recIndex': number;
    /**
     * Identificativo dell\'atto opponibile a terzi del quale è stata richiesta la creazione
     * @type {string}
     * @memberof CompletelyUnreachableCreationRequestDetails
     */
    'legalfactId'?: string;
    /**
     * 
     * @type {EndWorkflowStatus}
     * @memberof CompletelyUnreachableCreationRequestDetails
     */
    'endWorkflowStatus'?: EndWorkflowStatus;
    /**
     * Data chiusura workflow
     * @type {string}
     * @memberof CompletelyUnreachableCreationRequestDetails
     */
    'completionWorkflowDate'?: string;
}


/**
 * 
 * @export
 * @interface CompletelyUnreachableDetails
 */
export interface CompletelyUnreachableDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof CompletelyUnreachableDetails
     */
    'recIndex': number;
    /**
     * Data generazione atto opponibile a terzi allegato
     * @type {string}
     * @memberof CompletelyUnreachableDetails
     */
    'legalFactGenerationDate'?: string;
}
/**
 * Fase in cui è avvenuta la richiesta
 * @export
 * @enum {string}
 */

export const ContactPhase = {
    ChooseDelivery: 'CHOOSE_DELIVERY',
    SendAttempt: 'SEND_ATTEMPT'
} as const;

export type ContactPhase = typeof ContactPhase[keyof typeof ContactPhase];


/**
 * 
 * @export
 * @interface DelegateInfo
 */
export interface DelegateInfo {
    /**
     * 
     * @type {string}
     * @memberof DelegateInfo
     */
    'internalId'?: string;
    /**
     * 
     * @type {string}
     * @memberof DelegateInfo
     */
    'taxId'?: string;
    /**
     * 
     * @type {string}
     * @memberof DelegateInfo
     */
    'operatorUuid'?: string;
    /**
     * 
     * @type {string}
     * @memberof DelegateInfo
     */
    'mandateId'?: string;
    /**
     * 
     * @type {string}
     * @memberof DelegateInfo
     */
    'denomination'?: string;
    /**
     * 
     * @type {RecipientType}
     * @memberof DelegateInfo
     */
    'delegateType'?: RecipientType;
}


/**
 * Tipologia Domiciliazione
 * @export
 * @enum {string}
 */

export const DeliveryMode = {
    Digital: 'DIGITAL',
    Analog: 'ANALOG'
} as const;

export type DeliveryMode = typeof DeliveryMode[keyof typeof DeliveryMode];


/**
 * Indirizzo di invio della notifica
 * @export
 * @interface DigitalAddress
 */
export interface DigitalAddress {
    /**
     * tipo di indirizzo PEC, REM, SERCQ, SMS, EMAIL, APPIO ...
     * @type {string}
     * @memberof DigitalAddress
     */
    'type': string;
    /**
     * account@domain
     * @type {string}
     * @memberof DigitalAddress
     */
    'address': string;
}
/**
 * sorgente indirizzo di invio della notifica
 * @export
 * @enum {string}
 */

export const DigitalAddressSource = {
    Platform: 'PLATFORM',
    Special: 'SPECIAL',
    General: 'GENERAL'
} as const;

export type DigitalAddressSource = typeof DigitalAddressSource[keyof typeof DigitalAddressSource];


/**
 * 
 * @export
 * @interface DigitalDeliveryCreationRequestDetails
 */
export interface DigitalDeliveryCreationRequestDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof DigitalDeliveryCreationRequestDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof DigitalDeliveryCreationRequestDetails
     */
    'digitalAddress': DigitalAddress;
    /**
     * 
     * @type {EndWorkflowStatus}
     * @memberof DigitalDeliveryCreationRequestDetails
     */
    'endWorkflowStatus'?: EndWorkflowStatus;
    /**
     * Data chiusura workflow
     * @type {string}
     * @memberof DigitalDeliveryCreationRequestDetails
     */
    'completionWorkflowDate'?: string;
    /**
     * Identificativo dell\'atto opponibile a terzi del quale è stata richiesta la creazione
     * @type {string}
     * @memberof DigitalDeliveryCreationRequestDetails
     */
    'legalfactId'?: string;
}


/**
 * 
 * @export
 * @interface DigitalFailureWorkflowDetails
 */
export interface DigitalFailureWorkflowDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof DigitalFailureWorkflowDetails
     */
    'recIndex': number;
}
/**
 * 
 * @export
 * @interface DigitalSuccessWorkflowDetails
 */
export interface DigitalSuccessWorkflowDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof DigitalSuccessWorkflowDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof DigitalSuccessWorkflowDetails
     */
    'digitalAddress': DigitalAddress;
}
/**
 * Stato chiusura workflow
 * @export
 * @enum {string}
 */

export const EndWorkflowStatus = {
    Success: 'SUCCESS',
    Failure: 'FAILURE'
} as const;

export type EndWorkflowStatus = typeof EndWorkflowStatus[keyof typeof EndWorkflowStatus];


/**
 * Excise Section (Accise) object
 * @export
 * @interface ExciseSection
 */
export interface ExciseSection {
    /**
     * Excise Tax List
     * @type {Array<ExciseTax>}
     * @memberof ExciseSection
     */
    'records'?: Array<ExciseTax>;
    /**
     * identification code of the office
     * @type {string}
     * @memberof ExciseSection
     */
    'office'?: string;
    /**
     * identification code of the document
     * @type {string}
     * @memberof ExciseSection
     */
    'document'?: string;
}
/**
 * Excise Tax object
 * @export
 * @interface ExciseTax
 */
export interface ExciseTax {
    /**
     * institution of the tax
     * @type {string}
     * @memberof ExciseTax
     */
    'institution'?: string;
    /**
     * province of the tax
     * @type {string}
     * @memberof ExciseTax
     */
    'province'?: string;
    /**
     * identification code
     * @type {string}
     * @memberof ExciseTax
     */
    'id'?: string;
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof ExciseTax
     */
    'taxType'?: string;
    /**
     * identification code of the ente
     * @type {string}
     * @memberof ExciseTax
     */
    'installment'?: string;
    /**
     * month reference
     * @type {string}
     * @memberof ExciseTax
     */
    'month'?: string;
    /**
     * reference year
     * @type {string}
     * @memberof ExciseTax
     */
    'year'?: string;
    /**
     * debit amount
     * @type {string}
     * @memberof ExciseTax
     */
    'debit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof ExciseTax
     */
    'applyCost': boolean;
}
/**
 * 
 * @export
 * @interface F24Elid
 */
export interface F24Elid {
    /**
     * 
     * @type {TaxPayerElide}
     * @memberof F24Elid
     */
    'taxPayer'?: TaxPayerElide;
    /**
     * 
     * @type {TreasuryAndOtherSection}
     * @memberof F24Elid
     */
    'treasury'?: TreasuryAndOtherSection;
}
/**
 * F24 Excise (Accise) object
 * @export
 * @interface F24Excise
 */
export interface F24Excise {
    /**
     * 
     * @type {TaxPayerExcise}
     * @memberof F24Excise
     */
    'taxPayer'?: TaxPayerExcise;
    /**
     * 
     * @type {TreasurySection}
     * @memberof F24Excise
     */
    'treasury'?: TreasurySection;
    /**
     * 
     * @type {InpsSection}
     * @memberof F24Excise
     */
    'inps'?: InpsSection;
    /**
     * 
     * @type {RegionSection}
     * @memberof F24Excise
     */
    'region'?: RegionSection;
    /**
     * 
     * @type {LocalTaxSection}
     * @memberof F24Excise
     */
    'localTax'?: LocalTaxSection;
    /**
     * 
     * @type {ExciseSection}
     * @memberof F24Excise
     */
    'excise'?: ExciseSection;
}
/**
 * è richiesto uno e uno solo tra le propeties f24Standard, f24Simplified, f24Excise, f24Elid
 * @export
 * @interface F24Metadata
 */
export interface F24Metadata {
    /**
     * 
     * @type {F24Standard}
     * @memberof F24Metadata
     */
    'f24Standard'?: F24Standard | null;
    /**
     * 
     * @type {F24Simplified}
     * @memberof F24Metadata
     */
    'f24Simplified'?: F24Simplified | null;
    /**
     * 
     * @type {F24Excise}
     * @memberof F24Metadata
     */
    'f24Excise'?: F24Excise | null;
    /**
     * 
     * @type {F24Elid}
     * @memberof F24Metadata
     */
    'f24Elid'?: F24Elid | null;
}
/**
 * Informazioni utili per effettuare il pagamento di una notifica, sono associate al destinatario perché le spese di notifica possono differire a seconda del canale di notifica utilizzato. <br/>   - _title_: titolo del documento pdf da mostrare all\'utente .<br/>   - _applyCost_: flag per indicare se il modello F24 deve contenere i costi di notifica.<br/>   - _metadataAttachment_: riferimento ai metadati per la generazione del modello F24.<br/>
 * @export
 * @interface F24Payment
 */
export interface F24Payment {
    /**
     * Titolo del documento pdf da mostrare all\'utente
     * @type {string}
     * @memberof F24Payment
     */
    'title': string;
    /**
     * Flag per indicare se il modello F24 deve contere i costi di notifica
     * @type {boolean}
     * @memberof F24Payment
     */
    'applyCost': boolean;
    /**
     * 
     * @type {NotificationMetadataAttachment}
     * @memberof F24Payment
     */
    'metadataAttachment': NotificationMetadataAttachment;
}
/**
 * 
 * @export
 * @interface F24Simplified
 */
export interface F24Simplified {
    /**
     * 
     * @type {TaxPayerSimplified}
     * @memberof F24Simplified
     */
    'taxPayer'?: TaxPayerSimplified;
    /**
     * 
     * @type {SimplifiedPaymentSection}
     * @memberof F24Simplified
     */
    'payments'?: SimplifiedPaymentSection;
}
/**
 * 
 * @export
 * @interface F24Standard
 */
export interface F24Standard {
    /**
     * 
     * @type {TaxPayerStandard}
     * @memberof F24Standard
     */
    'taxPayer'?: TaxPayerStandard;
    /**
     * 
     * @type {TreasurySection}
     * @memberof F24Standard
     */
    'treasury'?: TreasurySection;
    /**
     * 
     * @type {InpsSection}
     * @memberof F24Standard
     */
    'inps'?: InpsSection;
    /**
     * 
     * @type {RegionSection}
     * @memberof F24Standard
     */
    'region'?: RegionSection;
    /**
     * 
     * @type {LocalTaxSection}
     * @memberof F24Standard
     */
    'localTax'?: LocalTaxSection;
    /**
     * 
     * @type {SocialSecuritySection}
     * @memberof F24Standard
     */
    'socialSecurity'?: SocialSecuritySection;
}
/**
 * Le informazioni riguardanti una notifica (richiesta di notifica accettata) e il  processo di inoltro della notifica verso il cittadino.
 * @export
 * @interface FullSentNotificationV23
 */
export interface FullSentNotificationV23 {
    /**
     * Identificativo utilizzabile dal chiamante per disambiguare differenti  \"richieste di notificazione\" effettuate con lo stesso numero di protocollo  (campo _paProtocolNumber_). Questo può essere necessario in caso di  \"richiesta di notifica\" rifiutata per errori nei codici di verifica degli allegati.
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'idempotenceToken'?: string;
    /**
     * Numero di protocollo che la PA mittente assegna alla notifica stessa
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'paProtocolNumber': string;
    /**
     * titolo della notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'subject': string;
    /**
     * descrizione sintetica della notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'abstract'?: string;
    /**
     * Informazioni sui destinatari
     * @type {Array<NotificationRecipientV23>}
     * @memberof FullSentNotificationV23
     */
    'recipients': Array<NotificationRecipientV23>;
    /**
     * Documenti notificati
     * @type {Array<NotificationDocument>}
     * @memberof FullSentNotificationV23
     */
    'documents': Array<NotificationDocument>;
    /**
     * 
     * @type {NotificationFeePolicy}
     * @memberof FullSentNotificationV23
     */
    'notificationFeePolicy': NotificationFeePolicy;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'cancelledIun'?: string;
    /**
     * Tipologia comunicazione fisica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'physicalCommunicationType': FullSentNotificationV23PhysicalCommunicationTypeEnum;
    /**
     * Denominazione ente o persona fisica / ragione sociale. La codifica prevede i caratteri ISO LATIN 1, senza | e senza i caratteri di controllo, ovvero la seguente regexp: ^[ -{}~\\u00A0-ÿ]*$
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'senderDenomination': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'senderTaxId': string;
    /**
     * Gruppo di utenti dell\'ente mittente che può visualizzare la notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'group'?: string;
    /**
     * Importo della notifica in eurocent
     * @type {number}
     * @memberof FullSentNotificationV23
     */
    'amount'?: number;
    /**
     * Data di scadenza del pagamento nel formato YYYY-MM-DD riferito all\'Italia
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'paymentExpirationDate'?: string;
    /**
     * Codice tassonomico della notifica basato sulla definizione presente nell\'allegato 2 capitolo C del bando [__AVVISO PUBBLICO MISURA 1.4.5 PIATTAFORMA NOTIFICHE DIGITALI__](https://pnrrcomuni.fondazioneifel.it/bandi_public/Bando/325)
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'taxonomyCode': string;
    /**
     * Costo espresso in eurocent sostenuto dal mittente, per l\'elaborazione degli atti, provvedimenti, avvisi e comunicazioni oggetto di notifica, per il relativo deposito sulla piattaforma e per la gestione degli  esiti della notifica (Decreto 30 maggio 2022 - Art. 3, comma 1, lettera a). <br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 100.<br/> Esempio paFee ad 1€ -> 100 <br/>
     * @type {number}
     * @memberof FullSentNotificationV23
     */
    'paFee'?: number;
    /**
     * IVA espressa in percentuale sui costi degli avvisi in formato cartaceo.<br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE. <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 22. <br/> Esempio vat al 22% -> 22 <br/>
     * @type {number}
     * @memberof FullSentNotificationV23
     */
    'vat'?: number;
    /**
     * Modalitá di integrazione pagoPA per l\'attualizazione del costo della notifica. <br/> - _NONE_: nessuna attualizzazione. <br/> - _SYNC_: modalitá sincrona. <br/> - _ASYNC_: modalitá asincrona. <br/>
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'pagoPaIntMode'?: FullSentNotificationV23PagoPaIntModeEnum;
    /**
     * Identificativo (non IPA) della PA mittente che ha eseguito l\'onboarding su SelfCare.
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'senderPaId'?: string;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'iun': string;
    /**
     * Momento di ricezione della notifica da parte di PN
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'sentAt': string;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'cancelledByIun'?: string;
    /**
     * Indica se i documenti notificati sono ancora disponibili.
     * @type {boolean}
     * @memberof FullSentNotificationV23
     */
    'documentsAvailable'?: boolean;
    /**
     * Indica la versione della notifica
     * @type {string}
     * @memberof FullSentNotificationV23
     */
    'version'?: string;
    /**
     * 
     * @type {NotificationStatus}
     * @memberof FullSentNotificationV23
     */
    'notificationStatus': NotificationStatus;
    /**
     * elenco degli avanzamenti effettuati dal processo di notifica
     * @type {Array<NotificationStatusHistoryElement>}
     * @memberof FullSentNotificationV23
     */
    'notificationStatusHistory': Array<NotificationStatusHistoryElement>;
    /**
     * elenco dettagliato di tutto ciò che è accaduto durrante il processo di notifica
     * @type {Array<TimelineElementV23>}
     * @memberof FullSentNotificationV23
     */
    'timeline': Array<TimelineElementV23>;
}

export const FullSentNotificationV23PhysicalCommunicationTypeEnum = {
    ArRegisteredLetter: 'AR_REGISTERED_LETTER',
    RegisteredLetter890: 'REGISTERED_LETTER_890'
} as const;

export type FullSentNotificationV23PhysicalCommunicationTypeEnum = typeof FullSentNotificationV23PhysicalCommunicationTypeEnum[keyof typeof FullSentNotificationV23PhysicalCommunicationTypeEnum];
export const FullSentNotificationV23PagoPaIntModeEnum = {
    None: 'NONE',
    Sync: 'SYNC',
    Async: 'ASYNC'
} as const;

export type FullSentNotificationV23PagoPaIntModeEnum = typeof FullSentNotificationV23PagoPaIntModeEnum[keyof typeof FullSentNotificationV23PagoPaIntModeEnum];

/**
 * 
 * @export
 * @interface GetAddressInfoDetails
 */
export interface GetAddressInfoDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof GetAddressInfoDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof GetAddressInfoDetails
     */
    'digitalAddressSource': DigitalAddressSource;
    /**
     * Disponibilità indirizzo
     * @type {boolean}
     * @memberof GetAddressInfoDetails
     */
    'isAvailable': boolean;
    /**
     * Data tentativo
     * @type {string}
     * @memberof GetAddressInfoDetails
     */
    'attemptDate': string;
}


/**
 * INAIL Record object
 * @export
 * @interface InailRecord
 */
export interface InailRecord {
    /**
     * identification code of the office
     * @type {string}
     * @memberof InailRecord
     */
    'office'?: string;
    /**
     * identification code of the company
     * @type {string}
     * @memberof InailRecord
     */
    'company'?: string;
    /**
     * control identification code
     * @type {string}
     * @memberof InailRecord
     */
    'control'?: string;
    /**
     * reference number
     * @type {string}
     * @memberof InailRecord
     */
    'refNumber'?: string;
    /**
     * reason of the record
     * @type {string}
     * @memberof InailRecord
     */
    'reason'?: string;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof InailRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof InailRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof InailRecord
     */
    'applyCost': boolean;
}
/**
 * 
 * @export
 * @interface IncludeNotificationCost
 */
export interface IncludeNotificationCost {
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof IncludeNotificationCost
     */
    'applyCost': boolean;
}
/**
 * INPS Record object
 * @export
 * @interface InpsRecord
 */
export interface InpsRecord {
    /**
     * identification code of the office
     * @type {string}
     * @memberof InpsRecord
     */
    'office'?: string;
    /**
     * contribution reason for the record
     * @type {string}
     * @memberof InpsRecord
     */
    'reason'?: string;
    /**
     * INPS identification code
     * @type {string}
     * @memberof InpsRecord
     */
    'inps'?: string;
    /**
     * 
     * @type {Period}
     * @memberof InpsRecord
     */
    'period'?: Period;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof InpsRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof InpsRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof InpsRecord
     */
    'applyCost': boolean;
}
/**
 * INPS Section (Sezione INPS) object
 * @export
 * @interface InpsSection
 */
export interface InpsSection {
    /**
     * INPS Record List
     * @type {Array<InpsRecord>}
     * @memberof InpsSection
     */
    'records'?: Array<InpsRecord>;
}
/**
 * Risultato invio messaggio su IO
 * @export
 * @enum {string}
 */

export const IoSendMessageResult = {
    NotSentOptinAlreadySent: 'NOT_SENT_OPTIN_ALREADY_SENT',
    SentCourtesy: 'SENT_COURTESY',
    SentOptin: 'SENT_OPTIN'
} as const;

export type IoSendMessageResult = typeof IoSendMessageResult[keyof typeof IoSendMessageResult];


/**
 * Tipi di atti opponibili a terzi che Piattaforma Notifiche mette a disposizione dei suoi utenti.   - _SENDER_ACK_: atto di \"presa in carico\" di una notifica   - _DIGITAL_DELIVERY_: ...
 * @export
 * @enum {string}
 */

export const LegalFactCategory = {
    SenderAck: 'SENDER_ACK',
    DigitalDelivery: 'DIGITAL_DELIVERY',
    AnalogDelivery: 'ANALOG_DELIVERY',
    RecipientAccess: 'RECIPIENT_ACCESS',
    PecReceipt: 'PEC_RECEIPT',
    AnalogFailureDelivery: 'ANALOG_FAILURE_DELIVERY'
} as const;

export type LegalFactCategory = typeof LegalFactCategory[keyof typeof LegalFactCategory];


/**
 * I due campi più importanti sono __url__ e __retryAfter__. <br/>   - __url__ è presente se il file è pronto per essere scaricato ed indica l\'url a cui fare GET.   - __retryAfter__ indica che il file non è stato archiviato e bisognerà aspettare un numero di     secondi non inferiore a quanto indicato dal campo _retryAfter_. <br/>
 * @export
 * @interface LegalFactDownloadMetadataResponse
 */
export interface LegalFactDownloadMetadataResponse {
    /**
     * 
     * @type {string}
     * @memberof LegalFactDownloadMetadataResponse
     */
    'filename': string;
    /**
     * dimensione, in byte, del contenuto.
     * @type {number}
     * @memberof LegalFactDownloadMetadataResponse
     */
    'contentLength': number;
    /**
     * URL preautorizzato a cui effettuare una richiesta GET per ottenere il  contenuto del documento. Presente solo se il documento è pronto per il download.
     * @type {string}
     * @memberof LegalFactDownloadMetadataResponse
     */
    'url'?: string;
    /**
     * Stima del numero di secondi da aspettare prima che il contenuto del  documento sia scaricabile.
     * @type {number}
     * @memberof LegalFactDownloadMetadataResponse
     */
    'retryAfter'?: number;
}
/**
 * Chiavi dei documenti generati durante il processo di consegna cartacea
 * @export
 * @interface LegalFactsId
 */
export interface LegalFactsId {
    /**
     * Chiave dell\'atto opponibile a terzi generato durante il processo di consegna
     * @type {string}
     * @memberof LegalFactsId
     */
    'key': string;
    /**
     * 
     * @type {LegalFactCategory}
     * @memberof LegalFactsId
     */
    'category': LegalFactCategory;
}


/**
 * LocalTax Record object
 * @export
 * @interface LocalTaxRecord
 */
export interface LocalTaxRecord {
    /**
     * identification code of the municipality
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'municipality': string;
    /**
     * to check if it is a reconsideration act
     * @type {boolean}
     * @memberof LocalTaxRecord
     */
    'reconsideration'?: boolean;
    /**
     * to check if there are some changes in properties list
     * @type {boolean}
     * @memberof LocalTaxRecord
     */
    'propertiesChanges'?: boolean;
    /**
     * to check if it is a payment in advance
     * @type {boolean}
     * @memberof LocalTaxRecord
     */
    'advancePayment'?: boolean;
    /**
     * to check if it a full payment
     * @type {boolean}
     * @memberof LocalTaxRecord
     */
    'fullPayment'?: boolean;
    /**
     * number of properties
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'numberOfProperties'?: string;
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'taxType': string;
    /**
     * identification code of the ente
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'installment'?: string;
    /**
     * reference year
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'year'?: string;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof LocalTaxRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof LocalTaxRecord
     */
    'applyCost': boolean;
}
/**
 * LocalTax Section (Sezione LocalTax e Altri Tributi Locali) object
 * @export
 * @interface LocalTaxSection
 */
export interface LocalTaxSection {
    /**
     * identification code of the operation
     * @type {string}
     * @memberof LocalTaxSection
     */
    'operationId'?: string;
    /**
     * 
     * @type {Array<LocalTaxRecord>}
     * @memberof LocalTaxSection
     */
    'records'?: Array<LocalTaxRecord>;
    /**
     * if there are any deduction
     * @type {string}
     * @memberof LocalTaxSection
     */
    'deduction'?: string;
}
/**
 * 
 * @export
 * @interface NewNotificationRequestStatusResponseV23
 */
export interface NewNotificationRequestStatusResponseV23 {
    /**
     * Identificativo utilizzabile dal chiamante per disambiguare differenti  \"richieste di notificazione\" effettuate con lo stesso numero di protocollo  (campo _paProtocolNumber_). Questo può essere necessario in caso di  \"richiesta di notifica\" rifiutata per errori nei codici di verifica degli allegati.
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'idempotenceToken'?: string;
    /**
     * Numero di protocollo che la PA mittente assegna alla notifica stessa
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'paProtocolNumber': string;
    /**
     * titolo della notifica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'subject': string;
    /**
     * descrizione sintetica della notifica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'abstract'?: string;
    /**
     * Informazioni sui destinatari
     * @type {Array<NotificationRecipientV23>}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'recipients': Array<NotificationRecipientV23>;
    /**
     * Documenti notificati
     * @type {Array<NotificationDocument>}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'documents': Array<NotificationDocument>;
    /**
     * 
     * @type {NotificationFeePolicy}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'notificationFeePolicy': NotificationFeePolicy;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'cancelledIun'?: string;
    /**
     * Tipologia comunicazione fisica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'physicalCommunicationType': NewNotificationRequestStatusResponseV23PhysicalCommunicationTypeEnum;
    /**
     * Denominazione ente o persona fisica / ragione sociale. La codifica prevede i caratteri ISO LATIN 1, senza | e senza i caratteri di controllo, ovvero la seguente regexp: ^[ -{}~\\u00A0-ÿ]*$
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'senderDenomination': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'senderTaxId': string;
    /**
     * Gruppo di utenti dell\'ente mittente che può visualizzare la notifica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'group'?: string;
    /**
     * Importo della notifica in eurocent
     * @type {number}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'amount'?: number;
    /**
     * Data di scadenza del pagamento nel formato YYYY-MM-DD riferito all\'Italia
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'paymentExpirationDate'?: string;
    /**
     * Codice tassonomico della notifica basato sulla definizione presente nell\'allegato 2 capitolo C del bando [__AVVISO PUBBLICO MISURA 1.4.5 PIATTAFORMA NOTIFICHE DIGITALI__](https://pnrrcomuni.fondazioneifel.it/bandi_public/Bando/325)
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'taxonomyCode': string;
    /**
     * Costo espresso in eurocent sostenuto dal mittente, per l\'elaborazione degli atti, provvedimenti, avvisi e comunicazioni oggetto di notifica, per il relativo deposito sulla piattaforma e per la gestione degli  esiti della notifica (Decreto 30 maggio 2022 - Art. 3, comma 1, lettera a). <br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 100.<br/> Esempio paFee ad 1€ -> 100 <br/>
     * @type {number}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'paFee'?: number;
    /**
     * IVA espressa in percentuale sui costi degli avvisi in formato cartaceo.<br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE. <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 22. <br/> Esempio vat al 22% -> 22 <br/>
     * @type {number}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'vat'?: number;
    /**
     * Modalitá di integrazione pagoPA per l\'attualizazione del costo della notifica. <br/> - _NONE_: nessuna attualizzazione. <br/> - _SYNC_: modalitá sincrona. <br/> - _ASYNC_: modalitá asincrona. <br/>
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'pagoPaIntMode'?: NewNotificationRequestStatusResponseV23PagoPaIntModeEnum;
    /**
     * identificativo univoco di una richiesta di invio notifica, non è lo IUN
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'notificationRequestId': string;
    /**
     * - __WAITING__: in attesa di essere valutata - __ACCEPTED__: richiesta di notifica accettata, lo IUN è valorizzato - __REFUSED__: richiesta di notifica rifiutata, è valorizzato il campo _errors_
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'notificationRequestStatus': string;
    /**
     * Numero di secondi da attendere prima di effettuare una nuova richiesta per  la stessa entità; valorizzato quando lo status è __WAITING__.
     * @type {number}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'retryAfter'?: number;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'iun'?: string;
    /**
     * Elenco degli errori che hanno causato il rifiuto della richiesta di notifica
     * @type {Array<ProblemError>}
     * @memberof NewNotificationRequestStatusResponseV23
     */
    'errors'?: Array<ProblemError>;
}

export const NewNotificationRequestStatusResponseV23PhysicalCommunicationTypeEnum = {
    ArRegisteredLetter: 'AR_REGISTERED_LETTER',
    RegisteredLetter890: 'REGISTERED_LETTER_890'
} as const;

export type NewNotificationRequestStatusResponseV23PhysicalCommunicationTypeEnum = typeof NewNotificationRequestStatusResponseV23PhysicalCommunicationTypeEnum[keyof typeof NewNotificationRequestStatusResponseV23PhysicalCommunicationTypeEnum];
export const NewNotificationRequestStatusResponseV23PagoPaIntModeEnum = {
    None: 'NONE',
    Sync: 'SYNC',
    Async: 'ASYNC'
} as const;

export type NewNotificationRequestStatusResponseV23PagoPaIntModeEnum = typeof NewNotificationRequestStatusResponseV23PagoPaIntModeEnum[keyof typeof NewNotificationRequestStatusResponseV23PagoPaIntModeEnum];

/**
 * I campi utilizzati per la creazione di una nuova Notifica.
 * @export
 * @interface NewNotificationRequestV23
 */
export interface NewNotificationRequestV23 {
    /**
     * Identificativo utilizzabile dal chiamante per disambiguare differenti  \"richieste di notificazione\" effettuate con lo stesso numero di protocollo  (campo _paProtocolNumber_). Questo può essere necessario in caso di  \"richiesta di notifica\" rifiutata per errori nei codici di verifica degli allegati.
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'idempotenceToken'?: string;
    /**
     * Numero di protocollo che la PA mittente assegna alla notifica stessa
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'paProtocolNumber': string;
    /**
     * titolo della notifica
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'subject': string;
    /**
     * descrizione sintetica della notifica
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'abstract'?: string;
    /**
     * Informazioni sui destinatari
     * @type {Array<NotificationRecipientV23>}
     * @memberof NewNotificationRequestV23
     */
    'recipients': Array<NotificationRecipientV23>;
    /**
     * Documenti notificati
     * @type {Array<NotificationDocument>}
     * @memberof NewNotificationRequestV23
     */
    'documents': Array<NotificationDocument>;
    /**
     * 
     * @type {NotificationFeePolicy}
     * @memberof NewNotificationRequestV23
     */
    'notificationFeePolicy': NotificationFeePolicy;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'cancelledIun'?: string;
    /**
     * Tipologia comunicazione fisica
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'physicalCommunicationType': NewNotificationRequestV23PhysicalCommunicationTypeEnum;
    /**
     * Denominazione ente o persona fisica / ragione sociale. La codifica prevede i caratteri ISO LATIN 1, senza | e senza i caratteri di controllo, ovvero la seguente regexp: ^[ -{}~\\u00A0-ÿ]*$
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'senderDenomination': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'senderTaxId': string;
    /**
     * Gruppo di utenti dell\'ente mittente che può visualizzare la notifica
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'group'?: string;
    /**
     * Importo della notifica in eurocent
     * @type {number}
     * @memberof NewNotificationRequestV23
     */
    'amount'?: number;
    /**
     * Data di scadenza del pagamento nel formato YYYY-MM-DD riferito all\'Italia
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'paymentExpirationDate'?: string;
    /**
     * Codice tassonomico della notifica basato sulla definizione presente nell\'allegato 2 capitolo C del bando [__AVVISO PUBBLICO MISURA 1.4.5 PIATTAFORMA NOTIFICHE DIGITALI__](https://pnrrcomuni.fondazioneifel.it/bandi_public/Bando/325)
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'taxonomyCode': string;
    /**
     * Costo espresso in eurocent sostenuto dal mittente, per l\'elaborazione degli atti, provvedimenti, avvisi e comunicazioni oggetto di notifica, per il relativo deposito sulla piattaforma e per la gestione degli  esiti della notifica (Decreto 30 maggio 2022 - Art. 3, comma 1, lettera a). <br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 100.<br/> Esempio paFee ad 1€ -> 100 <br/>
     * @type {number}
     * @memberof NewNotificationRequestV23
     */
    'paFee'?: number;
    /**
     * IVA espressa in percentuale sui costi degli avvisi in formato cartaceo.<br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE. <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 22. <br/> Esempio vat al 22% -> 22 <br/>
     * @type {number}
     * @memberof NewNotificationRequestV23
     */
    'vat'?: number;
    /**
     * Modalitá di integrazione pagoPA per l\'attualizazione del costo della notifica. <br/> - _NONE_: nessuna attualizzazione. <br/> - _SYNC_: modalitá sincrona. <br/> - _ASYNC_: modalitá asincrona. <br/>
     * @type {string}
     * @memberof NewNotificationRequestV23
     */
    'pagoPaIntMode'?: NewNotificationRequestV23PagoPaIntModeEnum;
}

export const NewNotificationRequestV23PhysicalCommunicationTypeEnum = {
    ArRegisteredLetter: 'AR_REGISTERED_LETTER',
    RegisteredLetter890: 'REGISTERED_LETTER_890'
} as const;

export type NewNotificationRequestV23PhysicalCommunicationTypeEnum = typeof NewNotificationRequestV23PhysicalCommunicationTypeEnum[keyof typeof NewNotificationRequestV23PhysicalCommunicationTypeEnum];
export const NewNotificationRequestV23PagoPaIntModeEnum = {
    None: 'NONE',
    Sync: 'SYNC',
    Async: 'ASYNC'
} as const;

export type NewNotificationRequestV23PagoPaIntModeEnum = typeof NewNotificationRequestV23PagoPaIntModeEnum[keyof typeof NewNotificationRequestV23PagoPaIntModeEnum];

/**
 * Contiene le informazioni per identificare una richiesta di invio notifica che non è ancora stata accettata da Piattaforma notifiche.
 * @export
 * @interface NewNotificationResponse
 */
export interface NewNotificationResponse {
    /**
     * identificativo univoco di una richiesta di invio notifica, non è lo IUN
     * @type {string}
     * @memberof NewNotificationResponse
     */
    'notificationRequestId': string;
    /**
     * Identificativo inviato dalla pubblica amministrazione
     * @type {string}
     * @memberof NewNotificationResponse
     */
    'paProtocolNumber': string;
    /**
     * Ripetizione del token usato per disambiguare \"richieste di notificazione\"  effettuate con lo stesso numero di protocollo (campo _paProtocolNumber_).
     * @type {string}
     * @memberof NewNotificationResponse
     */
    'idempotenceToken'?: string;
}
/**
 * 
 * @export
 * @interface NormalizedAddressDetails
 */
export interface NormalizedAddressDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NormalizedAddressDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof NormalizedAddressDetails
     */
    'oldAddress': PhysicalAddress;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof NormalizedAddressDetails
     */
    'normalizedAddress': PhysicalAddress;
}
/**
 * 
 * @export
 * @interface NotHandledDetails
 */
export interface NotHandledDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NotHandledDetails
     */
    'recIndex': number;
    /**
     * Codice motivazione casistica non gestita
     * @type {string}
     * @memberof NotHandledDetails
     */
    'reasonCode': string;
    /**
     * Motivazione casistica non gestita
     * @type {string}
     * @memberof NotHandledDetails
     */
    'reason': string;
}
/**
 * Un allegato della notifica.
 * @export
 * @interface NotificationAttachment
 */
export interface NotificationAttachment {
    /**
     * 
     * @type {NotificationAttachmentDigests}
     * @memberof NotificationAttachment
     */
    'digests': NotificationAttachmentDigests;
    /**
     * tipo di contenuto dell\'allegato, supportato application/pdf
     * @type {string}
     * @memberof NotificationAttachment
     */
    'contentType': string;
    /**
     * 
     * @type {NotificationAttachmentBodyRef}
     * @memberof NotificationAttachment
     */
    'ref': NotificationAttachmentBodyRef;
}
/**
 * Riferimento all\'allegato precaricato
 * @export
 * @interface NotificationAttachmentBodyRef
 */
export interface NotificationAttachmentBodyRef {
    /**
     * Chiave in cui è stato salvato l\'allegato
     * @type {string}
     * @memberof NotificationAttachmentBodyRef
     */
    'key': string;
    /**
     * Token per recuperare l\'esatta istanza dell\'allegato, che dovrà coincidere con l\'__x-amz-version-id__ ottenuto nell\'header della response in fase di upload del documento ad esso associato.
     * @type {string}
     * @memberof NotificationAttachmentBodyRef
     */
    'versionToken': string;
}
/**
 * Codici per la verifica del corretto caricamento di un allegato
 * @export
 * @interface NotificationAttachmentDigests
 */
export interface NotificationAttachmentDigests {
    /**
     * Digest \"sha256\" della codifica binaria dell\'allegato in base64
     * @type {string}
     * @memberof NotificationAttachmentDigests
     */
    'sha256': string;
}
/**
 * I due campi più importanti sono __url__ e __retryAfter__. <br/>   - __url__ è presente se il file è pronto per essere scaricato ed indica l\'url a cui fare GET.   - __retryAfter__ indica che il file è stato archiviato e bisognerà aspettare un numero di     secondi non inferiore a quanto indicato dal campo _retryAfter_. <br/>
 * @export
 * @interface NotificationAttachmentDownloadMetadataResponse
 */
export interface NotificationAttachmentDownloadMetadataResponse {
    /**
     * 
     * @type {string}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'filename': string;
    /**
     * 
     * @type {string}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'contentType': string;
    /**
     * dimensione, in byte, del contenuto.
     * @type {number}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'contentLength': number;
    /**
     * SHA256 del contenuto del file.
     * @type {string}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'sha256': string;
    /**
     * URL preautorizzato a cui effettuare una richiesta GET per ottenere il  contenuto del documento. Presente solo se il documento è pronto per il download.
     * @type {string}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'url'?: string;
    /**
     * Stima del numero di secondi da aspettare prima che il contenuto del  documento sia disponibile per il download.
     * @type {number}
     * @memberof NotificationAttachmentDownloadMetadataResponse
     */
    'retryAfter'?: number;
}
/**
 * 
 * @export
 * @interface NotificationCancellationRequestDetails
 */
export interface NotificationCancellationRequestDetails {
    /**
     * Id della richiesta
     * @type {string}
     * @memberof NotificationCancellationRequestDetails
     */
    'cancellationRequestId': string;
}
/**
 * 
 * @export
 * @interface NotificationCancelledDetails
 */
export interface NotificationCancelledDetails {
    /**
     * costo notifica in euro cents, vale 100 * numero di recipient not refined
     * @type {number}
     * @memberof NotificationCancelledDetails
     */
    'notificationCost': number;
    /**
     * 
     * @type {Array<number>}
     * @memberof NotificationCancelledDetails
     */
    'notRefinedRecipientIndexes': Array<number>;
}
/**
 * Indirizzo di invio della notifica
 * @export
 * @interface NotificationDigitalAddress
 */
export interface NotificationDigitalAddress {
    /**
     * tipo di indirizzo PEC, REM, SERCQ, ...
     * @type {string}
     * @memberof NotificationDigitalAddress
     */
    'type': NotificationDigitalAddressTypeEnum;
    /**
     * Indirizzo PEC o REM che il mittente della notifica intende utilizzare per  raggiungere il destinatario.
     * @type {string}
     * @memberof NotificationDigitalAddress
     */
    'address': string;
}

export const NotificationDigitalAddressTypeEnum = {
    Pec: 'PEC'
} as const;

export type NotificationDigitalAddressTypeEnum = typeof NotificationDigitalAddressTypeEnum[keyof typeof NotificationDigitalAddressTypeEnum];

/**
 * Un documento da notificare
 * @export
 * @interface NotificationDocument
 */
export interface NotificationDocument {
    /**
     * 
     * @type {NotificationAttachmentDigests}
     * @memberof NotificationDocument
     */
    'digests': NotificationAttachmentDigests;
    /**
     * tipo di contenuto dell\'allegato, supportato application/pdf
     * @type {string}
     * @memberof NotificationDocument
     */
    'contentType': string;
    /**
     * 
     * @type {NotificationAttachmentBodyRef}
     * @memberof NotificationDocument
     */
    'ref': NotificationAttachmentBodyRef;
    /**
     * Titolo del documento allegato. Stringa alfanumerica con caratteri utilizzabili in un nome file.
     * @type {string}
     * @memberof NotificationDocument
     */
    'title'?: string;
    /**
     * Indice del documento partendo da 0.
     * @type {string}
     * @memberof NotificationDocument
     */
    'docIdx'?: string;
}
/**
 * Politica di addebitamento dei costi di notifica. <br/> - _FLAT_RATE_: costo forfettario fisso. In questa modalità SEND non gestisce  il costo della notifica per il destinatario.<br/> - _DELIVERY_MODE_: costo calcolato in base all\'effettivo percorso di notifica. <br/>
 * @export
 * @enum {string}
 */

export const NotificationFeePolicy = {
    FlatRate: 'FLAT_RATE',
    DeliveryMode: 'DELIVERY_MODE'
} as const;

export type NotificationFeePolicy = typeof NotificationFeePolicy[keyof typeof NotificationFeePolicy];


/**
 * Un metadato allegato della notifica.
 * @export
 * @interface NotificationMetadataAttachment
 */
export interface NotificationMetadataAttachment {
    /**
     * 
     * @type {NotificationAttachmentDigests}
     * @memberof NotificationMetadataAttachment
     */
    'digests': NotificationAttachmentDigests;
    /**
     * tipo di contenuto dell\'allegato, supportato application/json
     * @type {string}
     * @memberof NotificationMetadataAttachment
     */
    'contentType': string;
    /**
     * 
     * @type {NotificationAttachmentBodyRef}
     * @memberof NotificationMetadataAttachment
     */
    'ref': NotificationAttachmentBodyRef;
}
/**
 * 
 * @export
 * @interface NotificationPaidDetailsV23
 */
export interface NotificationPaidDetailsV23 {
    /**
     * Index destinatario che ha effettuato il pagamento della notifica
     * @type {number}
     * @memberof NotificationPaidDetailsV23
     */
    'recIndex': number;
    /**
     * 
     * @type {RecipientType}
     * @memberof NotificationPaidDetailsV23
     */
    'recipientType': RecipientType;
    /**
     * Importo di pagamento in eurocent
     * @type {number}
     * @memberof NotificationPaidDetailsV23
     */
    'amount'?: number;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof NotificationPaidDetailsV23
     */
    'creditorTaxId'?: string;
    /**
     * Payment notice number  numero avviso
     * @type {string}
     * @memberof NotificationPaidDetailsV23
     */
    'noticeCode'?: string;
    /**
     * un UUID che identifica un pagamento f24
     * @type {string}
     * @memberof NotificationPaidDetailsV23
     */
    'idF24'?: string;
    /**
     * Canale sorgente della richiesta di pagamento
     * @type {string}
     * @memberof NotificationPaidDetailsV23
     */
    'paymentSourceChannel': string;
    /**
     * Indica se la data di pagamento é certa
     * @type {boolean}
     * @memberof NotificationPaidDetailsV23
     * @deprecated
     */
    'uncertainPaymentDate'?: boolean;
    /**
     * Data evento pagamento
     * @type {string}
     * @memberof NotificationPaidDetailsV23
     */
    'eventTimestamp'?: string;
}


/**
 * Un modulo di pagamento allegato alla notifica
 * @export
 * @interface NotificationPaymentAttachment
 */
export interface NotificationPaymentAttachment {
    /**
     * 
     * @type {NotificationAttachmentDigests}
     * @memberof NotificationPaymentAttachment
     */
    'digests': NotificationAttachmentDigests;
    /**
     * tipo di contenuto dell\'allegato, supportato application/pdf
     * @type {string}
     * @memberof NotificationPaymentAttachment
     */
    'contentType': string;
    /**
     * 
     * @type {NotificationAttachmentBodyRef}
     * @memberof NotificationPaymentAttachment
     */
    'ref': NotificationAttachmentBodyRef;
}
/**
 * 
 * @export
 * @interface NotificationPaymentItem
 */
export interface NotificationPaymentItem {
    /**
     * 
     * @type {PagoPaPayment}
     * @memberof NotificationPaymentItem
     */
    'pagoPa'?: PagoPaPayment;
    /**
     * 
     * @type {F24Payment}
     * @memberof NotificationPaymentItem
     */
    'f24'?: F24Payment;
}
/**
 * Indirizzo fisico
 * @export
 * @interface NotificationPhysicalAddress
 */
export interface NotificationPhysicalAddress {
    /**
     * Campo \"presso\" dell\'indirizzo
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'at'?: string;
    /**
     * Indirizzo del domicilio fisico
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'address': string;
    /**
     * Seconda riga dell\'indirizzo fisico
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'addressDetails'?: string;
    /**
     * Codice di avviamento postale. In caso di invio estero diventa facoltativo
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'zip'?: string;
    /**
     * Comune
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'municipality': string;
    /**
     * Frazione o località
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'municipalityDetails'?: string;
    /**
     * Provincia
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'province'?: string;
    /**
     * Denominazione paese estero
     * @type {string}
     * @memberof NotificationPhysicalAddress
     */
    'foreignState'?: string;
}
/**
 * Notification price and effective date
 * @export
 * @interface NotificationPriceResponse
 */
export interface NotificationPriceResponse {
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof NotificationPriceResponse
     */
    'iun'?: string;
    /**
     * amount in euro cents
     * @type {number}
     * @memberof NotificationPriceResponse
     */
    'amount'?: number;
    /**
     * data di perfezionamento per decorrenza termini localizzata espressa alla mezzanotte del giorno in cui si verifica l\'evento
     * @type {string}
     * @memberof NotificationPriceResponse
     */
    'refinementDate'?: string;
    /**
     * data di perfezionamento per presa visione espressa alla mezzanotte del giorno in cui si verifica l\'evento
     * @type {string}
     * @memberof NotificationPriceResponse
     */
    'notificationViewDate'?: string;
}
/**
 * Notification price and effective date
 * @export
 * @interface NotificationPriceResponseV23
 */
export interface NotificationPriceResponseV23 {
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof NotificationPriceResponseV23
     */
    'iun'?: string;
    /**
     * Costo totale di notificazione che non include la paFee e vat
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'partialPrice'?: number;
    /**
     * Costo totale di notificazione che include la paFee e vat applicato ai costi cartacei. Se vat e paFee non sono valorizzati, verranno usati i loro valori di default (vedi /components/schemas/VatV23 e /components/schemas/PaFeeV23).
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'totalPrice'?: number;
    /**
     * IVA espressa in percentuale sui costi degli avvisi in formato cartaceo.<br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE. <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 22. <br/> Esempio vat al 22% -> 22 <br/>
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'vat'?: number;
    /**
     * Costo espresso in eurocent sostenuto dal mittente, per l\'elaborazione degli atti, provvedimenti, avvisi e comunicazioni oggetto di notifica, per il relativo deposito sulla piattaforma e per la gestione degli  esiti della notifica (Decreto 30 maggio 2022 - Art. 3, comma 1, lettera a). <br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 100.<br/> Esempio paFee ad 1€ -> 100 <br/>
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'paFee'?: number;
    /**
     * data di perfezionamento per decorrenza termini localizzata espressa alla mezzanotte del giorno in cui si verifica l\'evento
     * @type {string}
     * @memberof NotificationPriceResponseV23
     */
    'refinementDate'?: string;
    /**
     * data di perfezionamento per presa visione espressa alla mezzanotte del giorno in cui si verifica l\'evento
     * @type {string}
     * @memberof NotificationPriceResponseV23
     */
    'notificationViewDate'?: string;
    /**
     * costo base di SeND per notificazione
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'sendFee'?: number;
    /**
     * costo totale dei prodotti postali
     * @type {number}
     * @memberof NotificationPriceResponseV23
     */
    'analogCost'?: number;
}
/**
 * 
 * @export
 * @interface NotificationRADDRetrievedDetails
 */
export interface NotificationRADDRetrievedDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NotificationRADDRetrievedDetails
     */
    'recIndex': number;
    /**
     * tipo di Rete Anti Digital Divide <br/> __FSU__: Fornitore Servizio Universale <br/> __ALT__: Fornitore RADD Alternativa <br/> 
     * @type {string}
     * @memberof NotificationRADDRetrievedDetails
     */
    'raddType': string;
    /**
     * Identificativo della pratica all\'interno della rete RADD
     * @type {string}
     * @memberof NotificationRADDRetrievedDetails
     */
    'raddTransactionId': string;
    /**
     * Data evento
     * @type {string}
     * @memberof NotificationRADDRetrievedDetails
     */
    'eventTimestamp': string;
}
/**
 * Informazioni sui destinatari
 * @export
 * @interface NotificationRecipientV23
 */
export interface NotificationRecipientV23 {
    /**
     * Tipologia di destinatario: Persona Fisica (PF) o Persona Giuridica (PG)
     * @type {string}
     * @memberof NotificationRecipientV23
     */
    'recipientType': NotificationRecipientV23RecipientTypeEnum;
    /**
     * C.F. persona fisica o persona giuridica
     * @type {string}
     * @memberof NotificationRecipientV23
     */
    'taxId': string;
    /**
     * id interno anonimizzato
     * @type {string}
     * @memberof NotificationRecipientV23
     */
    'internalId'?: string;
    /**
     * Denominazione ente o persona fisica / ragione sociale. La codifica prevede i caratteri ISO LATIN 1, senza | e senza i caratteri di controllo, ovvero la seguente regexp: ^[ -{}~\\u00A0-ÿ]*$
     * @type {string}
     * @memberof NotificationRecipientV23
     */
    'denomination': string;
    /**
     * 
     * @type {NotificationDigitalAddress}
     * @memberof NotificationRecipientV23
     */
    'digitalDomicile'?: NotificationDigitalAddress;
    /**
     * 
     * @type {NotificationPhysicalAddress}
     * @memberof NotificationRecipientV23
     */
    'physicalAddress': NotificationPhysicalAddress;
    /**
     * Lista dei pagamenti collegati alla notifica per il destinatario. Possono essere pagamenti rateali o alternativi
     * @type {Array<NotificationPaymentItem>}
     * @memberof NotificationRecipientV23
     */
    'payments'?: Array<NotificationPaymentItem>;
}

export const NotificationRecipientV23RecipientTypeEnum = {
    Pf: 'PF',
    Pg: 'PG'
} as const;

export type NotificationRecipientV23RecipientTypeEnum = typeof NotificationRecipientV23RecipientTypeEnum[keyof typeof NotificationRecipientV23RecipientTypeEnum];

/**
 * 
 * @export
 * @interface NotificationRefusedErrorV23
 */
export interface NotificationRefusedErrorV23 {
    /**
     * Errori di rifiuto della notifica.   - FILE_NOTFOUND   - FILE_SHA_ERROR   - TAXID_NOT_VALID   - SERVICE_UNAVAILABLE   - FILE_PDF_INVALID_ERROR   - FILE_PDF_TOOBIG_ERROR   - NOT_VALID_ADDRESS   - RECIPIENT_ID_NOT_VALID   - F24_METADATA_NOT_VALID   - PAYMENT_NOT_VALID   ...
     * @type {string}
     * @memberof NotificationRefusedErrorV23
     */
    'errorCode'?: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationRefusedErrorV23
     */
    'detail'?: string;
}
/**
 * 
 * @export
 * @interface NotificationRequestAcceptedDetails
 */
export interface NotificationRequestAcceptedDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NotificationRequestAcceptedDetails
     */
    'recIndex'?: number;
}
/**
 * stato di avanzamento del processo di notifica:   * `IN_VALIDATION` - notifica depositata in attesa di validazione   * `ACCEPTED` - L\'ente ha depositato la notifica con successo   * `REFUSED` - Notifica rifiutata a seguito della validazione   * `DELIVERING` - L\'invio della notifica è in corso   * `DELIVERED` - La notifica è stata consegnata a tutti i destinatari   * `VIEWED` - Il destinatario ha letto la notifica entro il termine stabilito   * `EFFECTIVE_DATE` - Il destinatario non ha letto la notifica entro il termine stabilito   * `UNREACHABLE` - Il destinatario non è reperibile   * `CANCELLED` - L\'ente ha annullato l\'invio della notifica   * `PAID` - [DEPRECATO] Uno dei destinatari ha pagato la notifica 
 * @export
 * @enum {string}
 */

export const NotificationStatus = {
    InValidation: 'IN_VALIDATION',
    Accepted: 'ACCEPTED',
    Refused: 'REFUSED',
    Delivering: 'DELIVERING',
    Delivered: 'DELIVERED',
    Viewed: 'VIEWED',
    EffectiveDate: 'EFFECTIVE_DATE',
    Paid: 'PAID',
    Unreachable: 'UNREACHABLE',
    Cancelled: 'CANCELLED'
} as const;

export type NotificationStatus = typeof NotificationStatus[keyof typeof NotificationStatus];


/**
 * elenco degli avanzamenti effettuati dal processo di notifica
 * @export
 * @interface NotificationStatusHistoryElement
 */
export interface NotificationStatusHistoryElement {
    /**
     * 
     * @type {NotificationStatus}
     * @memberof NotificationStatusHistoryElement
     */
    'status': NotificationStatus;
    /**
     * data e ora di raggiungimento dello stato di avanzamento
     * @type {string}
     * @memberof NotificationStatusHistoryElement
     */
    'activeFrom': string;
    /**
     * Eventi avvenuti nello stato
     * @type {Array<string>}
     * @memberof NotificationStatusHistoryElement
     */
    'relatedTimelineElements': Array<string>;
}


/**
 * 
 * @export
 * @interface NotificationViewedCreationRequestDetailsV23
 */
export interface NotificationViewedCreationRequestDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'recIndex': number;
    /**
     * Identificativo dell\'atto opponibile a terzi del quale è stata richiesta la creazione
     * @type {string}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'legalfactId'?: string;
    /**
     * Data ricezione richiesta visualizzazione notifica
     * @type {string}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'eventTimestamp'?: string;
    /**
     * tipo di Rete Anti Digital Divide <br/> __FSU__: Fornitore Servizio Universale <br/> __ALT__: Fornitore RADD Alternativa <br/> 
     * @type {string}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'raddType'?: string;
    /**
     * Identificativo della pratica all\'interno della rete RADD
     * @type {string}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'raddTransactionId'?: string;
    /**
     * 
     * @type {DelegateInfo}
     * @memberof NotificationViewedCreationRequestDetailsV23
     */
    'delegateInfo'?: DelegateInfo;
}
/**
 * 
 * @export
 * @interface NotificationViewedDetailsV23
 */
export interface NotificationViewedDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof NotificationViewedDetailsV23
     */
    'recIndex': number;
    /**
     * costo notifica in euro cents, può essere nullo se la notifica si è perfezionata prima per decorrenza termini
     * @type {number}
     * @memberof NotificationViewedDetailsV23
     */
    'notificationCost'?: number;
    /**
     * tipo di Rete Anti Digital Divide <br/> __FSU__: Fornitore Servizio Universale <br/> __ALT__: Fornitore RADD Alternativa <br/> 
     * @type {string}
     * @memberof NotificationViewedDetailsV23
     */
    'raddType'?: string;
    /**
     * Identificativo della pratica all\'interno della rete RADD
     * @type {string}
     * @memberof NotificationViewedDetailsV23
     */
    'raddTransactionId'?: string;
    /**
     * 
     * @type {DelegateInfo}
     * @memberof NotificationViewedDetailsV23
     */
    'delegateInfo'?: DelegateInfo;
    /**
     * Data evento visualizzazione
     * @type {string}
     * @memberof NotificationViewedDetailsV23
     */
    'eventTimestamp'?: string;
}
/**
 * Informazioni utili per effettuare il pagamento di una notifica, sono associate al destinatario perché le spese di notifica possono differire a seconda del canale di notifica utilizzato. <br/>   - _noticeCode_: \"codice avviso pagoPA\" di pagamento del sistema pagoPA, usato per pagamento online.<br/>   - _creditorTaxId_: codice fiscale dell\'ente a cui fa riferimento il \"codice avviso pagoPA\". <br/>   - _applyCost_: flag per indicare se l\'avviso pagoPA deve contenere i costi di notifica. <br/>   - _pagoPaForm_: riferimento al PDF contenete il bollettino pagoPA<br/>
 * @export
 * @interface PagoPaPayment
 */
export interface PagoPaPayment {
    /**
     * Payment notice number  numero avviso
     * @type {string}
     * @memberof PagoPaPayment
     */
    'noticeCode': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof PagoPaPayment
     */
    'creditorTaxId': string;
    /**
     * Flag per indicare se l\'avviso pagoPa deve contenere i costi di notifica
     * @type {boolean}
     * @memberof PagoPaPayment
     */
    'applyCost': boolean;
    /**
     * 
     * @type {NotificationPaymentAttachment}
     * @memberof PagoPaPayment
     */
    'attachment'?: NotificationPaymentAttachment;
}
/**
 * Comprende: <br/>   - lo _IUN_ della notifica pagata, <br/>   - data e ora del pagamento, <br/>   - il codice fiscale del destinatario pagatore, <br/>   - la tipologia del destinatario pagatore (PF / PG), <br/>   - importo del pagamento in eurocent. <br/>
 * @export
 * @interface PaymentEventF24
 */
export interface PaymentEventF24 {
    /**
     * 
     * @type {string}
     * @memberof PaymentEventF24
     */
    'iun': string;
    /**
     * 
     * @type {string}
     * @memberof PaymentEventF24
     */
    'paymentDate': string;
    /**
     * C.F. persona fisica o persona giuridica
     * @type {string}
     * @memberof PaymentEventF24
     */
    'recipientTaxId': string;
    /**
     * 
     * @type {string}
     * @memberof PaymentEventF24
     */
    'recipientType': string;
    /**
     * 
     * @type {number}
     * @memberof PaymentEventF24
     */
    'amount': number;
}
/**
 * Comprende: <br/>   - _noticeCode_: \"codice avviso pagoPA\" di pagamento del sistema pagoPA, usato per pagamento online.<br/>   - _creditorTaxId_: codice fiscale dell\'ente a cui fa riferimento il \"codice avviso pagoPA\". <br/>   - data e ora del pagamento. <br/>   - importo del pagamento in eurocent. <br/>
 * @export
 * @interface PaymentEventPagoPa
 */
export interface PaymentEventPagoPa {
    /**
     * Payment notice number  numero avviso
     * @type {string}
     * @memberof PaymentEventPagoPa
     */
    'noticeCode': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof PaymentEventPagoPa
     */
    'creditorTaxId': string;
    /**
     * data e ora in formato ISO 8601
     * @type {string}
     * @memberof PaymentEventPagoPa
     */
    'paymentDate': string;
    /**
     * 
     * @type {number}
     * @memberof PaymentEventPagoPa
     */
    'amount': number;
}
/**
 * Richiesta contenente un array di eventi di pagamento di tipo F24 di cui una Pubblica Amministrazione deve avvisare Piattaforma Notifiche.
 * @export
 * @interface PaymentEventsRequestF24
 */
export interface PaymentEventsRequestF24 {
    /**
     * Elenco degli eventi di pagamento
     * @type {Array<PaymentEventF24>}
     * @memberof PaymentEventsRequestF24
     */
    'events': Array<PaymentEventF24>;
}
/**
 * Richiesta contenente un array di eventi di pagamento di tipo PagoPA di cui una Pubblica Amministrazione deve avvisare Piattaforma Notifiche.
 * @export
 * @interface PaymentEventsRequestPagoPa
 */
export interface PaymentEventsRequestPagoPa {
    /**
     * Elenco degli eventi di pagamento
     * @type {Array<PaymentEventPagoPa>}
     * @memberof PaymentEventsRequestPagoPa
     */
    'events': Array<PaymentEventPagoPa>;
}
/**
 * Reporting Period (Sezione INPS) object
 * @export
 * @interface Period
 */
export interface Period {
    /**
     * start date of the period
     * @type {string}
     * @memberof Period
     */
    'startDate'?: string;
    /**
     * end date of the period
     * @type {string}
     * @memberof Period
     */
    'endDate'?: string;
}
/**
 * Person Data (Dati Anagrafici PF) object
 * @export
 * @interface PersonData
 */
export interface PersonData {
    /**
     * 
     * @type {PersonalData}
     * @memberof PersonData
     */
    'personalData'?: PersonalData;
    /**
     * 
     * @type {TaxAddress}
     * @memberof PersonData
     */
    'taxAddress'?: TaxAddress;
}
/**
 * Personal Data (Dati Anagrafici) object
 * @export
 * @interface PersonalData
 */
export interface PersonalData {
    /**
     * surname of the person
     * @type {string}
     * @memberof PersonalData
     */
    'surname'?: string;
    /**
     * name of the person
     * @type {string}
     * @memberof PersonalData
     */
    'name'?: string;
    /**
     * birthdate of the person
     * @type {string}
     * @memberof PersonalData
     */
    'birthDate'?: string;
    /**
     * indicate if is (F)emale or (M)ale
     * @type {string}
     * @memberof PersonalData
     */
    'sex'?: string;
    /**
     * birth place of the person
     * @type {string}
     * @memberof PersonalData
     */
    'birthPlace'?: string;
    /**
     * birth province of the person
     * @type {string}
     * @memberof PersonalData
     */
    'birthProvince'?: string;
}
/**
 * Indirizzo fisico scoperto durante fase di consegna
 * @export
 * @interface PhysicalAddress
 */
export interface PhysicalAddress {
    /**
     * Campo \"presso\" dell\'indirizzo
     * @type {string}
     * @memberof PhysicalAddress
     */
    'at'?: string;
    /**
     * Indirizzo del domicilio fisico
     * @type {string}
     * @memberof PhysicalAddress
     */
    'address': string;
    /**
     * Seconda riga dell\'indirizzo fisico
     * @type {string}
     * @memberof PhysicalAddress
     */
    'addressDetails'?: string;
    /**
     * Codice di avviamento postale. In caso di invio estero diventa facoltativo
     * @type {string}
     * @memberof PhysicalAddress
     */
    'zip'?: string;
    /**
     * Comune in cui l\'indirizzo si trova
     * @type {string}
     * @memberof PhysicalAddress
     */
    'municipality': string;
    /**
     * Frazione o località
     * @type {string}
     * @memberof PhysicalAddress
     */
    'municipalityDetails'?: string;
    /**
     * Provincia in cui si trova l\'indirizzo
     * @type {string}
     * @memberof PhysicalAddress
     */
    'province'?: string;
    /**
     * Denominazione paese estero
     * @type {string}
     * @memberof PhysicalAddress
     */
    'foreignState'?: string;
}
/**
 * 
 * @export
 * @interface PnDowntimeEntry
 */
export interface PnDowntimeEntry {
    /**
     * 
     * @type {PnFunctionality}
     * @memberof PnDowntimeEntry
     */
    'functionality': PnFunctionality;
    /**
     * 
     * @type {PnFunctionalityStatus}
     * @memberof PnDowntimeEntry
     */
    'status': PnFunctionalityStatus;
    /**
     * 
     * @type {string}
     * @memberof PnDowntimeEntry
     */
    'startDate': string;
    /**
     * se il disservizio è ancora attivo questo campo sarà assente o con valore _null_
     * @type {string}
     * @memberof PnDowntimeEntry
     */
    'endDate'?: string;
    /**
     * Se assente o valorizzato _null_ indica che l\'atto opponibile a terzi non è ancora disponibile. Questo avviene per i disservizi ancora aperti e per i disservizi  terminati da pochi minuti. <br/> Questo valore è da utilizzare con l\'API _getLegalFact_ di questo stesso servizio.
     * @type {string}
     * @memberof PnDowntimeEntry
     */
    'legalFactId'?: string;
    /**
     * 
     * @type {boolean}
     * @memberof PnDowntimeEntry
     */
    'fileAvailable'?: boolean;
}


/**
 * - __NOTIFICATION_CREATE__: la possibilità di creare nuove notifiche. - __NOTIFICATION_VISUALIZATION__: la possibilità di visualizzare le notifiche e scaricare gli atti.  - __NOTIFICATION_WORKFLOW__: l\'avanzamento del processo di notifica. 
 * @export
 * @enum {string}
 */

export const PnFunctionality = {
    NOTIFICATION_CREATE: 'NOTIFICATION_CREATE',
    NOTIFICATION_VISUALIZATION: 'NOTIFICATION_VISUALIZATION',
    NOTIFICATION_WORKFLOW: 'NOTIFICATION_WORKFLOW'
} as const;

export type PnFunctionality = typeof PnFunctionality[keyof typeof PnFunctionality];


/**
 * 
 * @export
 * @enum {string}
 */

export const PnFunctionalityStatus = {
    Ko: 'KO',
    Ok: 'OK'
} as const;

export type PnFunctionalityStatus = typeof PnFunctionalityStatus[keyof typeof PnFunctionalityStatus];


/**
 * Elenco delle funzionalità della piattaforma ed elenco dei disservizi noti e attivi  al momento della richiesta. I disservizi (_openIncidents_) segnalati sono al più uno  per funzionalità; gli attributi _endDate_ e _legalFactId_ non saranno valorizzati.
 * @export
 * @interface PnStatusResponse
 */
export interface PnStatusResponse {
    /**
     * Bad Request
     * @type {number}
     * @memberof PnStatusResponse
     */
    'status'?: number;
    /**
     * The server cannot process the request
     * @type {string}
     * @memberof PnStatusResponse
     */
    'title'?: string;
    /**
     * The server cannot process the request
     * @type {string}
     * @memberof PnStatusResponse
     */
    'detail'?: string;
    /**
     * Un array che comprende tutti i possibili valori dell\'enum _PnFunctionality_
     * @type {Array<PnFunctionality>}
     * @memberof PnStatusResponse
     */
    'functionalities': Array<PnFunctionality>;
    /**
     * Al più uno per funzionalità
     * @type {Array<PnDowntimeEntry>}
     * @memberof PnStatusResponse
     */
    'openIncidents': Array<PnDowntimeEntry>;
}
/**
 * 
 * @export
 * @interface PreLoadRequest
 */
export interface PreLoadRequest {
    /**
     * Identificativo univoco all\'interno della request HTTP, serve per correlare la risposta. Stringa alfanumerica con caratteri utilizzabili in un nome file.
     * @type {string}
     * @memberof PreLoadRequest
     */
    'preloadIdx'?: string;
    /**
     * Il MIME type dell\'allegato che dovrà essere caricato. Attualmente sono supportati   - application/pdf   - application/json
     * @type {string}
     * @memberof PreLoadRequest
     */
    'contentType'?: string;
    /**
     * checksum sha256, codificato in base 64, del contenuto binario del file che verrà caricato
     * @type {string}
     * @memberof PreLoadRequest
     */
    'sha256': string;
}
/**
 * Per ogni richiesta che è stata fatta viene fornito un presigned URL e le  informazioni per usarlo.
 * @export
 * @interface PreLoadResponse
 */
export interface PreLoadResponse {
    /**
     * per correlazione con la richiesta. Stringa alfanumerica con caratteri utilizzabili in un file.
     * @type {string}
     * @memberof PreLoadResponse
     */
    'preloadIdx'?: string;
    /**
     * Token aggiuntivo per far si che sia necessario intercettare anche gli  header e non solo l\'URL di upload del contenuto del documento.
     * @type {string}
     * @memberof PreLoadResponse
     */
    'secret'?: string;
    /**
     * Indica se per l\'upload del contenuto file bisogna utilizzare il metodo PUT o POST
     * @type {string}
     * @memberof PreLoadResponse
     */
    'httpMethod'?: PreLoadResponseHttpMethodEnum;
    /**
     * URL a cui effettuare l\'upload del contenuto del documento.
     * @type {string}
     * @memberof PreLoadResponse
     */
    'url'?: string;
    /**
     * la chiave restituita sarà globalmente unica e andrà utilizzata nella richiesta  di notifica.
     * @type {string}
     * @memberof PreLoadResponse
     */
    'key'?: string;
}

export const PreLoadResponseHttpMethodEnum = {
    Post: 'POST',
    Put: 'PUT'
} as const;

export type PreLoadResponseHttpMethodEnum = typeof PreLoadResponseHttpMethodEnum[keyof typeof PreLoadResponseHttpMethodEnum];

/**
 * 
 * @export
 * @interface PrepareAnalogDomicileFailureDetails
 */
export interface PrepareAnalogDomicileFailureDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof PrepareAnalogDomicileFailureDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof PrepareAnalogDomicileFailureDetails
     */
    'foundAddress'?: PhysicalAddress;
    /**
     * __Motivazione fallimento prepare   - __D00__ Indirizzo non trovato   - __D01__ Indirizzo non valido   - __D02__ Indirizzo coincidente con quello del primo tentativo 
     * @type {string}
     * @memberof PrepareAnalogDomicileFailureDetails
     */
    'failureCause'?: string;
    /**
     * RequestId della richiesta di prepare
     * @type {string}
     * @memberof PrepareAnalogDomicileFailureDetails
     */
    'prepareRequestId'?: string;
}
/**
 * 
 * @export
 * @interface PrepareDigitalDetails
 */
export interface PrepareDigitalDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof PrepareDigitalDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof PrepareDigitalDetails
     */
    'digitalAddress'?: DigitalAddress;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof PrepareDigitalDetails
     */
    'digitalAddressSource': DigitalAddressSource;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof PrepareDigitalDetails
     */
    'retryNumber': number;
    /**
     * data tentativo precedente
     * @type {string}
     * @memberof PrepareDigitalDetails
     */
    'attemptDate'?: string;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof PrepareDigitalDetails
     */
    'nextDigitalAddressSource'?: DigitalAddressSource;
    /**
     * numero del prossimo tentativo da effettuare
     * @type {number}
     * @memberof PrepareDigitalDetails
     */
    'nextSourceAttemptsMade'?: number;
    /**
     * data tentativo precedente per prossimo source
     * @type {string}
     * @memberof PrepareDigitalDetails
     */
    'nextLastAttemptMadeForSource'?: string;
}


/**
 * 
 * @export
 * @interface ProbableDateAnalogWorkflowDetails
 */
export interface ProbableDateAnalogWorkflowDetails {
    /**
     * Index destinatario che ha effettuato il pagamento della notifica
     * @type {number}
     * @memberof ProbableDateAnalogWorkflowDetails
     */
    'recIndex': number;
    /**
     * Data probabile di inizio del flusso analogico
     * @type {string}
     * @memberof ProbableDateAnalogWorkflowDetails
     */
    'schedulingAnalogDate': string;
}
/**
 * 
 * @export
 * @interface Problem
 */
export interface Problem {
    /**
     * URI reference of type definition
     * @type {string}
     * @memberof Problem
     */
    'type'?: string;
    /**
     * The HTTP status code generated by the origin server for this occurrence of the problem.
     * @type {number}
     * @memberof Problem
     */
    'status': number;
    /**
     * A short, summary of the problem type. Written in english and readable
     * @type {string}
     * @memberof Problem
     */
    'title'?: string;
    /**
     * A human readable explanation of the problem.
     * @type {string}
     * @memberof Problem
     */
    'detail'?: string;
    /**
     * Internal support identifier associated to error
     * @type {string}
     * @memberof Problem
     */
    'traceId'?: string;
    /**
     * date and time referred to UTC
     * @type {string}
     * @memberof Problem
     */
    'timestamp'?: string;
    /**
     * 
     * @type {Array<ProblemError>}
     * @memberof Problem
     */
    'errors': Array<ProblemError>;
}
/**
 * 
 * @export
 * @interface ProblemError
 */
export interface ProblemError {
    /**
     * Internal code of the error, in human-readable format
     * @type {string}
     * @memberof ProblemError
     */
    'code': string;
    /**
     * Parameter or request body field name for validation error
     * @type {string}
     * @memberof ProblemError
     */
    'element'?: string;
    /**
     * A human readable explanation specific to this occurrence of the problem.
     * @type {string}
     * @memberof ProblemError
     */
    'detail'?: string;
}
/**
 * 
 * @export
 * @interface PublicRegistryCallDetails
 */
export interface PublicRegistryCallDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof PublicRegistryCallDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DeliveryMode}
     * @memberof PublicRegistryCallDetails
     */
    'deliveryMode': DeliveryMode;
    /**
     * 
     * @type {ContactPhase}
     * @memberof PublicRegistryCallDetails
     */
    'contactPhase': ContactPhase;
    /**
     * Numero di tentativi di notificazione già effettuati
     * @type {number}
     * @memberof PublicRegistryCallDetails
     */
    'sentAttemptMade': number;
    /**
     * Data invio richiesta ai public registry
     * @type {string}
     * @memberof PublicRegistryCallDetails
     */
    'sendDate': string;
}


/**
 * 
 * @export
 * @interface PublicRegistryResponseDetails
 */
export interface PublicRegistryResponseDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof PublicRegistryResponseDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof PublicRegistryResponseDetails
     */
    'digitalAddress'?: DigitalAddress;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof PublicRegistryResponseDetails
     */
    'physicalAddress'?: PhysicalAddress;
}
/**
 * 
 * @export
 * @enum {string}
 */

export const RecipientType = {
    Pf: 'PF',
    Pg: 'PG'
} as const;

export type RecipientType = typeof RecipientType[keyof typeof RecipientType];


/**
 * 
 * @export
 * @interface RefinementDetailsV23
 */
export interface RefinementDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof RefinementDetailsV23
     */
    'recIndex': number;
    /**
     * costo notifica in euro cents, può essere nullo se la notifica si è perfezionata prima per visualizzazione
     * @type {number}
     * @memberof RefinementDetailsV23
     */
    'notificationCost'?: number;
    /**
     * Data evento refinement
     * @type {string}
     * @memberof RefinementDetailsV23
     */
    'eventTimestamp'?: string;
}
/**
 * Region Record object
 * @export
 * @interface RegionRecord
 */
export interface RegionRecord {
    /**
     * region identification code
     * @type {string}
     * @memberof RegionRecord
     */
    'region'?: string;
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof RegionRecord
     */
    'taxType'?: string;
    /**
     * identification code of the ente
     * @type {string}
     * @memberof RegionRecord
     */
    'installment'?: string;
    /**
     * reference year
     * @type {string}
     * @memberof RegionRecord
     */
    'year'?: string;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof RegionRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof RegionRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof RegionRecord
     */
    'applyCost': boolean;
}
/**
 * Region Section (Sezione Regioni) object
 * @export
 * @interface RegionSection
 */
export interface RegionSection {
    /**
     * Region Record List
     * @type {Array<RegionRecord>}
     * @memberof RegionSection
     */
    'records'?: Array<RegionRecord>;
}
/**
 * 
 * @export
 * @interface RequestRefusedDetailsV23
 */
export interface RequestRefusedDetailsV23 {
    /**
     * Motivazioni che hanno portato al rifiuto della notifica
     * @type {Array<NotificationRefusedErrorV23>}
     * @memberof RequestRefusedDetailsV23
     */
    'refusalReasons'?: Array<NotificationRefusedErrorV23>;
}
/**
 * Response to cancellation async call
 * @export
 * @interface RequestStatus
 */
export interface RequestStatus {
    /**
     * Cancellation request status:   - OK 
     * @type {string}
     * @memberof RequestStatus
     */
    'status': string;
    /**
     * 
     * @type {Array<StatusDetail>}
     * @memberof RequestStatus
     */
    'details'?: Array<StatusDetail>;
}
/**
 * stato risposta ricevuta da externalChannel
 * @export
 * @enum {string}
 */

export const ResponseStatus = {
    Ok: 'OK',
    Ko: 'KO'
} as const;

export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];


/**
 * 
 * @export
 * @interface ScheduleAnalogWorkflowDetailsV23
 */
export interface ScheduleAnalogWorkflowDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof ScheduleAnalogWorkflowDetailsV23
     */
    'recIndex': number;
    /**
     * Data prevista per l\'inizio dell\'invio analogico
     * @type {string}
     * @memberof ScheduleAnalogWorkflowDetailsV23
     */
    'schedulingDate'?: string;
}
/**
 * 
 * @export
 * @interface ScheduleDigitalWorkflowDetailsV23
 */
export interface ScheduleDigitalWorkflowDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'digitalAddress'?: DigitalAddress;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'digitalAddressSource': DigitalAddressSource;
    /**
     * 
     * @type {number}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'sentAttemptMade': number;
    /**
     * 
     * @type {string}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'lastAttemptDate': string;
    /**
     * Data prevista prossimo tentativo d\'invio digitale per quella specifica sorgente di indirizzo
     * @type {string}
     * @memberof ScheduleDigitalWorkflowDetailsV23
     */
    'schedulingDate'?: string;
}


/**
 * 
 * @export
 * @interface ScheduleRefinementDetails
 */
export interface ScheduleRefinementDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof ScheduleRefinementDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {string}
     * @memberof ScheduleRefinementDetails
     */
    'schedulingDate'?: string;
}
/**
 * 
 * @export
 * @interface SendAnalogDetails
 */
export interface SendAnalogDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendAnalogDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof SendAnalogDetails
     */
    'physicalAddress': PhysicalAddress;
    /**
     * 
     * @type {ServiceLevel}
     * @memberof SendAnalogDetails
     */
    'serviceLevel': ServiceLevel;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof SendAnalogDetails
     */
    'sentAttemptMade': number;
    /**
     * Id relativo alla eventuale precedente richiesta di invio cartaceo
     * @type {string}
     * @memberof SendAnalogDetails
     */
    'relatedRequestId'?: string;
    /**
     * Tipo di invio cartaceo effettivamente inviato   - __AR__: Raccomandata nazionale Andata e Ritorno   - __890__: Recapito a norma della legge 890/1982   - __RIR__: Raccomandata internazionale Andata e Ritorno 
     * @type {string}
     * @memberof SendAnalogDetails
     */
    'productType'?: string;
    /**
     * costo in eurocent dell\'invio
     * @type {number}
     * @memberof SendAnalogDetails
     */
    'analogCost'?: number;
    /**
     * numero delle pagina che compongono la spedizione cartacea
     * @type {number}
     * @memberof SendAnalogDetails
     */
    'numberOfPages'?: number;
    /**
     * peso in grammi della busta
     * @type {number}
     * @memberof SendAnalogDetails
     */
    'envelopeWeight'?: number;
    /**
     * request id della relativa richiesta di prepare
     * @type {string}
     * @memberof SendAnalogDetails
     */
    'prepareRequestId'?: string;
}


/**
 * 
 * @export
 * @interface SendAnalogFeedbackDetails
 */
export interface SendAnalogFeedbackDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendAnalogFeedbackDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof SendAnalogFeedbackDetails
     */
    'physicalAddress': PhysicalAddress;
    /**
     * 
     * @type {ServiceLevel}
     * @memberof SendAnalogFeedbackDetails
     */
    'serviceLevel': ServiceLevel;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof SendAnalogFeedbackDetails
     */
    'sentAttemptMade': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof SendAnalogFeedbackDetails
     */
    'newAddress'?: PhysicalAddress;
    /**
     * 
     * @type {ResponseStatus}
     * @memberof SendAnalogFeedbackDetails
     */
    'responseStatus': ResponseStatus;
    /**
     * 
     * @type {string}
     * @memberof SendAnalogFeedbackDetails
     */
    'notificationDate'?: string;
    /**
     * __Motivazione di mancata consegna__ obbligatorie negli stati di mancata consegna   - __M01__ destinatario irreperibile   - __M02__ destinatario deceduto   - __M03__ destinatario sconosciuto   - __M04__ destinatario trasferito   - __M05__ invio rifiutato   - __M06__ indirizzo inesatto   - __M07__ indirizzo inesistente   - __M08__ indirizzo insufficiente   - __F01__ - in caso di furto   - __F02__ - in caso di smarrimento   - __F03__ - in caso di deterioramento 
     * @type {string}
     * @memberof SendAnalogFeedbackDetails
     */
    'deliveryFailureCause'?: string;
    /**
     * Formato: - __deliveryDetailCode__- [prodotto] - [statusCode] - statusDescription   - __CON080__- [ALL] - [PROGRESS] - Stampato ed Imbustato   - __RECRS001C__- [RS] - [OK] - Consegnato - Fascicolo Chiuso   - __RECRS002C__- [RS] - [KO] - Mancata consegna - Fascicolo Chiuso   - __RECRS002F__- [RS] - [KO] - Irreperibilità Assoluta - Fascicolo Chiuso   - __RECRS003C__- [RS] - [OK] - Consegnato presso Punti di Giacenza - Fascicolo Chiuso   - __RECRS004C__- [RS] - [OK] - Mancata consegna presso Punti di Giacenza - Fascicolo Chiuso   - __RECRS005C__- [RS] - [OK] - Compiuta giacenza - Fascicolo Chiuso   - __RECRS006__- [RS] - [PROGRESS] - Furto/Smarrimento/deterioramento   - __RECRN001C__- [AR] - [OK] - Consegnato - Fascicolo Chiuso   - __RECRN002C__- [AR] - [KO] - Mancata consegna - Fascicolo Chiuso   - __RECRN002F__- [AR] - [KO] - Irreperibilità Assoluta - Fascicolo Chiuso   - __RECRN003C__- [AR] - [OK] - Consegnato presso Punti di Giacenza - Fascicolo Chiuso   - __RECRN004C__- [AR] - [KO] - Mancata consegna presso Punti di Giacenza - Fascicolo Chiuso   - __RECRN005C__- [AR] - [OK] - Compiuta giacenza - Fascicolo Chiuso   - __RECRN006__- [AR] - [PROGRESS] - Furto/Smarrimento/deterioramento   - __RECAG001C__- [890] - [OK] - Consegnato - Fascicolo Chiuso   - __RECAG002C__- [890] - [OK] - Consegnato a persona abilitata - Fascicolo Chiuso   - __RECAG003C__- [890] - [KO] - Mancata consegna - Fascicolo Chiuso   - __RECAG003F__- [890] - [KO] - Irreperibilità Assoluta - Fascicolo Chiuso   - __RECAG004__- [890] - [PROGRESS] - Furto/Smarrimento/deterioramento   - __RECAG005C__- [890] - [OK | PROGRESS] - Consegnato presso Punti di Giacenza - Fascicolo Chiuso   - __RECAG006C__- [890] - [OK | PROGRESS] - Consegna a persona abilitata presso Punti di Giacenza - Fas. Ch.   - __RECAG007C__- [890] - [KO | PROGRESS] - Mancata consegna presso Punti di Giacenza - Fascicolo Chiuso   - __RECAG008C__- [890] - [PROGRESS] - Compiuta giacenza - Fascicolo Chiuso   - __PNAG012__- [890] - [KO] - Distacco d\'ufficio 23L - Fascicolo Chiuso   - __RECRI003C__- [RIR] - [OK] - Consegnato - Fascicolo Chiuso   - __RECRI004C__- [RIR] - [KO] - Non Consegnato - fascicolo Chiuso   - __RECRI005__- [RIR] - [PROGRESS] - Furto/Smarrimento/deterioramento   - __RECRSI003C__- [RIS] - [OK] - Consegnato - Fascicolo Chiuso   - __RECRSI004C__- [RIS] - [KO] - Non Consegnato - fascicolo Chiuso   - __RECRSI005__- [RIS] - [PROGRESS] - Furto/Smarrimento/deterioramento 
     * @type {string}
     * @memberof SendAnalogFeedbackDetails
     */
    'deliveryDetailCode'?: string;
    /**
     * 
     * @type {Array<AttachmentDetails>}
     * @memberof SendAnalogFeedbackDetails
     */
    'attachments'?: Array<AttachmentDetails>;
    /**
     * RequestId della richiesta d\'invio
     * @type {string}
     * @memberof SendAnalogFeedbackDetails
     */
    'sendRequestId'?: string;
    /**
     * Codice della raccomandata
     * @type {string}
     * @memberof SendAnalogFeedbackDetails
     */
    'registeredLetterCode'?: string;
}


/**
 * 
 * @export
 * @interface SendAnalogProgressDetailsV23
 */
export interface SendAnalogProgressDetailsV23 {
    /**
     * Index destinatario che ha effettuato il pagamento della notifica
     * @type {number}
     * @memberof SendAnalogProgressDetailsV23
     */
    'recIndex': number;
    /**
     * 
     * @type {string}
     * @memberof SendAnalogProgressDetailsV23
     */
    'notificationDate'?: string;
    /**
     * Vedi deliveryFailureCause in SendAnalogFeedbackDetails
     * @type {string}
     * @memberof SendAnalogProgressDetailsV23
     */
    'deliveryFailureCause'?: string;
    /**
     * Vedi deliveryDetailCode in SendAnalogFeedbackDetails
     * @type {string}
     * @memberof SendAnalogProgressDetailsV23
     */
    'deliveryDetailCode'?: string;
    /**
     * 
     * @type {Array<AttachmentDetails>}
     * @memberof SendAnalogProgressDetailsV23
     */
    'attachments'?: Array<AttachmentDetails>;
    /**
     * RequestId della richiesta d\'invio
     * @type {string}
     * @memberof SendAnalogProgressDetailsV23
     */
    'sendRequestId'?: string;
    /**
     * Codice della raccomandata
     * @type {string}
     * @memberof SendAnalogProgressDetailsV23
     */
    'registeredLetterCode'?: string;
    /**
     * 
     * @type {ServiceLevel}
     * @memberof SendAnalogProgressDetailsV23
     */
    'serviceLevel'?: ServiceLevel;
}


/**
 * 
 * @export
 * @interface SendCourtesyMessageDetails
 */
export interface SendCourtesyMessageDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendCourtesyMessageDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof SendCourtesyMessageDetails
     */
    'digitalAddress': DigitalAddress;
    /**
     * data invio messaggio di cortesia
     * @type {string}
     * @memberof SendCourtesyMessageDetails
     */
    'sendDate': string;
    /**
     * 
     * @type {IoSendMessageResult}
     * @memberof SendCourtesyMessageDetails
     */
    'ioSendMessageResult'?: IoSendMessageResult;
}


/**
 * 
 * @export
 * @interface SendDigitalDetails
 */
export interface SendDigitalDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendDigitalDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof SendDigitalDetails
     */
    'digitalAddress': DigitalAddress;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof SendDigitalDetails
     */
    'digitalAddressSource': DigitalAddressSource;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof SendDigitalDetails
     */
    'retryNumber': number;
}


/**
 * 
 * @export
 * @interface SendDigitalFeedbackDetails
 */
export interface SendDigitalFeedbackDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendDigitalFeedbackDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof SendDigitalFeedbackDetails
     */
    'digitalAddress': DigitalAddress;
    /**
     * 
     * @type {ResponseStatus}
     * @memberof SendDigitalFeedbackDetails
     */
    'responseStatus': ResponseStatus;
    /**
     * data notifica
     * @type {string}
     * @memberof SendDigitalFeedbackDetails
     */
    'notificationDate': string;
    /**
     * Codice errore, vuoto in caso di successo
     * @type {string}
     * @memberof SendDigitalFeedbackDetails
     */
    'deliveryFailureCause'?: string;
    /**
     * Stato - Codice relativo all\'evento - Descrizione:   - PROGRESS   C000 = PREACCETTAZIONE   - PROGRESS   C001 = ACCETTAZIONE   - PROGRESS   C005 = PRESA_IN_CARICO   - PROGRESS   C007 = PREAVVISO_ERRORE_CONSEGNA   - PROGRESS   DP00 = RE-INVIO PEC CAUSA FALLIMENTO TEMPORANEO   - PROGRESS   DP10 = TIMEOUT RICEZIONE RISULTATO   - ERROR      C002 = NON_ACCETTAZIONE   - ERROR      C004 = ERRORE_CONSEGNA   - ERROR      C006 = RILEVAZIONE_VIRUS   - ERROR      C008 = ERRORE_COMUNICAZIONE_SERVER_PEC   - ERROR      C009 = ERRORE_DOMINIO_PEC_NON_VALIDO   - ERROR      C010 = ERROR_INVIO_PEC   - OK         C003 = AVVENUTA_CONSEGNA 
     * @type {string}
     * @memberof SendDigitalFeedbackDetails
     */
    'deliveryDetailCode'?: string;
    /**
     * 
     * @type {Array<SendingReceipt>}
     * @memberof SendDigitalFeedbackDetails
     */
    'sendingReceipts'?: Array<SendingReceipt>;
}


/**
 * 
 * @export
 * @interface SendDigitalProgressDetailsV23
 */
export interface SendDigitalProgressDetailsV23 {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SendDigitalProgressDetailsV23
     */
    'recIndex'?: number;
    /**
     * Codice errore, opzionale
     * @type {string}
     * @memberof SendDigitalProgressDetailsV23
     */
    'deliveryFailureCause'?: string;
    /**
     * Vedi deliveryDetailCode in SendDigitalFeedbackDetails
     * @type {string}
     * @memberof SendDigitalProgressDetailsV23
     */
    'deliveryDetailCode'?: string;
    /**
     * indica se il progress ha dato luogo ad un ritentativo
     * @type {boolean}
     * @memberof SendDigitalProgressDetailsV23
     */
    'shouldRetry'?: boolean;
    /**
     * 
     * @type {DigitalAddress}
     * @memberof SendDigitalProgressDetailsV23
     */
    'digitalAddress'?: DigitalAddress;
    /**
     * 
     * @type {DigitalAddressSource}
     * @memberof SendDigitalProgressDetailsV23
     */
    'digitalAddressSource'?: DigitalAddressSource;
    /**
     * data notifica
     * @type {string}
     * @memberof SendDigitalProgressDetailsV23
     */
    'notificationDate'?: string;
    /**
     * 
     * @type {Array<SendingReceipt>}
     * @memberof SendDigitalProgressDetailsV23
     */
    'sendingReceipts'?: Array<SendingReceipt>;
    /**
     * numero dei tentativi effettuati
     * @type {number}
     * @memberof SendDigitalProgressDetailsV23
     */
    'retryNumber'?: number;
    /**
     * Data evento
     * @type {string}
     * @memberof SendDigitalProgressDetailsV23
     */
    'eventTimestamp'?: string;
}


/**
 * 
 * @export
 * @interface SenderAckCreationRequestDetails
 */
export interface SenderAckCreationRequestDetails {
    /**
     * Identificativo dell\'atto opponibile a terzi del quale è stata richiesta la creazione
     * @type {string}
     * @memberof SenderAckCreationRequestDetails
     */
    'legalFactId'?: string;
}
/**
 * 
 * @export
 * @interface SendingReceipt
 */
export interface SendingReceipt {
    /**
     * messageId del server mittente
     * @type {string}
     * @memberof SendingReceipt
     */
    'id'?: string;
    /**
     * nome del server mittente
     * @type {string}
     * @memberof SendingReceipt
     */
    'system'?: string;
}
/**
 * Le informazioni riguardanti una richiesta di notifica accettata
 * @export
 * @interface SentNotificationV23
 */
export interface SentNotificationV23 {
    /**
     * Identificativo utilizzabile dal chiamante per disambiguare differenti  \"richieste di notificazione\" effettuate con lo stesso numero di protocollo  (campo _paProtocolNumber_). Questo può essere necessario in caso di  \"richiesta di notifica\" rifiutata per errori nei codici di verifica degli allegati.
     * @type {string}
     * @memberof SentNotificationV23
     */
    'idempotenceToken'?: string;
    /**
     * Numero di protocollo che la PA mittente assegna alla notifica stessa
     * @type {string}
     * @memberof SentNotificationV23
     */
    'paProtocolNumber': string;
    /**
     * titolo della notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'subject': string;
    /**
     * descrizione sintetica della notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'abstract'?: string;
    /**
     * Informazioni sui destinatari
     * @type {Array<NotificationRecipientV23>}
     * @memberof SentNotificationV23
     */
    'recipients': Array<NotificationRecipientV23>;
    /**
     * Documenti notificati
     * @type {Array<NotificationDocument>}
     * @memberof SentNotificationV23
     */
    'documents': Array<NotificationDocument>;
    /**
     * 
     * @type {NotificationFeePolicy}
     * @memberof SentNotificationV23
     */
    'notificationFeePolicy': NotificationFeePolicy;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'cancelledIun'?: string;
    /**
     * Tipologia comunicazione fisica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'physicalCommunicationType': SentNotificationV23PhysicalCommunicationTypeEnum;
    /**
     * Denominazione ente o persona fisica / ragione sociale. La codifica prevede i caratteri ISO LATIN 1, senza | e senza i caratteri di controllo, ovvero la seguente regexp: ^[ -{}~\\u00A0-ÿ]*$
     * @type {string}
     * @memberof SentNotificationV23
     */
    'senderDenomination': string;
    /**
     * Payment PA fiscal code
     * @type {string}
     * @memberof SentNotificationV23
     */
    'senderTaxId': string;
    /**
     * Gruppo di utenti dell\'ente mittente che può visualizzare la notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'group'?: string;
    /**
     * Importo della notifica in eurocent
     * @type {number}
     * @memberof SentNotificationV23
     */
    'amount'?: number;
    /**
     * Data di scadenza del pagamento nel formato YYYY-MM-DD riferito all\'Italia
     * @type {string}
     * @memberof SentNotificationV23
     */
    'paymentExpirationDate'?: string;
    /**
     * Codice tassonomico della notifica basato sulla definizione presente nell\'allegato 2 capitolo C del bando [__AVVISO PUBBLICO MISURA 1.4.5 PIATTAFORMA NOTIFICHE DIGITALI__](https://pnrrcomuni.fondazioneifel.it/bandi_public/Bando/325)
     * @type {string}
     * @memberof SentNotificationV23
     */
    'taxonomyCode': string;
    /**
     * Costo espresso in eurocent sostenuto dal mittente, per l\'elaborazione degli atti, provvedimenti, avvisi e comunicazioni oggetto di notifica, per il relativo deposito sulla piattaforma e per la gestione degli  esiti della notifica (Decreto 30 maggio 2022 - Art. 3, comma 1, lettera a). <br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 100.<br/> Esempio paFee ad 1€ -> 100 <br/>
     * @type {number}
     * @memberof SentNotificationV23
     */
    'paFee'?: number;
    /**
     * IVA espressa in percentuale sui costi degli avvisi in formato cartaceo.<br/> Obbligatoria per notifiche con notificationFeePolicy=DELIVERY_MODE. <br/> Per le notifiche effettuate con versioni precedenti alla 2.3 si assume il valore di default 22. <br/> Esempio vat al 22% -> 22 <br/>
     * @type {number}
     * @memberof SentNotificationV23
     */
    'vat'?: number;
    /**
     * Modalitá di integrazione pagoPA per l\'attualizazione del costo della notifica. <br/> - _NONE_: nessuna attualizzazione. <br/> - _SYNC_: modalitá sincrona. <br/> - _ASYNC_: modalitá asincrona. <br/>
     * @type {string}
     * @memberof SentNotificationV23
     */
    'pagoPaIntMode'?: SentNotificationV23PagoPaIntModeEnum;
    /**
     * Identificativo (non IPA) della PA mittente che ha eseguito l\'onboarding su SelfCare.
     * @type {string}
     * @memberof SentNotificationV23
     */
    'senderPaId'?: string;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'iun': string;
    /**
     * Momento di ricezione della notifica da parte di PN
     * @type {string}
     * @memberof SentNotificationV23
     */
    'sentAt': string;
    /**
     * Identificativo Univoco Notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'cancelledByIun'?: string;
    /**
     * Indica se i documenti notificati sono ancora disponibili.
     * @type {boolean}
     * @memberof SentNotificationV23
     */
    'documentsAvailable'?: boolean;
    /**
     * Indica la versione della notifica
     * @type {string}
     * @memberof SentNotificationV23
     */
    'version'?: string;
}

export const SentNotificationV23PhysicalCommunicationTypeEnum = {
    ArRegisteredLetter: 'AR_REGISTERED_LETTER',
    RegisteredLetter890: 'REGISTERED_LETTER_890'
} as const;

export type SentNotificationV23PhysicalCommunicationTypeEnum = typeof SentNotificationV23PhysicalCommunicationTypeEnum[keyof typeof SentNotificationV23PhysicalCommunicationTypeEnum];
export const SentNotificationV23PagoPaIntModeEnum = {
    None: 'NONE',
    Sync: 'SYNC',
    Async: 'ASYNC'
} as const;

export type SentNotificationV23PagoPaIntModeEnum = typeof SentNotificationV23PagoPaIntModeEnum[keyof typeof SentNotificationV23PagoPaIntModeEnum];

/**
 * Livello Servizio
 * @export
 * @enum {string}
 */

export const ServiceLevel = {
    ArRegisteredLetter: 'AR_REGISTERED_LETTER',
    RegisteredLetter890: 'REGISTERED_LETTER_890'
} as const;

export type ServiceLevel = typeof ServiceLevel[keyof typeof ServiceLevel];


/**
 * 
 * @export
 * @interface SimpleRegisteredLetterDetails
 */
export interface SimpleRegisteredLetterDetails {
    /**
     * Index destinatario notifica digitale
     * @type {number}
     * @memberof SimpleRegisteredLetterDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {PhysicalAddress}
     * @memberof SimpleRegisteredLetterDetails
     */
    'physicalAddress': PhysicalAddress;
    /**
     * Tipo di invio cartaceo effettivamente inviato   - __RS__: Raccomandata nazionale Semplice (per Avviso di mancato Recapito)   - __RIS__: Raccomandata internazionale Semplice 
     * @type {string}
     * @memberof SimpleRegisteredLetterDetails
     */
    'productType'?: string;
    /**
     * costo in eurocent dell\'invio
     * @type {number}
     * @memberof SimpleRegisteredLetterDetails
     */
    'analogCost'?: number;
    /**
     * numero delle pagina che compongono la spedizione cartacea
     * @type {number}
     * @memberof SimpleRegisteredLetterDetails
     */
    'numberOfPages'?: number;
    /**
     * peso in grammi della busta
     * @type {number}
     * @memberof SimpleRegisteredLetterDetails
     */
    'envelopeWeight'?: number;
    /**
     * request id della relativa richiesta di prepare
     * @type {string}
     * @memberof SimpleRegisteredLetterDetails
     */
    'prepareRequestId'?: string;
}
/**
 * 
 * @export
 * @interface SimpleRegisteredLetterProgressDetails
 */
export interface SimpleRegisteredLetterProgressDetails {
    /**
     * Index destinatario che ha effettuato il pagamento della notifica
     * @type {number}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'recIndex': number;
    /**
     * 
     * @type {string}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'notificationDate'?: string;
    /**
     * Vedi deliveryFailureCause in SendAnalogFeedbackDetails
     * @type {string}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'deliveryFailureCause'?: string;
    /**
     * Vedi deliveryDetailCode in SendAnalogFeedbackDetails
     * @type {string}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'deliveryDetailCode'?: string;
    /**
     * 
     * @type {Array<AttachmentDetails>}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'attachments'?: Array<AttachmentDetails>;
    /**
     * RequestId della richiesta d\'invio
     * @type {string}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'sendRequestId'?: string;
    /**
     * Codice della raccomandata
     * @type {string}
     * @memberof SimpleRegisteredLetterProgressDetails
     */
    'registeredLetterCode'?: string;
}
/**
 * Payment Reason Record object
 * @export
 * @interface SimplifiedPaymentRecord
 */
export interface SimplifiedPaymentRecord {
    /**
     * section code (ER|RG|EL)
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'section': string;
    /**
     * identification code of the municipality
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'municipality': string;
    /**
     * to check if it is a reconsideration act
     * @type {boolean}
     * @memberof SimplifiedPaymentRecord
     */
    'reconsideration'?: boolean;
    /**
     * to check if there are some changes in properties list
     * @type {boolean}
     * @memberof SimplifiedPaymentRecord
     */
    'propertiesChanges'?: boolean;
    /**
     * to check if it is a payment in advance
     * @type {boolean}
     * @memberof SimplifiedPaymentRecord
     */
    'advancePayment'?: boolean;
    /**
     * to check if it a full payment
     * @type {boolean}
     * @memberof SimplifiedPaymentRecord
     */
    'fullPayment'?: boolean;
    /**
     * number of properties
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'numberOfProperties'?: string;
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'taxType': string;
    /**
     * identification code of the ente
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'installment'?: string;
    /**
     * reference year
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'year'?: string;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof SimplifiedPaymentRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof SimplifiedPaymentRecord
     */
    'applyCost': boolean;
}
/**
 * Payment Reason Section (Motivo del Pagamento) object
 * @export
 * @interface SimplifiedPaymentSection
 */
export interface SimplifiedPaymentSection {
    /**
     * identification code of the operation
     * @type {string}
     * @memberof SimplifiedPaymentSection
     */
    'operationId'?: string;
    /**
     * Payments Record List
     * @type {Array<SimplifiedPaymentRecord>}
     * @memberof SimplifiedPaymentSection
     */
    'records'?: Array<SimplifiedPaymentRecord>;
}
/**
 * Social Security Record object
 * @export
 * @interface SocialSecurityRecord
 */
export interface SocialSecurityRecord {
    /**
     * identification code of the institution
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'institution'?: string;
    /**
     * identification code of the office
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'office'?: string;
    /**
     * reason of the contribution
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'reason'?: string;
    /**
     * identification code of the position
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'position'?: string;
    /**
     * 
     * @type {Period}
     * @memberof SocialSecurityRecord
     */
    'period'?: Period;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'debit'?: string;
    /**
     * credit amount of the record
     * @type {string}
     * @memberof SocialSecurityRecord
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof SocialSecurityRecord
     */
    'applyCost': boolean;
}
/**
 * Social Security Section (Sezione Altri Enti Previdenziali) object
 * @export
 * @interface SocialSecuritySection
 */
export interface SocialSecuritySection {
    /**
     * 
     * @type {Array<InailRecord>}
     * @memberof SocialSecuritySection
     */
    'records'?: Array<InailRecord>;
    /**
     * Social Security Record List
     * @type {Array<SocialSecurityRecord>}
     * @memberof SocialSecuritySection
     */
    'socSecRecords'?: Array<SocialSecurityRecord>;
}
/**
 * Detail of response to cancellation async call
 * @export
 * @interface StatusDetail
 */
export interface StatusDetail {
    /**
     * Internal code of the error or warning, in human-readable format
     * @type {string}
     * @memberof StatusDetail
     */
    'code': string;
    /**
     * informational level of status detail: INFO,WARN, ERR ERR (error) by default 
     * @type {string}
     * @memberof StatusDetail
     */
    'level'?: string;
    /**
     * A human readable explanation specific to this occurrence of the problem.
     * @type {string}
     * @memberof StatusDetail
     */
    'detail'?: string;
}
/**
 * Tax object
 * @export
 * @interface Tax
 */
export interface Tax {
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof Tax
     */
    'taxType'?: string;
    /**
     * identification code of the ente
     * @type {string}
     * @memberof Tax
     */
    'installment'?: string;
    /**
     * reference year of the tax
     * @type {string}
     * @memberof Tax
     */
    'year'?: string;
    /**
     * debit amount of the tax
     * @type {string}
     * @memberof Tax
     */
    'debit'?: string;
    /**
     * credit amount of the tax
     * @type {string}
     * @memberof Tax
     */
    'credit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof Tax
     */
    'applyCost': boolean;
}
/**
 * Tax Residence (Domicilio Fiscale) object
 * @export
 * @interface TaxAddress
 */
export interface TaxAddress {
    /**
     * municipality of the tax address
     * @type {string}
     * @memberof TaxAddress
     */
    'municipality'?: string;
    /**
     * province of the tax address
     * @type {string}
     * @memberof TaxAddress
     */
    'province'?: string;
    /**
     * street and house number of the tax address
     * @type {string}
     * @memberof TaxAddress
     */
    'address'?: string;
}
/**
 * 
 * @export
 * @interface TaxPayerElide
 */
export interface TaxPayerElide {
    /**
     * Tax Payer Tax Code
     * @type {string}
     * @memberof TaxPayerElide
     */
    'taxCode'?: string;
    /**
     * 
     * @type {PersonData}
     * @memberof TaxPayerElide
     */
    'person'?: PersonData;
    /**
     * 
     * @type {CompanyData}
     * @memberof TaxPayerElide
     */
    'company'?: CompanyData;
    /**
     * It is the tax code of a relative of the main tax payer
     * @type {string}
     * @memberof TaxPayerElide
     */
    'relativePersonTaxCode'?: string;
    /**
     * identification code
     * @type {string}
     * @memberof TaxPayerElide
     */
    'id'?: string;
}
/**
 * 
 * @export
 * @interface TaxPayerExcise
 */
export interface TaxPayerExcise {
    /**
     * Tax Payer Tax Code
     * @type {string}
     * @memberof TaxPayerExcise
     */
    'taxCode'?: string;
    /**
     * field that show if the current year is included
     * @type {boolean}
     * @memberof TaxPayerExcise
     */
    'isNotTaxYear'?: boolean;
    /**
     * 
     * @type {PersonData}
     * @memberof TaxPayerExcise
     */
    'person'?: PersonData;
    /**
     * 
     * @type {CompanyData}
     * @memberof TaxPayerExcise
     */
    'company'?: CompanyData;
    /**
     * It is the tax code of a relative of the main tax payer
     * @type {string}
     * @memberof TaxPayerExcise
     */
    'relativePersonTaxCode'?: string;
    /**
     * identification code
     * @type {string}
     * @memberof TaxPayerExcise
     */
    'id'?: string;
}
/**
 * 
 * @export
 * @interface TaxPayerSimplified
 */
export interface TaxPayerSimplified {
    /**
     * Tax Payer Tax Code
     * @type {string}
     * @memberof TaxPayerSimplified
     */
    'taxCode'?: string;
    /**
     * 
     * @type {PersonalData}
     * @memberof TaxPayerSimplified
     */
    'personalData'?: PersonalData;
    /**
     * It is the tax code of a relative of the main tax payer
     * @type {string}
     * @memberof TaxPayerSimplified
     */
    'relativePersonTaxCode'?: string;
    /**
     * identification code
     * @type {string}
     * @memberof TaxPayerSimplified
     */
    'id'?: string;
    /**
     * identification code of the document
     * @type {string}
     * @memberof TaxPayerSimplified
     */
    'document'?: string;
    /**
     * identification code of the office
     * @type {string}
     * @memberof TaxPayerSimplified
     */
    'office'?: string;
}
/**
 * 
 * @export
 * @interface TaxPayerStandard
 */
export interface TaxPayerStandard {
    /**
     * Tax Payer Tax Code
     * @type {string}
     * @memberof TaxPayerStandard
     */
    'taxCode'?: string;
    /**
     * field that show if the current year is included
     * @type {boolean}
     * @memberof TaxPayerStandard
     */
    'isNotTaxYear'?: boolean;
    /**
     * 
     * @type {PersonData}
     * @memberof TaxPayerStandard
     */
    'person'?: PersonData;
    /**
     * 
     * @type {CompanyData}
     * @memberof TaxPayerStandard
     */
    'company'?: CompanyData;
    /**
     * It is the tax code of a relative of the main tax payer
     * @type {string}
     * @memberof TaxPayerStandard
     */
    'relativePersonTaxCode'?: string;
    /**
     * identification code
     * @type {string}
     * @memberof TaxPayerStandard
     */
    'id'?: string;
}
/**
 * stato di avanzamento del processo di notifica:`   * `SENDER_ACK_CREATION_REQUEST` - Invio della richiesta di creazione, firma e marca dell\'atto opponibile a terzi di presa in carico per il mittente a safe storage   * `VALIDATE_NORMALIZE_ADDRESSES_REQUEST` - Invio della richiesta di validazione e normalizzazione indirizzi fisici presenti nella richiesta di notifica   * `NORMALIZED_ADDRESS` - Salvataggio indirizzi normalizzati   * `REQUEST_ACCEPTED` - Richiesta di notifica accettata a seguito dei controlli di validazione   * `REQUEST_REFUSED` - Richiesta di notifica rifiutata per fallimento di validazione   * `SEND_COURTESY_MESSAGE` - Invio di un messaggio di cortesia   * `GET_ADDRESS` - Disponibilità dell’indirizzo specifico (domicilio digitale di piattaforma, domicilio digitale speciale, domicilio digitale generale, indirizzo fisico sulla notifica o sui registri nazionali)   * `PUBLIC_REGISTRY_CALL` - Richiesta ai registri pubblici per ottenere domicilio digitale generale o per ottenere indirizzo fisico da ANPR, da registro della imprese, da anagrafe tributaria.   * `PUBLIC_REGISTRY_RESPONSE` - Ricevuta la risposta dei registri pubblici   * `SCHEDULE_ANALOG_WORKFLOW` - Pianificazione del workflow per invio cartaceo   * `SCHEDULE_DIGITAL_WORKFLOW` -Pianificazione del workflow per invio digitale (PEC) del secondo tentativo in caso di fallimento del primo.   * `PREPARE_DIGITAL_DOMICILE` - Preparazione per l’invio dell’avviso digitale.Va a valutare la timeline per capire quale sarà il prossimo indirizzo da usare.   * `SEND_DIGITAL_DOMICILE` - Invio digitale dell’avviso di notifica   * `SEND_DIGITAL_PROGRESS` - Tentativo di Invio PEC ad un determinato indirizzo.   * `SEND_DIGITAL_FEEDBACK` - Ottenuto esito ad un invio digitale   * `SCHEDULE_REFINEMENT` - Pianificato il perfezionamento per decorrenza termini   * `REFINEMENT` - Perfezionamento per decorrenza termini   * `DIGITAL_DELIVERY_CREATION_REQUEST` - Invio della richiesta di creazione, firma e marca dell\'atto opponibile a terzi di chiusura del workflow digitale a safe storage   * `DIGITAL_SUCCESS_WORKFLOW` - Completato con successo il workflow di invio digitale   * `DIGITAL_FAILURE_WORKFLOW` - Completato con fallimento il workflow di invio digitale: tutti i tentativi di invio ai domicili digitali sono falliti.   * `ANALOG_SUCCESS_WORKFLOW` - Completato con successo il workflow di invio cartaceo   * `ANALOG_FAILURE_WORKFLOW` - Completato con fallimento il workflow di invio cartaceo NOTA: se per tutti i destinatari si conclude il workflow con fallimento verrà scatenato l’evento COMPLETELY_UNREACHABLE   * `PREPARE_SIMPLE_REGISTERED_LETTER` - Invio richiesta di prepare (preparazione ad invio) raccomandata semplice a paperChannel   * `SEND_SIMPLE_REGISTERED_LETTER` - Invio di raccomandata semplice   * `SEND_SIMPLE_REGISTERED_LETTER_PROGRESS` - Ricezione informazioni intermedia relative ad una notificazione cartacea semplice   * `NOTIFICATION_VIEWED_CREATION_REQUEST` - Invio della richiesta di creazione, firma e marca dell\'atto opponibile a terzi di presa visione a safe storage   * `NOTIFICATION_VIEWED` - Visualizzazione della notifica (perfeziona la notifica se non già perfezionata per decorrenza termini o da altro destinatario)   * `PREPARE_ANALOG_DOMICILE` - Invio richiesta di prepare (preparazione ad invio) cartaceo a paperChannel   * `SEND_ANALOG_DOMICILE` - Invio cartaceo dell’avviso di notifica   * `SEND_ANALOG_PROGRESS` - Ricezione informazioni intermedia relative ad una notificazione cartacea   * `SEND_ANALOG_FEEDBACK` - Ricezione esito dell\'invio cartaceo   * `COMPLETELY_UNREACHABLE_CREATION_REQUEST` - Invio della richiesta di creazione, firma e marca dell\'atto (simile a opponibile a terzi) di completamento con fallimento del workflow di invio cartaceo   * `COMPLETELY_UNREACHABLE` - Tutti i destinatari risultano irraggiungibili   * `AAR_CREATION_REQUEST` - Invio della richiesta di creazione, firma e marca dell\'AAR (Avviso di Avvenuta Ricezione) a safe storage   * `AAR_GENERATION` - Generazione dell’AAR (Avviso di Avvenuta Ricezione)   * `PAYMENT` - Evento di ricezione __dal mittente__ dell\'informazione di chiusura di uno o più pagamenti di tipo pagoPA (vedi #/components/schemas/PagoPaPayment). La presenza di questo evento inibisce l\'invio di eventuali comunicazioni analogiche future ma non perfeziona la notifica.   * `NOT_HANDLED` - [DEPRECATO] Per la sperimentazione l\'invio analogico non è previsto, viene inserito tale elemento di timeline   * `PROBABLE_SCHEDULING_ANALOG_DATE` - Data probabile di inizio del flusso analogico   * `NOTIFICATION_CANCELLATION_REQUEST` - Richiesta di annullamento di una notifica   * `NOTIFICATION_CANCELLED` - Notifica annullata   * `PREPARE_ANALOG_DOMICILE_FAILURE` - Fallimento della richiesta di prepare (preparazione ad invio) cartaceo a paperChannel   * `NOTIFICATION_RADD_RETRIEVED` - Accesso alla notifica tramite la rete RADD. Non perfeziona la notifica. 
 * @export
 * @enum {string}
 */

export const TimelineElementCategoryV23 = {
    SenderAckCreationRequest: 'SENDER_ACK_CREATION_REQUEST',
    ValidateNormalizeAddressesRequest: 'VALIDATE_NORMALIZE_ADDRESSES_REQUEST',
    NormalizedAddress: 'NORMALIZED_ADDRESS',
    RequestAccepted: 'REQUEST_ACCEPTED',
    SendCourtesyMessage: 'SEND_COURTESY_MESSAGE',
    GetAddress: 'GET_ADDRESS',
    PublicRegistryCall: 'PUBLIC_REGISTRY_CALL',
    PublicRegistryResponse: 'PUBLIC_REGISTRY_RESPONSE',
    ScheduleAnalogWorkflow: 'SCHEDULE_ANALOG_WORKFLOW',
    ScheduleDigitalWorkflow: 'SCHEDULE_DIGITAL_WORKFLOW',
    PrepareDigitalDomicile: 'PREPARE_DIGITAL_DOMICILE',
    SendDigitalDomicile: 'SEND_DIGITAL_DOMICILE',
    SendDigitalProgress: 'SEND_DIGITAL_PROGRESS',
    SendDigitalFeedback: 'SEND_DIGITAL_FEEDBACK',
    Refinement: 'REFINEMENT',
    ScheduleRefinement: 'SCHEDULE_REFINEMENT',
    DigitalDeliveryCreationRequest: 'DIGITAL_DELIVERY_CREATION_REQUEST',
    DigitalSuccessWorkflow: 'DIGITAL_SUCCESS_WORKFLOW',
    DigitalFailureWorkflow: 'DIGITAL_FAILURE_WORKFLOW',
    AnalogSuccessWorkflow: 'ANALOG_SUCCESS_WORKFLOW',
    AnalogFailureWorkflow: 'ANALOG_FAILURE_WORKFLOW',
    PrepareSimpleRegisteredLetter: 'PREPARE_SIMPLE_REGISTERED_LETTER',
    SendSimpleRegisteredLetter: 'SEND_SIMPLE_REGISTERED_LETTER',
    SendSimpleRegisteredLetterProgress: 'SEND_SIMPLE_REGISTERED_LETTER_PROGRESS',
    NotificationViewedCreationRequest: 'NOTIFICATION_VIEWED_CREATION_REQUEST',
    NotificationViewed: 'NOTIFICATION_VIEWED',
    PrepareAnalogDomicile: 'PREPARE_ANALOG_DOMICILE',
    SendAnalogDomicile: 'SEND_ANALOG_DOMICILE',
    SendAnalogProgress: 'SEND_ANALOG_PROGRESS',
    SendAnalogFeedback: 'SEND_ANALOG_FEEDBACK',
    Payment: 'PAYMENT',
    CompletelyUnreachable: 'COMPLETELY_UNREACHABLE',
    CompletelyUnreachableCreationRequest: 'COMPLETELY_UNREACHABLE_CREATION_REQUEST',
    RequestRefused: 'REQUEST_REFUSED',
    AarCreationRequest: 'AAR_CREATION_REQUEST',
    AarGeneration: 'AAR_GENERATION',
    NotHandled: 'NOT_HANDLED',
    ProbableSchedulingAnalogDate: 'PROBABLE_SCHEDULING_ANALOG_DATE',
    NotificationCancellationRequest: 'NOTIFICATION_CANCELLATION_REQUEST',
    NotificationCancelled: 'NOTIFICATION_CANCELLED',
    PrepareAnalogDomicileFailure: 'PREPARE_ANALOG_DOMICILE_FAILURE',
    NotificationRaddRetrieved: 'NOTIFICATION_RADD_RETRIEVED'
} as const;

export type TimelineElementCategoryV23 = typeof TimelineElementCategoryV23[keyof typeof TimelineElementCategoryV23];


/**
 * @type TimelineElementDetailsV23
 * The raw event payload that will be different based on the event.
 * @export
 */
export type TimelineElementDetailsV23 = AarCreationRequestDetails | AarGenerationDetails | AnalogFailureWorkflowDetails | AnalogSuccessWorkflowDetails | BaseAnalogDetails | BaseRegisteredLetterDetails | CompletelyUnreachableCreationRequestDetails | CompletelyUnreachableDetails | DigitalDeliveryCreationRequestDetails | DigitalFailureWorkflowDetails | DigitalSuccessWorkflowDetails | GetAddressInfoDetails | NormalizedAddressDetails | NotHandledDetails | NotificationCancellationRequestDetails | NotificationCancelledDetails | NotificationPaidDetailsV23 | NotificationRADDRetrievedDetails | NotificationRequestAcceptedDetails | NotificationViewedCreationRequestDetailsV23 | NotificationViewedDetailsV23 | PrepareAnalogDomicileFailureDetails | PrepareDigitalDetails | ProbableDateAnalogWorkflowDetails | PublicRegistryCallDetails | PublicRegistryResponseDetails | RefinementDetailsV23 | RequestRefusedDetailsV23 | ScheduleAnalogWorkflowDetailsV23 | ScheduleDigitalWorkflowDetailsV23 | ScheduleRefinementDetails | SendAnalogDetails | SendAnalogFeedbackDetails | SendAnalogProgressDetailsV23 | SendCourtesyMessageDetails | SendDigitalDetails | SendDigitalFeedbackDetails | SendDigitalProgressDetailsV23 | SenderAckCreationRequestDetails | SimpleRegisteredLetterDetails | SimpleRegisteredLetterProgressDetails;

/**
 * 
 * @export
 * @interface TimelineElementV23
 */
export interface TimelineElementV23 {
    /**
     * Identificativo dell\'elemento di timeline: insieme allo IUN della notifica definisce in maniera univoca l\'elemento di timeline
     * @type {string}
     * @memberof TimelineElementV23
     */
    'elementId'?: string;
    /**
     * Momento in cui avviene l\'evento descritto in questo elemento di timeline
     * @type {string}
     * @memberof TimelineElementV23
     */
    'timestamp'?: string;
    /**
     * Chiavi dei documenti che provano l\'effettivo accadimento dell\'evento descritto in timeline. Questo elemento
     * @type {Array<LegalFactsId>}
     * @memberof TimelineElementV23
     */
    'legalFactsIds'?: Array<LegalFactsId>;
    /**
     * 
     * @type {TimelineElementCategoryV23}
     * @memberof TimelineElementV23
     */
    'category'?: TimelineElementCategoryV23;
    /**
     * 
     * @type {TimelineElementDetailsV23}
     * @memberof TimelineElementV23
     */
    'details'?: TimelineElementDetailsV23;
}


/**
 * Treasury ans Other Section (Sezione Erario e Altro) object
 * @export
 * @interface TreasuryAndOtherSection
 */
export interface TreasuryAndOtherSection {
    /**
     * identification code of the office
     * @type {string}
     * @memberof TreasuryAndOtherSection
     */
    'office'?: string;
    /**
     * identification code of the document
     * @type {string}
     * @memberof TreasuryAndOtherSection
     */
    'document'?: string;
    /**
     * Treasury Records
     * @type {Array<TreasuryRecord>}
     * @memberof TreasuryAndOtherSection
     */
    'records'?: Array<TreasuryRecord>;
}
/**
 * Treasury Record object
 * @export
 * @interface TreasuryRecord
 */
export interface TreasuryRecord {
    /**
     * type of treasury
     * @type {string}
     * @memberof TreasuryRecord
     */
    'type'?: string;
    /**
     * identification code of the element
     * @type {string}
     * @memberof TreasuryRecord
     */
    'id'?: string;
    /**
     * identification code of the type of tax
     * @type {string}
     * @memberof TreasuryRecord
     */
    'taxType'?: string;
    /**
     * referance year
     * @type {string}
     * @memberof TreasuryRecord
     */
    'year'?: string;
    /**
     * debit amount of the record
     * @type {string}
     * @memberof TreasuryRecord
     */
    'debit'?: string;
    /**
     * to check if include notification cost
     * @type {boolean}
     * @memberof TreasuryRecord
     */
    'applyCost': boolean;
}
/**
 * Treasury Section (Sezione Erario) object
 * @export
 * @interface TreasurySection
 */
export interface TreasurySection {
    /**
     * list of the taxes
     * @type {Array<Tax>}
     * @memberof TreasurySection
     */
    'records'?: Array<Tax>;
    /**
     * identification code of the office
     * @type {string}
     * @memberof TreasurySection
     */
    'office'?: string;
    /**
     * identification code of the document
     * @type {string}
     * @memberof TreasurySection
     */
    'document'?: string;
}

/**
 * HealthCheckApi - axios parameter creator
 * @export
 */
export const HealthCheckApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * status path per verificare lo stato di Piattaforma Notifiche
         * @summary status path
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        status: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/status`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * HealthCheckApi - functional programming interface
 * @export
 */
export const HealthCheckApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = HealthCheckApiAxiosParamCreator(configuration)
    return {
        /**
         * status path per verificare lo stato di Piattaforma Notifiche
         * @summary status path
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async status(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<PnStatusResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.status(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['HealthCheckApi.status']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * HealthCheckApi - factory interface
 * @export
 */
export const HealthCheckApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = HealthCheckApiFp(configuration)
    return {
        /**
         * status path per verificare lo stato di Piattaforma Notifiche
         * @summary status path
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        status(options?: any): AxiosPromise<PnStatusResponse> {
            return localVarFp.status(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * HealthCheckApi - object-oriented interface
 * @export
 * @class HealthCheckApi
 * @extends {BaseAPI}
 */
export class HealthCheckApi extends BaseAPI {
    /**
     * status path per verificare lo stato di Piattaforma Notifiche
     * @summary status path
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof HealthCheckApi
     */
    public status(options?: RawAxiosRequestConfig) {
        return HealthCheckApiFp(this.configuration).status(options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * NewNotificationApi - axios parameter creator
 * @export
 */
export const NewNotificationApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Operazione che richiede a Piattaforma Notifica le informazioni e le autorizzazioni necessarie  a precaricare uno o più file da allegare a una notifica. <br/>
         * @summary Richiesta di pre-caricamento dei documenti della notifica
         * @param {Array<PreLoadRequest>} preLoadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        presignedUploadRequest: async (preLoadRequest: Array<PreLoadRequest>, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'preLoadRequest' is not null or undefined
            assertParamExists('presignedUploadRequest', 'preLoadRequest', preLoadRequest)
            const localVarPath = `/delivery/attachments/preload`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(preLoadRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Operazione utilizzata dalla Pubblica Amministrazione per richiedere l\'invio di una notifica.  La restituzione di uno stato HTTP 202 significa solo che la richiesta è sintatticamente valida, non che la richiesta sia stata validata ed accettata. <br/> Per conoscere lo stato di accettazione della richiesta di notifica bisogna utilizzare l\'operazione _getNotificationRequestStatus_ oppure utilizzare la modalità push prevista dai webhook. <br/>
         * @summary Richiesta invio notifica
         * @param {NewNotificationRequestV23} newNotificationRequestV23 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        sendNewNotificationV23: async (newNotificationRequestV23: NewNotificationRequestV23, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'newNotificationRequestV23' is not null or undefined
            assertParamExists('sendNewNotificationV23', 'newNotificationRequestV23', newNotificationRequestV23)
            const localVarPath = `/delivery/v2.3/requests`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(newNotificationRequestV23, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * NewNotificationApi - functional programming interface
 * @export
 */
export const NewNotificationApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = NewNotificationApiAxiosParamCreator(configuration)
    return {
        /**
         * Operazione che richiede a Piattaforma Notifica le informazioni e le autorizzazioni necessarie  a precaricare uno o più file da allegare a una notifica. <br/>
         * @summary Richiesta di pre-caricamento dei documenti della notifica
         * @param {Array<PreLoadRequest>} preLoadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async presignedUploadRequest(preLoadRequest: Array<PreLoadRequest>, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<PreLoadResponse>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.presignedUploadRequest(preLoadRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['NewNotificationApi.presignedUploadRequest']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Operazione utilizzata dalla Pubblica Amministrazione per richiedere l\'invio di una notifica.  La restituzione di uno stato HTTP 202 significa solo che la richiesta è sintatticamente valida, non che la richiesta sia stata validata ed accettata. <br/> Per conoscere lo stato di accettazione della richiesta di notifica bisogna utilizzare l\'operazione _getNotificationRequestStatus_ oppure utilizzare la modalità push prevista dai webhook. <br/>
         * @summary Richiesta invio notifica
         * @param {NewNotificationRequestV23} newNotificationRequestV23 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async sendNewNotificationV23(newNotificationRequestV23: NewNotificationRequestV23, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<NewNotificationResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.sendNewNotificationV23(newNotificationRequestV23, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['NewNotificationApi.sendNewNotificationV23']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * NewNotificationApi - factory interface
 * @export
 */
export const NewNotificationApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = NewNotificationApiFp(configuration)
    return {
        /**
         * Operazione che richiede a Piattaforma Notifica le informazioni e le autorizzazioni necessarie  a precaricare uno o più file da allegare a una notifica. <br/>
         * @summary Richiesta di pre-caricamento dei documenti della notifica
         * @param {Array<PreLoadRequest>} preLoadRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        presignedUploadRequest(preLoadRequest: Array<PreLoadRequest>, options?: any): AxiosPromise<Array<PreLoadResponse>> {
            return localVarFp.presignedUploadRequest(preLoadRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Operazione utilizzata dalla Pubblica Amministrazione per richiedere l\'invio di una notifica.  La restituzione di uno stato HTTP 202 significa solo che la richiesta è sintatticamente valida, non che la richiesta sia stata validata ed accettata. <br/> Per conoscere lo stato di accettazione della richiesta di notifica bisogna utilizzare l\'operazione _getNotificationRequestStatus_ oppure utilizzare la modalità push prevista dai webhook. <br/>
         * @summary Richiesta invio notifica
         * @param {NewNotificationRequestV23} newNotificationRequestV23 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        sendNewNotificationV23(newNotificationRequestV23: NewNotificationRequestV23, options?: any): AxiosPromise<NewNotificationResponse> {
            return localVarFp.sendNewNotificationV23(newNotificationRequestV23, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * NewNotificationApi - object-oriented interface
 * @export
 * @class NewNotificationApi
 * @extends {BaseAPI}
 */
export class NewNotificationApi extends BaseAPI {
    /**
     * Operazione che richiede a Piattaforma Notifica le informazioni e le autorizzazioni necessarie  a precaricare uno o più file da allegare a una notifica. <br/>
     * @summary Richiesta di pre-caricamento dei documenti della notifica
     * @param {Array<PreLoadRequest>} preLoadRequest 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewNotificationApi
     */
    public presignedUploadRequest(preLoadRequest: Array<PreLoadRequest>, options?: RawAxiosRequestConfig) {
        return NewNotificationApiFp(this.configuration).presignedUploadRequest(preLoadRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Operazione utilizzata dalla Pubblica Amministrazione per richiedere l\'invio di una notifica.  La restituzione di uno stato HTTP 202 significa solo che la richiesta è sintatticamente valida, non che la richiesta sia stata validata ed accettata. <br/> Per conoscere lo stato di accettazione della richiesta di notifica bisogna utilizzare l\'operazione _getNotificationRequestStatus_ oppure utilizzare la modalità push prevista dai webhook. <br/>
     * @summary Richiesta invio notifica
     * @param {NewNotificationRequestV23} newNotificationRequestV23 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NewNotificationApi
     */
    public sendNewNotificationV23(newNotificationRequestV23: NewNotificationRequestV23, options?: RawAxiosRequestConfig) {
        return NewNotificationApiFp(this.configuration).sendNewNotificationV23(newNotificationRequestV23, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * NotificationPriceV23Api - axios parameter creator
 * @export
 */
export const NotificationPriceV23ApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Usata dagli enti per recuperare il costo di notificazione tramite l\'identificativo della posizione debitoria paTaxId e noticeCode. Viene restituito sia il costo parziale che il costo totale di notificazione.
         * @summary Retrieve notification partial price and total price with effective date
         * @param {string} paTaxId Payment PA fiscal code
         * @param {string} noticeCode Payment notice number  numero avviso
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveNotificationPriceV23: async (paTaxId: string, noticeCode: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'paTaxId' is not null or undefined
            assertParamExists('retrieveNotificationPriceV23', 'paTaxId', paTaxId)
            // verify required parameter 'noticeCode' is not null or undefined
            assertParamExists('retrieveNotificationPriceV23', 'noticeCode', noticeCode)
            const localVarPath = `/delivery/v2.3/price/{paTaxId}/{noticeCode}`
                .replace(`{${"paTaxId"}}`, encodeURIComponent(String(paTaxId)))
                .replace(`{${"noticeCode"}}`, encodeURIComponent(String(noticeCode)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * NotificationPriceV23Api - functional programming interface
 * @export
 */
export const NotificationPriceV23ApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = NotificationPriceV23ApiAxiosParamCreator(configuration)
    return {
        /**
         * Usata dagli enti per recuperare il costo di notificazione tramite l\'identificativo della posizione debitoria paTaxId e noticeCode. Viene restituito sia il costo parziale che il costo totale di notificazione.
         * @summary Retrieve notification partial price and total price with effective date
         * @param {string} paTaxId Payment PA fiscal code
         * @param {string} noticeCode Payment notice number  numero avviso
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveNotificationPriceV23(paTaxId: string, noticeCode: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<NotificationPriceResponseV23>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveNotificationPriceV23(paTaxId, noticeCode, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['NotificationPriceV23Api.retrieveNotificationPriceV23']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * NotificationPriceV23Api - factory interface
 * @export
 */
export const NotificationPriceV23ApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = NotificationPriceV23ApiFp(configuration)
    return {
        /**
         * Usata dagli enti per recuperare il costo di notificazione tramite l\'identificativo della posizione debitoria paTaxId e noticeCode. Viene restituito sia il costo parziale che il costo totale di notificazione.
         * @summary Retrieve notification partial price and total price with effective date
         * @param {string} paTaxId Payment PA fiscal code
         * @param {string} noticeCode Payment notice number  numero avviso
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveNotificationPriceV23(paTaxId: string, noticeCode: string, options?: any): AxiosPromise<NotificationPriceResponseV23> {
            return localVarFp.retrieveNotificationPriceV23(paTaxId, noticeCode, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * NotificationPriceV23Api - object-oriented interface
 * @export
 * @class NotificationPriceV23Api
 * @extends {BaseAPI}
 */
export class NotificationPriceV23Api extends BaseAPI {
    /**
     * Usata dagli enti per recuperare il costo di notificazione tramite l\'identificativo della posizione debitoria paTaxId e noticeCode. Viene restituito sia il costo parziale che il costo totale di notificazione.
     * @summary Retrieve notification partial price and total price with effective date
     * @param {string} paTaxId Payment PA fiscal code
     * @param {string} noticeCode Payment notice number  numero avviso
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof NotificationPriceV23Api
     */
    public retrieveNotificationPriceV23(paTaxId: string, noticeCode: string, options?: RawAxiosRequestConfig) {
        return NotificationPriceV23ApiFp(this.configuration).retrieveNotificationPriceV23(paTaxId, noticeCode, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * PaymentEventsApi - axios parameter creator
 * @export
 */
export const PaymentEventsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo F24. <br/>
         * @param {PaymentEventsRequestF24} paymentEventsRequestF24 
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        paymentEventsRequestF24: async (paymentEventsRequestF24: PaymentEventsRequestF24, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'paymentEventsRequestF24' is not null or undefined
            assertParamExists('paymentEventsRequestF24', 'paymentEventsRequestF24', paymentEventsRequestF24)
            const localVarPath = `/delivery/events/payment/f24`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(paymentEventsRequestF24, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo PagoPA. <br/>
         * @param {PaymentEventsRequestPagoPa} paymentEventsRequestPagoPa 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        paymentEventsRequestPagoPa: async (paymentEventsRequestPagoPa: PaymentEventsRequestPagoPa, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'paymentEventsRequestPagoPa' is not null or undefined
            assertParamExists('paymentEventsRequestPagoPa', 'paymentEventsRequestPagoPa', paymentEventsRequestPagoPa)
            const localVarPath = `/delivery/events/payment/pagopa`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(paymentEventsRequestPagoPa, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * PaymentEventsApi - functional programming interface
 * @export
 */
export const PaymentEventsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = PaymentEventsApiAxiosParamCreator(configuration)
    return {
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo F24. <br/>
         * @param {PaymentEventsRequestF24} paymentEventsRequestF24 
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        async paymentEventsRequestF24(paymentEventsRequestF24: PaymentEventsRequestF24, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.paymentEventsRequestF24(paymentEventsRequestF24, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['PaymentEventsApi.paymentEventsRequestF24']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo PagoPA. <br/>
         * @param {PaymentEventsRequestPagoPa} paymentEventsRequestPagoPa 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async paymentEventsRequestPagoPa(paymentEventsRequestPagoPa: PaymentEventsRequestPagoPa, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.paymentEventsRequestPagoPa(paymentEventsRequestPagoPa, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['PaymentEventsApi.paymentEventsRequestPagoPa']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * PaymentEventsApi - factory interface
 * @export
 */
export const PaymentEventsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = PaymentEventsApiFp(configuration)
    return {
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo F24. <br/>
         * @param {PaymentEventsRequestF24} paymentEventsRequestF24 
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        paymentEventsRequestF24(paymentEventsRequestF24: PaymentEventsRequestF24, options?: any): AxiosPromise<void> {
            return localVarFp.paymentEventsRequestF24(paymentEventsRequestF24, options).then((request) => request(axios, basePath));
        },
        /**
         * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo PagoPA. <br/>
         * @param {PaymentEventsRequestPagoPa} paymentEventsRequestPagoPa 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        paymentEventsRequestPagoPa(paymentEventsRequestPagoPa: PaymentEventsRequestPagoPa, options?: any): AxiosPromise<void> {
            return localVarFp.paymentEventsRequestPagoPa(paymentEventsRequestPagoPa, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * PaymentEventsApi - object-oriented interface
 * @export
 * @class PaymentEventsApi
 * @extends {BaseAPI}
 */
export class PaymentEventsApi extends BaseAPI {
    /**
     * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo F24. <br/>
     * @param {PaymentEventsRequestF24} paymentEventsRequestF24 
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof PaymentEventsApi
     */
    public paymentEventsRequestF24(paymentEventsRequestF24: PaymentEventsRequestF24, options?: RawAxiosRequestConfig) {
        return PaymentEventsApiFp(this.configuration).paymentEventsRequestF24(paymentEventsRequestF24, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Questa API è a disposizione della Pubblica Amministrazione per inviare eventi di chiusura di una o più posizioni debitorie di tipo PagoPA. <br/>
     * @param {PaymentEventsRequestPagoPa} paymentEventsRequestPagoPa 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PaymentEventsApi
     */
    public paymentEventsRequestPagoPa(paymentEventsRequestPagoPa: PaymentEventsRequestPagoPa, options?: RawAxiosRequestConfig) {
        return PaymentEventsApiFp(this.configuration).paymentEventsRequestPagoPa(paymentEventsRequestPagoPa, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * SenderReadB2BApi - axios parameter creator
 * @export
 */
export const SenderReadB2BApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Questa operazione serve per verificare se la richiesta di notifica è stata accettata e ottenere lo IUN associato a tale richiesta. <br/> Bisogna specificare il parametro _requestId_ oppure la coppia costituita dai parametri  _paProtocolNumber_ e _idempotenceToken_. <br/>
         * @summary Verifica accettazione richiesta notifica
         * @param {string} [notificationRequestId] identificativo della richiesta di notifica
         * @param {string} [paProtocolNumber] Numero di protocollo associato alla notifica, può essere riutilizzato per rettifiche.
         * @param {string} [idempotenceToken] token usato per disambiguare \&quot;richieste di notificazione\&quot; effettuate con lo stesso  numero di protocollo.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveNotificationRequestStatusV23: async (notificationRequestId?: string, paProtocolNumber?: string, idempotenceToken?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/delivery/v2.3/requests`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)

            if (notificationRequestId !== undefined) {
                localVarQueryParameter['notificationRequestId'] = notificationRequestId;
            }

            if (paProtocolNumber !== undefined) {
                localVarQueryParameter['paProtocolNumber'] = paProtocolNumber;
            }

            if (idempotenceToken !== undefined) {
                localVarQueryParameter['idempotenceToken'] = idempotenceToken;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Download allegato per pagamento
         * @summary Download allegato per pagamento
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} recipientIdx indice del destinatario nella lista partendo da 0.
         * @param {string} attachmentName Tipologia del pagamento allegato alla notifica. Valori possibili PAGOPA|F24
         * @param {number} [attachmentIdx] indice del documento di pagamento partendo da 0
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationAttachment: async (iun: string, recipientIdx: number, attachmentName: string, attachmentIdx?: number, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'iun' is not null or undefined
            assertParamExists('retrieveSentNotificationAttachment', 'iun', iun)
            // verify required parameter 'recipientIdx' is not null or undefined
            assertParamExists('retrieveSentNotificationAttachment', 'recipientIdx', recipientIdx)
            // verify required parameter 'attachmentName' is not null or undefined
            assertParamExists('retrieveSentNotificationAttachment', 'attachmentName', attachmentName)
            const localVarPath = `/delivery/notifications/sent/{iun}/attachments/payment/{recipientIdx}/{attachmentName}`
                .replace(`{${"iun"}}`, encodeURIComponent(String(iun)))
                .replace(`{${"recipientIdx"}}`, encodeURIComponent(String(recipientIdx)))
                .replace(`{${"attachmentName"}}`, encodeURIComponent(String(attachmentName)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)

            if (attachmentIdx !== undefined) {
                localVarQueryParameter['attachmentIdx'] = attachmentIdx;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Download documento notificato
         * @summary Download documento notificato
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} docIdx indice del documento nella lista partendo da 0.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationDocument: async (iun: string, docIdx: number, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'iun' is not null or undefined
            assertParamExists('retrieveSentNotificationDocument', 'iun', iun)
            // verify required parameter 'docIdx' is not null or undefined
            assertParamExists('retrieveSentNotificationDocument', 'docIdx', docIdx)
            const localVarPath = `/delivery/notifications/sent/{iun}/attachments/documents/{docIdx}`
                .replace(`{${"iun"}}`, encodeURIComponent(String(iun)))
                .replace(`{${"docIdx"}}`, encodeURIComponent(String(docIdx)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Questa operazione permette di leggere tutti i dettagli di una notifica accettata. <br/>
         * @summary Mittente: lettura dettagli notifica versione 2
         * @param {string} iun Identificativo Univoco Notifica
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationV23: async (iun: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'iun' is not null or undefined
            assertParamExists('retrieveSentNotificationV23', 'iun', iun)
            const localVarPath = `/delivery/v2.3/notifications/sent/{iun}`
                .replace(`{${"iun"}}`, encodeURIComponent(String(iun)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication ApiKeyAuth required
            await setApiKeyToObject(localVarHeaderParameter, "x-api-key", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * SenderReadB2BApi - functional programming interface
 * @export
 */
export const SenderReadB2BApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = SenderReadB2BApiAxiosParamCreator(configuration)
    return {
        /**
         * Questa operazione serve per verificare se la richiesta di notifica è stata accettata e ottenere lo IUN associato a tale richiesta. <br/> Bisogna specificare il parametro _requestId_ oppure la coppia costituita dai parametri  _paProtocolNumber_ e _idempotenceToken_. <br/>
         * @summary Verifica accettazione richiesta notifica
         * @param {string} [notificationRequestId] identificativo della richiesta di notifica
         * @param {string} [paProtocolNumber] Numero di protocollo associato alla notifica, può essere riutilizzato per rettifiche.
         * @param {string} [idempotenceToken] token usato per disambiguare \&quot;richieste di notificazione\&quot; effettuate con lo stesso  numero di protocollo.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveNotificationRequestStatusV23(notificationRequestId?: string, paProtocolNumber?: string, idempotenceToken?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<NewNotificationRequestStatusResponseV23>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveNotificationRequestStatusV23(notificationRequestId, paProtocolNumber, idempotenceToken, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['SenderReadB2BApi.retrieveNotificationRequestStatusV23']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Download allegato per pagamento
         * @summary Download allegato per pagamento
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} recipientIdx indice del destinatario nella lista partendo da 0.
         * @param {string} attachmentName Tipologia del pagamento allegato alla notifica. Valori possibili PAGOPA|F24
         * @param {number} [attachmentIdx] indice del documento di pagamento partendo da 0
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveSentNotificationAttachment(iun: string, recipientIdx: number, attachmentName: string, attachmentIdx?: number, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<NotificationAttachmentDownloadMetadataResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveSentNotificationAttachment(iun, recipientIdx, attachmentName, attachmentIdx, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['SenderReadB2BApi.retrieveSentNotificationAttachment']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Download documento notificato
         * @summary Download documento notificato
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} docIdx indice del documento nella lista partendo da 0.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveSentNotificationDocument(iun: string, docIdx: number, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<NotificationAttachmentDownloadMetadataResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveSentNotificationDocument(iun, docIdx, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['SenderReadB2BApi.retrieveSentNotificationDocument']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Questa operazione permette di leggere tutti i dettagli di una notifica accettata. <br/>
         * @summary Mittente: lettura dettagli notifica versione 2
         * @param {string} iun Identificativo Univoco Notifica
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async retrieveSentNotificationV23(iun: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<FullSentNotificationV23>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveSentNotificationV23(iun, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['SenderReadB2BApi.retrieveSentNotificationV23']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * SenderReadB2BApi - factory interface
 * @export
 */
export const SenderReadB2BApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = SenderReadB2BApiFp(configuration)
    return {
        /**
         * Questa operazione serve per verificare se la richiesta di notifica è stata accettata e ottenere lo IUN associato a tale richiesta. <br/> Bisogna specificare il parametro _requestId_ oppure la coppia costituita dai parametri  _paProtocolNumber_ e _idempotenceToken_. <br/>
         * @summary Verifica accettazione richiesta notifica
         * @param {string} [notificationRequestId] identificativo della richiesta di notifica
         * @param {string} [paProtocolNumber] Numero di protocollo associato alla notifica, può essere riutilizzato per rettifiche.
         * @param {string} [idempotenceToken] token usato per disambiguare \&quot;richieste di notificazione\&quot; effettuate con lo stesso  numero di protocollo.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveNotificationRequestStatusV23(notificationRequestId?: string, paProtocolNumber?: string, idempotenceToken?: string, options?: any): AxiosPromise<NewNotificationRequestStatusResponseV23> {
            return localVarFp.retrieveNotificationRequestStatusV23(notificationRequestId, paProtocolNumber, idempotenceToken, options).then((request) => request(axios, basePath));
        },
        /**
         * Download allegato per pagamento
         * @summary Download allegato per pagamento
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} recipientIdx indice del destinatario nella lista partendo da 0.
         * @param {string} attachmentName Tipologia del pagamento allegato alla notifica. Valori possibili PAGOPA|F24
         * @param {number} [attachmentIdx] indice del documento di pagamento partendo da 0
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationAttachment(iun: string, recipientIdx: number, attachmentName: string, attachmentIdx?: number, options?: any): AxiosPromise<NotificationAttachmentDownloadMetadataResponse> {
            return localVarFp.retrieveSentNotificationAttachment(iun, recipientIdx, attachmentName, attachmentIdx, options).then((request) => request(axios, basePath));
        },
        /**
         * Download documento notificato
         * @summary Download documento notificato
         * @param {string} iun Identificativo Univoco Notifica
         * @param {number} docIdx indice del documento nella lista partendo da 0.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationDocument(iun: string, docIdx: number, options?: any): AxiosPromise<NotificationAttachmentDownloadMetadataResponse> {
            return localVarFp.retrieveSentNotificationDocument(iun, docIdx, options).then((request) => request(axios, basePath));
        },
        /**
         * Questa operazione permette di leggere tutti i dettagli di una notifica accettata. <br/>
         * @summary Mittente: lettura dettagli notifica versione 2
         * @param {string} iun Identificativo Univoco Notifica
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveSentNotificationV23(iun: string, options?: any): AxiosPromise<FullSentNotificationV23> {
            return localVarFp.retrieveSentNotificationV23(iun, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * SenderReadB2BApi - object-oriented interface
 * @export
 * @class SenderReadB2BApi
 * @extends {BaseAPI}
 */
export class SenderReadB2BApi extends BaseAPI {
    /**
     * Questa operazione serve per verificare se la richiesta di notifica è stata accettata e ottenere lo IUN associato a tale richiesta. <br/> Bisogna specificare il parametro _requestId_ oppure la coppia costituita dai parametri  _paProtocolNumber_ e _idempotenceToken_. <br/>
     * @summary Verifica accettazione richiesta notifica
     * @param {string} [notificationRequestId] identificativo della richiesta di notifica
     * @param {string} [paProtocolNumber] Numero di protocollo associato alla notifica, può essere riutilizzato per rettifiche.
     * @param {string} [idempotenceToken] token usato per disambiguare \&quot;richieste di notificazione\&quot; effettuate con lo stesso  numero di protocollo.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SenderReadB2BApi
     */
    public retrieveNotificationRequestStatusV23(notificationRequestId?: string, paProtocolNumber?: string, idempotenceToken?: string, options?: RawAxiosRequestConfig) {
        return SenderReadB2BApiFp(this.configuration).retrieveNotificationRequestStatusV23(notificationRequestId, paProtocolNumber, idempotenceToken, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Download allegato per pagamento
     * @summary Download allegato per pagamento
     * @param {string} iun Identificativo Univoco Notifica
     * @param {number} recipientIdx indice del destinatario nella lista partendo da 0.
     * @param {string} attachmentName Tipologia del pagamento allegato alla notifica. Valori possibili PAGOPA|F24
     * @param {number} [attachmentIdx] indice del documento di pagamento partendo da 0
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SenderReadB2BApi
     */
    public retrieveSentNotificationAttachment(iun: string, recipientIdx: number, attachmentName: string, attachmentIdx?: number, options?: RawAxiosRequestConfig) {
        return SenderReadB2BApiFp(this.configuration).retrieveSentNotificationAttachment(iun, recipientIdx, attachmentName, attachmentIdx, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Download documento notificato
     * @summary Download documento notificato
     * @param {string} iun Identificativo Univoco Notifica
     * @param {number} docIdx indice del documento nella lista partendo da 0.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SenderReadB2BApi
     */
    public retrieveSentNotificationDocument(iun: string, docIdx: number, options?: RawAxiosRequestConfig) {
        return SenderReadB2BApiFp(this.configuration).retrieveSentNotificationDocument(iun, docIdx, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Questa operazione permette di leggere tutti i dettagli di una notifica accettata. <br/>
     * @summary Mittente: lettura dettagli notifica versione 2
     * @param {string} iun Identificativo Univoco Notifica
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof SenderReadB2BApi
     */
    public retrieveSentNotificationV23(iun: string, options?: RawAxiosRequestConfig) {
        return SenderReadB2BApiFp(this.configuration).retrieveSentNotificationV23(iun, options).then((request) => request(this.axios, this.basePath));
    }
}



