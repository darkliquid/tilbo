import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace tilbo. */
export namespace tilbo {

    /** Namespace ipc. */
    namespace ipc {

        /** Namespace v1. */
        namespace v1 {

            /** Properties of an Envelope. */
            interface IEnvelope {

                /** Envelope requestId */
                requestId?: (number|Long|null);

                /** Envelope request */
                request?: (tilbo.ipc.v1.IRequest|null);

                /** Envelope response */
                response?: (tilbo.ipc.v1.IResponse|null);

                /** Envelope event */
                event?: (tilbo.ipc.v1.IEvent|null);
            }

            /** Represents an Envelope. */
            class Envelope implements IEnvelope {

                /**
                 * Constructs a new Envelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IEnvelope);

                /** Envelope requestId. */
                public requestId: (number|Long);

                /** Envelope request. */
                public request?: (tilbo.ipc.v1.IRequest|null);

                /** Envelope response. */
                public response?: (tilbo.ipc.v1.IResponse|null);

                /** Envelope event. */
                public event?: (tilbo.ipc.v1.IEvent|null);

                /** Envelope payload. */
                public payload?: ("request"|"response"|"event");

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Envelope instance
                 */
                public static create(properties?: tilbo.ipc.v1.IEnvelope): tilbo.ipc.v1.Envelope;

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link tilbo.ipc.v1.Envelope.verify|verify} messages.
                 * @param message Envelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Envelope message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Envelope.verify|verify} messages.
                 * @param message Envelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.Envelope;

                /**
                 * Decodes an Envelope message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.Envelope;

                /**
                 * Verifies an Envelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Envelope
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.Envelope;

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @param message Envelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Envelope to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Envelope
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a Request. */
            interface IRequest {

                /** Request search */
                search?: (tilbo.ipc.v1.ISearchRequest|null);

                /** Request tag */
                tag?: (tilbo.ipc.v1.ITagRequest|null);

                /** Request metadata */
                metadata?: (tilbo.ipc.v1.IMetadataRequest|null);

                /** Request metadataSet */
                metadataSet?: (tilbo.ipc.v1.IMetadataSetRequest|null);

                /** Request related */
                related?: (tilbo.ipc.v1.IRelatedRequest|null);

                /** Request status */
                status?: (tilbo.ipc.v1.IStatusRequest|null);

                /** Request reloadRules */
                reloadRules?: (tilbo.ipc.v1.IReloadRulesRequest|null);

                /** Request listTags */
                listTags?: (tilbo.ipc.v1.IListTagsRequest|null);

                /** Request hydrateTags */
                hydrateTags?: (tilbo.ipc.v1.IHydrateTagsRequest|null);

                /** Request listDirectory */
                listDirectory?: (tilbo.ipc.v1.IListDirectoryRequest|null);

                /** Request statFile */
                statFile?: (tilbo.ipc.v1.IStatFileRequest|null);

                /** Request globSearch */
                globSearch?: (tilbo.ipc.v1.IGlobSearchRequest|null);

                /** Request renameFile */
                renameFile?: (tilbo.ipc.v1.IRenameFileRequest|null);

                /** Request deleteFile */
                deleteFile?: (tilbo.ipc.v1.IDeleteFileRequest|null);

                /** Request chmodFile */
                chmodFile?: (tilbo.ipc.v1.IChmodFileRequest|null);

                /** Request listPlaces */
                listPlaces?: (tilbo.ipc.v1.IListPlacesRequest|null);
            }

            /** Represents a Request. */
            class Request implements IRequest {

                /**
                 * Constructs a new Request.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRequest);

                /** Request search. */
                public search?: (tilbo.ipc.v1.ISearchRequest|null);

                /** Request tag. */
                public tag?: (tilbo.ipc.v1.ITagRequest|null);

                /** Request metadata. */
                public metadata?: (tilbo.ipc.v1.IMetadataRequest|null);

                /** Request metadataSet. */
                public metadataSet?: (tilbo.ipc.v1.IMetadataSetRequest|null);

                /** Request related. */
                public related?: (tilbo.ipc.v1.IRelatedRequest|null);

                /** Request status. */
                public status?: (tilbo.ipc.v1.IStatusRequest|null);

                /** Request reloadRules. */
                public reloadRules?: (tilbo.ipc.v1.IReloadRulesRequest|null);

                /** Request listTags. */
                public listTags?: (tilbo.ipc.v1.IListTagsRequest|null);

                /** Request hydrateTags. */
                public hydrateTags?: (tilbo.ipc.v1.IHydrateTagsRequest|null);

                /** Request listDirectory. */
                public listDirectory?: (tilbo.ipc.v1.IListDirectoryRequest|null);

                /** Request statFile. */
                public statFile?: (tilbo.ipc.v1.IStatFileRequest|null);

                /** Request globSearch. */
                public globSearch?: (tilbo.ipc.v1.IGlobSearchRequest|null);

                /** Request renameFile. */
                public renameFile?: (tilbo.ipc.v1.IRenameFileRequest|null);

                /** Request deleteFile. */
                public deleteFile?: (tilbo.ipc.v1.IDeleteFileRequest|null);

                /** Request chmodFile. */
                public chmodFile?: (tilbo.ipc.v1.IChmodFileRequest|null);

                /** Request listPlaces. */
                public listPlaces?: (tilbo.ipc.v1.IListPlacesRequest|null);

                /** Request kind. */
                public kind?: ("search"|"tag"|"metadata"|"metadataSet"|"related"|"status"|"reloadRules"|"listTags"|"hydrateTags"|"listDirectory"|"statFile"|"globSearch"|"renameFile"|"deleteFile"|"chmodFile"|"listPlaces");

                /**
                 * Creates a new Request instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Request instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRequest): tilbo.ipc.v1.Request;

                /**
                 * Encodes the specified Request message. Does not implicitly {@link tilbo.ipc.v1.Request.verify|verify} messages.
                 * @param message Request message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Request message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Request.verify|verify} messages.
                 * @param message Request message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Request message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.Request;

                /**
                 * Decodes a Request message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.Request;

                /**
                 * Verifies a Request message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Request message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Request
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.Request;

                /**
                 * Creates a plain object from a Request message. Also converts values to other types if specified.
                 * @param message Request
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Request to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Request
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a Response. */
            interface IResponse {

                /** Response error */
                error?: (tilbo.ipc.v1.IErrorResponse|null);

                /** Response search */
                search?: (tilbo.ipc.v1.ISearchResponse|null);

                /** Response tag */
                tag?: (tilbo.ipc.v1.ITagResponse|null);

                /** Response metadata */
                metadata?: (tilbo.ipc.v1.IMetadataResponse|null);

                /** Response related */
                related?: (tilbo.ipc.v1.IRelatedResponse|null);

                /** Response status */
                status?: (tilbo.ipc.v1.IStatusResponse|null);

                /** Response reloadRules */
                reloadRules?: (tilbo.ipc.v1.IReloadRulesResponse|null);

                /** Response listTags */
                listTags?: (tilbo.ipc.v1.IListTagsResponse|null);

                /** Response hydrateTags */
                hydrateTags?: (tilbo.ipc.v1.IHydrateTagsResponse|null);

                /** Response listDirectory */
                listDirectory?: (tilbo.ipc.v1.IListDirectoryResponse|null);

                /** Response statFile */
                statFile?: (tilbo.ipc.v1.IStatFileResponse|null);

                /** Response globSearch */
                globSearch?: (tilbo.ipc.v1.IGlobSearchResponse|null);

                /** Response renameFile */
                renameFile?: (tilbo.ipc.v1.IRenameFileResponse|null);

                /** Response deleteFile */
                deleteFile?: (tilbo.ipc.v1.IDeleteFileResponse|null);

                /** Response chmodFile */
                chmodFile?: (tilbo.ipc.v1.IChmodFileResponse|null);

                /** Response listPlaces */
                listPlaces?: (tilbo.ipc.v1.IListPlacesResponse|null);
            }

            /** Represents a Response. */
            class Response implements IResponse {

                /**
                 * Constructs a new Response.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IResponse);

                /** Response error. */
                public error?: (tilbo.ipc.v1.IErrorResponse|null);

                /** Response search. */
                public search?: (tilbo.ipc.v1.ISearchResponse|null);

                /** Response tag. */
                public tag?: (tilbo.ipc.v1.ITagResponse|null);

                /** Response metadata. */
                public metadata?: (tilbo.ipc.v1.IMetadataResponse|null);

                /** Response related. */
                public related?: (tilbo.ipc.v1.IRelatedResponse|null);

                /** Response status. */
                public status?: (tilbo.ipc.v1.IStatusResponse|null);

                /** Response reloadRules. */
                public reloadRules?: (tilbo.ipc.v1.IReloadRulesResponse|null);

                /** Response listTags. */
                public listTags?: (tilbo.ipc.v1.IListTagsResponse|null);

                /** Response hydrateTags. */
                public hydrateTags?: (tilbo.ipc.v1.IHydrateTagsResponse|null);

                /** Response listDirectory. */
                public listDirectory?: (tilbo.ipc.v1.IListDirectoryResponse|null);

                /** Response statFile. */
                public statFile?: (tilbo.ipc.v1.IStatFileResponse|null);

                /** Response globSearch. */
                public globSearch?: (tilbo.ipc.v1.IGlobSearchResponse|null);

                /** Response renameFile. */
                public renameFile?: (tilbo.ipc.v1.IRenameFileResponse|null);

                /** Response deleteFile. */
                public deleteFile?: (tilbo.ipc.v1.IDeleteFileResponse|null);

                /** Response chmodFile. */
                public chmodFile?: (tilbo.ipc.v1.IChmodFileResponse|null);

                /** Response listPlaces. */
                public listPlaces?: (tilbo.ipc.v1.IListPlacesResponse|null);

                /** Response kind. */
                public kind?: ("error"|"search"|"tag"|"metadata"|"related"|"status"|"reloadRules"|"listTags"|"hydrateTags"|"listDirectory"|"statFile"|"globSearch"|"renameFile"|"deleteFile"|"chmodFile"|"listPlaces");

                /**
                 * Creates a new Response instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Response instance
                 */
                public static create(properties?: tilbo.ipc.v1.IResponse): tilbo.ipc.v1.Response;

                /**
                 * Encodes the specified Response message. Does not implicitly {@link tilbo.ipc.v1.Response.verify|verify} messages.
                 * @param message Response message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Response message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Response.verify|verify} messages.
                 * @param message Response message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Response message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.Response;

                /**
                 * Decodes a Response message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.Response;

                /**
                 * Verifies a Response message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Response message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Response
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.Response;

                /**
                 * Creates a plain object from a Response message. Also converts values to other types if specified.
                 * @param message Response
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.Response, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Response to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Response
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an Event. */
            interface IEvent {

                /** Event fileTagged */
                fileTagged?: (tilbo.ipc.v1.IFileTaggedEvent|null);

                /** Event indexUpdated */
                indexUpdated?: (tilbo.ipc.v1.IIndexUpdatedEvent|null);

                /** Event daemonStateChanged */
                daemonStateChanged?: (tilbo.ipc.v1.IDaemonStateChangedEvent|null);
            }

            /** Represents an Event. */
            class Event implements IEvent {

                /**
                 * Constructs a new Event.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IEvent);

                /** Event fileTagged. */
                public fileTagged?: (tilbo.ipc.v1.IFileTaggedEvent|null);

                /** Event indexUpdated. */
                public indexUpdated?: (tilbo.ipc.v1.IIndexUpdatedEvent|null);

                /** Event daemonStateChanged. */
                public daemonStateChanged?: (tilbo.ipc.v1.IDaemonStateChangedEvent|null);

                /** Event kind. */
                public kind?: ("fileTagged"|"indexUpdated"|"daemonStateChanged");

                /**
                 * Creates a new Event instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Event instance
                 */
                public static create(properties?: tilbo.ipc.v1.IEvent): tilbo.ipc.v1.Event;

                /**
                 * Encodes the specified Event message. Does not implicitly {@link tilbo.ipc.v1.Event.verify|verify} messages.
                 * @param message Event message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Event message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Event.verify|verify} messages.
                 * @param message Event message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Event message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Event
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.Event;

                /**
                 * Decodes an Event message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Event
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.Event;

                /**
                 * Verifies an Event message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Event message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Event
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.Event;

                /**
                 * Creates a plain object from an Event message. Also converts values to other types if specified.
                 * @param message Event
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Event to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Event
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an ErrorResponse. */
            interface IErrorResponse {

                /** ErrorResponse code */
                code?: (number|null);

                /** ErrorResponse message */
                message?: (string|null);
            }

            /** Represents an ErrorResponse. */
            class ErrorResponse implements IErrorResponse {

                /**
                 * Constructs a new ErrorResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IErrorResponse);

                /** ErrorResponse code. */
                public code: number;

                /** ErrorResponse message. */
                public message: string;

                /**
                 * Creates a new ErrorResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ErrorResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IErrorResponse): tilbo.ipc.v1.ErrorResponse;

                /**
                 * Encodes the specified ErrorResponse message. Does not implicitly {@link tilbo.ipc.v1.ErrorResponse.verify|verify} messages.
                 * @param message ErrorResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ErrorResponse.verify|verify} messages.
                 * @param message ErrorResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ErrorResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ErrorResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ErrorResponse;

                /**
                 * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ErrorResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ErrorResponse;

                /**
                 * Verifies an ErrorResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ErrorResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ErrorResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ErrorResponse;

                /**
                 * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
                 * @param message ErrorResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ErrorResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ErrorResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ErrorResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a SearchRequest. */
            interface ISearchRequest {

                /** SearchRequest tags */
                tags?: (string[]|null);

                /** SearchRequest tagsAny */
                tagsAny?: (boolean|null);

                /** SearchRequest tagExclude */
                tagExclude?: (string[]|null);

                /** SearchRequest metaFilters */
                metaFilters?: ({ [k: string]: string }|null);

                /** SearchRequest ftsQuery */
                ftsQuery?: (string|null);

                /** SearchRequest limit */
                limit?: (number|null);

                /** SearchRequest offset */
                offset?: (number|null);

                /** SearchRequest sortBy */
                sortBy?: (string[]|null);

                /** SearchRequest vectorQuery */
                vectorQuery?: (string|null);
            }

            /** Represents a SearchRequest. */
            class SearchRequest implements ISearchRequest {

                /**
                 * Constructs a new SearchRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ISearchRequest);

                /** SearchRequest tags. */
                public tags: string[];

                /** SearchRequest tagsAny. */
                public tagsAny: boolean;

                /** SearchRequest tagExclude. */
                public tagExclude: string[];

                /** SearchRequest metaFilters. */
                public metaFilters: { [k: string]: string };

                /** SearchRequest ftsQuery. */
                public ftsQuery: string;

                /** SearchRequest limit. */
                public limit: number;

                /** SearchRequest offset. */
                public offset: number;

                /** SearchRequest sortBy. */
                public sortBy: string[];

                /** SearchRequest vectorQuery. */
                public vectorQuery: string;

                /**
                 * Creates a new SearchRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SearchRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ISearchRequest): tilbo.ipc.v1.SearchRequest;

                /**
                 * Encodes the specified SearchRequest message. Does not implicitly {@link tilbo.ipc.v1.SearchRequest.verify|verify} messages.
                 * @param message SearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.SearchRequest.verify|verify} messages.
                 * @param message SearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SearchRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.SearchRequest;

                /**
                 * Decodes a SearchRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.SearchRequest;

                /**
                 * Verifies a SearchRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SearchRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.SearchRequest;

                /**
                 * Creates a plain object from a SearchRequest message. Also converts values to other types if specified.
                 * @param message SearchRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.SearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SearchRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SearchRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FileResult. */
            interface IFileResult {

                /** FileResult path */
                path?: (string|null);

                /** FileResult tags */
                tags?: (string[]|null);

                /** FileResult metadata */
                metadata?: ({ [k: string]: string }|null);

                /** FileResult score */
                score?: (number|null);

                /** FileResult mtime */
                mtime?: (number|Long|null);

                /** FileResult sizeBytes */
                sizeBytes?: (number|Long|null);
            }

            /** Represents a FileResult. */
            class FileResult implements IFileResult {

                /**
                 * Constructs a new FileResult.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IFileResult);

                /** FileResult path. */
                public path: string;

                /** FileResult tags. */
                public tags: string[];

                /** FileResult metadata. */
                public metadata: { [k: string]: string };

                /** FileResult score. */
                public score: number;

                /** FileResult mtime. */
                public mtime: (number|Long);

                /** FileResult sizeBytes. */
                public sizeBytes: (number|Long);

                /**
                 * Creates a new FileResult instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FileResult instance
                 */
                public static create(properties?: tilbo.ipc.v1.IFileResult): tilbo.ipc.v1.FileResult;

                /**
                 * Encodes the specified FileResult message. Does not implicitly {@link tilbo.ipc.v1.FileResult.verify|verify} messages.
                 * @param message FileResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IFileResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FileResult message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileResult.verify|verify} messages.
                 * @param message FileResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IFileResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FileResult message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FileResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.FileResult;

                /**
                 * Decodes a FileResult message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FileResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.FileResult;

                /**
                 * Verifies a FileResult message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FileResult message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FileResult
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.FileResult;

                /**
                 * Creates a plain object from a FileResult message. Also converts values to other types if specified.
                 * @param message FileResult
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.FileResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FileResult to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FileResult
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a SearchResponse. */
            interface ISearchResponse {

                /** SearchResponse files */
                files?: (tilbo.ipc.v1.IFileResult[]|null);

                /** SearchResponse total */
                total?: (number|null);
            }

            /** Represents a SearchResponse. */
            class SearchResponse implements ISearchResponse {

                /**
                 * Constructs a new SearchResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ISearchResponse);

                /** SearchResponse files. */
                public files: tilbo.ipc.v1.IFileResult[];

                /** SearchResponse total. */
                public total: number;

                /**
                 * Creates a new SearchResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SearchResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ISearchResponse): tilbo.ipc.v1.SearchResponse;

                /**
                 * Encodes the specified SearchResponse message. Does not implicitly {@link tilbo.ipc.v1.SearchResponse.verify|verify} messages.
                 * @param message SearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ISearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.SearchResponse.verify|verify} messages.
                 * @param message SearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ISearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SearchResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.SearchResponse;

                /**
                 * Decodes a SearchResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.SearchResponse;

                /**
                 * Verifies a SearchResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SearchResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.SearchResponse;

                /**
                 * Creates a plain object from a SearchResponse message. Also converts values to other types if specified.
                 * @param message SearchResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.SearchResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SearchResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SearchResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** TagOperation enum. */
            enum TagOperation {
                TAG_OPERATION_UNSPECIFIED = 0,
                TAG_OPERATION_ADD = 1,
                TAG_OPERATION_REMOVE = 2,
                TAG_OPERATION_SET = 3
            }

            /** Properties of a TagRequest. */
            interface ITagRequest {

                /** TagRequest paths */
                paths?: (string[]|null);

                /** TagRequest tags */
                tags?: (string[]|null);

                /** TagRequest operation */
                operation?: (tilbo.ipc.v1.TagOperation|null);
            }

            /** Represents a TagRequest. */
            class TagRequest implements ITagRequest {

                /**
                 * Constructs a new TagRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ITagRequest);

                /** TagRequest paths. */
                public paths: string[];

                /** TagRequest tags. */
                public tags: string[];

                /** TagRequest operation. */
                public operation: tilbo.ipc.v1.TagOperation;

                /**
                 * Creates a new TagRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TagRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ITagRequest): tilbo.ipc.v1.TagRequest;

                /**
                 * Encodes the specified TagRequest message. Does not implicitly {@link tilbo.ipc.v1.TagRequest.verify|verify} messages.
                 * @param message TagRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ITagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TagRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TagRequest.verify|verify} messages.
                 * @param message TagRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ITagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TagRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TagRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.TagRequest;

                /**
                 * Decodes a TagRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TagRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.TagRequest;

                /**
                 * Verifies a TagRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TagRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TagRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.TagRequest;

                /**
                 * Creates a plain object from a TagRequest message. Also converts values to other types if specified.
                 * @param message TagRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.TagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TagRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TagRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a TagResponse. */
            interface ITagResponse {

                /** TagResponse pathsOk */
                pathsOk?: (string[]|null);

                /** TagResponse pathsError */
                pathsError?: (string[]|null);

                /** TagResponse errors */
                errors?: ({ [k: string]: string }|null);
            }

            /** Represents a TagResponse. */
            class TagResponse implements ITagResponse {

                /**
                 * Constructs a new TagResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ITagResponse);

                /** TagResponse pathsOk. */
                public pathsOk: string[];

                /** TagResponse pathsError. */
                public pathsError: string[];

                /** TagResponse errors. */
                public errors: { [k: string]: string };

                /**
                 * Creates a new TagResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TagResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ITagResponse): tilbo.ipc.v1.TagResponse;

                /**
                 * Encodes the specified TagResponse message. Does not implicitly {@link tilbo.ipc.v1.TagResponse.verify|verify} messages.
                 * @param message TagResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ITagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TagResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TagResponse.verify|verify} messages.
                 * @param message TagResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ITagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TagResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TagResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.TagResponse;

                /**
                 * Decodes a TagResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TagResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.TagResponse;

                /**
                 * Verifies a TagResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TagResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TagResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.TagResponse;

                /**
                 * Creates a plain object from a TagResponse message. Also converts values to other types if specified.
                 * @param message TagResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.TagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TagResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TagResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a MetadataRequest. */
            interface IMetadataRequest {

                /** MetadataRequest path */
                path?: (string|null);
            }

            /** Represents a MetadataRequest. */
            class MetadataRequest implements IMetadataRequest {

                /**
                 * Constructs a new MetadataRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IMetadataRequest);

                /** MetadataRequest path. */
                public path: string;

                /**
                 * Creates a new MetadataRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MetadataRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IMetadataRequest): tilbo.ipc.v1.MetadataRequest;

                /**
                 * Encodes the specified MetadataRequest message. Does not implicitly {@link tilbo.ipc.v1.MetadataRequest.verify|verify} messages.
                 * @param message MetadataRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MetadataRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataRequest.verify|verify} messages.
                 * @param message MetadataRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MetadataRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MetadataRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.MetadataRequest;

                /**
                 * Decodes a MetadataRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MetadataRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.MetadataRequest;

                /**
                 * Verifies a MetadataRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MetadataRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MetadataRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.MetadataRequest;

                /**
                 * Creates a plain object from a MetadataRequest message. Also converts values to other types if specified.
                 * @param message MetadataRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.MetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MetadataRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for MetadataRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a MetadataResponse. */
            interface IMetadataResponse {

                /** MetadataResponse path */
                path?: (string|null);

                /** MetadataResponse metadata */
                metadata?: ({ [k: string]: string }|null);

                /** MetadataResponse sources */
                sources?: ({ [k: string]: string }|null);
            }

            /** Represents a MetadataResponse. */
            class MetadataResponse implements IMetadataResponse {

                /**
                 * Constructs a new MetadataResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IMetadataResponse);

                /** MetadataResponse path. */
                public path: string;

                /** MetadataResponse metadata. */
                public metadata: { [k: string]: string };

                /** MetadataResponse sources. */
                public sources: { [k: string]: string };

                /**
                 * Creates a new MetadataResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MetadataResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IMetadataResponse): tilbo.ipc.v1.MetadataResponse;

                /**
                 * Encodes the specified MetadataResponse message. Does not implicitly {@link tilbo.ipc.v1.MetadataResponse.verify|verify} messages.
                 * @param message MetadataResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MetadataResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataResponse.verify|verify} messages.
                 * @param message MetadataResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MetadataResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MetadataResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.MetadataResponse;

                /**
                 * Decodes a MetadataResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MetadataResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.MetadataResponse;

                /**
                 * Verifies a MetadataResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MetadataResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MetadataResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.MetadataResponse;

                /**
                 * Creates a plain object from a MetadataResponse message. Also converts values to other types if specified.
                 * @param message MetadataResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.MetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MetadataResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for MetadataResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a MetadataSetRequest. */
            interface IMetadataSetRequest {

                /** MetadataSetRequest path */
                path?: (string|null);

                /** MetadataSetRequest key */
                key?: (string|null);

                /** MetadataSetRequest value */
                value?: (string|null);
            }

            /** Represents a MetadataSetRequest. */
            class MetadataSetRequest implements IMetadataSetRequest {

                /**
                 * Constructs a new MetadataSetRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IMetadataSetRequest);

                /** MetadataSetRequest path. */
                public path: string;

                /** MetadataSetRequest key. */
                public key: string;

                /** MetadataSetRequest value. */
                public value: string;

                /**
                 * Creates a new MetadataSetRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MetadataSetRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IMetadataSetRequest): tilbo.ipc.v1.MetadataSetRequest;

                /**
                 * Encodes the specified MetadataSetRequest message. Does not implicitly {@link tilbo.ipc.v1.MetadataSetRequest.verify|verify} messages.
                 * @param message MetadataSetRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IMetadataSetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MetadataSetRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataSetRequest.verify|verify} messages.
                 * @param message MetadataSetRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IMetadataSetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MetadataSetRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MetadataSetRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.MetadataSetRequest;

                /**
                 * Decodes a MetadataSetRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MetadataSetRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.MetadataSetRequest;

                /**
                 * Verifies a MetadataSetRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MetadataSetRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MetadataSetRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.MetadataSetRequest;

                /**
                 * Creates a plain object from a MetadataSetRequest message. Also converts values to other types if specified.
                 * @param message MetadataSetRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.MetadataSetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MetadataSetRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for MetadataSetRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RelatedRequest. */
            interface IRelatedRequest {

                /** RelatedRequest seedPath */
                seedPath?: (string|null);

                /** RelatedRequest limit */
                limit?: (number|null);

                /** RelatedRequest maxHops */
                maxHops?: (number|null);

                /** RelatedRequest hopWeight */
                hopWeight?: (number|null);

                /** RelatedRequest vecWeight */
                vecWeight?: (number|null);
            }

            /** Represents a RelatedRequest. */
            class RelatedRequest implements IRelatedRequest {

                /**
                 * Constructs a new RelatedRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRelatedRequest);

                /** RelatedRequest seedPath. */
                public seedPath: string;

                /** RelatedRequest limit. */
                public limit: number;

                /** RelatedRequest maxHops. */
                public maxHops: number;

                /** RelatedRequest hopWeight. */
                public hopWeight: number;

                /** RelatedRequest vecWeight. */
                public vecWeight: number;

                /**
                 * Creates a new RelatedRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RelatedRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRelatedRequest): tilbo.ipc.v1.RelatedRequest;

                /**
                 * Encodes the specified RelatedRequest message. Does not implicitly {@link tilbo.ipc.v1.RelatedRequest.verify|verify} messages.
                 * @param message RelatedRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRelatedRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RelatedRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RelatedRequest.verify|verify} messages.
                 * @param message RelatedRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRelatedRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RelatedRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RelatedRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RelatedRequest;

                /**
                 * Decodes a RelatedRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RelatedRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RelatedRequest;

                /**
                 * Verifies a RelatedRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RelatedRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RelatedRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RelatedRequest;

                /**
                 * Creates a plain object from a RelatedRequest message. Also converts values to other types if specified.
                 * @param message RelatedRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RelatedRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RelatedRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RelatedRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ScoredFile. */
            interface IScoredFile {

                /** ScoredFile file */
                file?: (tilbo.ipc.v1.IFileResult|null);

                /** ScoredFile score */
                score?: (number|null);

                /** ScoredFile hopDistance */
                hopDistance?: (number|null);

                /** ScoredFile cosineSim */
                cosineSim?: (number|null);
            }

            /** Represents a ScoredFile. */
            class ScoredFile implements IScoredFile {

                /**
                 * Constructs a new ScoredFile.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IScoredFile);

                /** ScoredFile file. */
                public file?: (tilbo.ipc.v1.IFileResult|null);

                /** ScoredFile score. */
                public score: number;

                /** ScoredFile hopDistance. */
                public hopDistance: number;

                /** ScoredFile cosineSim. */
                public cosineSim: number;

                /**
                 * Creates a new ScoredFile instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ScoredFile instance
                 */
                public static create(properties?: tilbo.ipc.v1.IScoredFile): tilbo.ipc.v1.ScoredFile;

                /**
                 * Encodes the specified ScoredFile message. Does not implicitly {@link tilbo.ipc.v1.ScoredFile.verify|verify} messages.
                 * @param message ScoredFile message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IScoredFile, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ScoredFile message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ScoredFile.verify|verify} messages.
                 * @param message ScoredFile message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IScoredFile, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ScoredFile message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ScoredFile
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ScoredFile;

                /**
                 * Decodes a ScoredFile message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ScoredFile
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ScoredFile;

                /**
                 * Verifies a ScoredFile message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ScoredFile message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ScoredFile
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ScoredFile;

                /**
                 * Creates a plain object from a ScoredFile message. Also converts values to other types if specified.
                 * @param message ScoredFile
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ScoredFile, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ScoredFile to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ScoredFile
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RelatedResponse. */
            interface IRelatedResponse {

                /** RelatedResponse files */
                files?: (tilbo.ipc.v1.IScoredFile[]|null);
            }

            /** Represents a RelatedResponse. */
            class RelatedResponse implements IRelatedResponse {

                /**
                 * Constructs a new RelatedResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRelatedResponse);

                /** RelatedResponse files. */
                public files: tilbo.ipc.v1.IScoredFile[];

                /**
                 * Creates a new RelatedResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RelatedResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRelatedResponse): tilbo.ipc.v1.RelatedResponse;

                /**
                 * Encodes the specified RelatedResponse message. Does not implicitly {@link tilbo.ipc.v1.RelatedResponse.verify|verify} messages.
                 * @param message RelatedResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRelatedResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RelatedResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RelatedResponse.verify|verify} messages.
                 * @param message RelatedResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRelatedResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RelatedResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RelatedResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RelatedResponse;

                /**
                 * Decodes a RelatedResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RelatedResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RelatedResponse;

                /**
                 * Verifies a RelatedResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RelatedResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RelatedResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RelatedResponse;

                /**
                 * Creates a plain object from a RelatedResponse message. Also converts values to other types if specified.
                 * @param message RelatedResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RelatedResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RelatedResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RelatedResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** DaemonState enum. */
            enum DaemonState {
                DAEMON_STATE_UNSPECIFIED = 0,
                DAEMON_STATE_IDLE = 1,
                DAEMON_STATE_SCANNING = 2,
                DAEMON_STATE_READY = 3,
                DAEMON_STATE_DEGRADED = 4
            }

            /** Properties of a StatusRequest. */
            interface IStatusRequest {
            }

            /** Represents a StatusRequest. */
            class StatusRequest implements IStatusRequest {

                /**
                 * Constructs a new StatusRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IStatusRequest);

                /**
                 * Creates a new StatusRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns StatusRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IStatusRequest): tilbo.ipc.v1.StatusRequest;

                /**
                 * Encodes the specified StatusRequest message. Does not implicitly {@link tilbo.ipc.v1.StatusRequest.verify|verify} messages.
                 * @param message StatusRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IStatusRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified StatusRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatusRequest.verify|verify} messages.
                 * @param message StatusRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IStatusRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a StatusRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns StatusRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.StatusRequest;

                /**
                 * Decodes a StatusRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns StatusRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.StatusRequest;

                /**
                 * Verifies a StatusRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a StatusRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns StatusRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.StatusRequest;

                /**
                 * Creates a plain object from a StatusRequest message. Also converts values to other types if specified.
                 * @param message StatusRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.StatusRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this StatusRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for StatusRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a StatusResponse. */
            interface IStatusResponse {

                /** StatusResponse state */
                state?: (tilbo.ipc.v1.DaemonState|null);

                /** StatusResponse filesIndexed */
                filesIndexed?: (number|Long|null);

                /** StatusResponse tagsTotal */
                tagsTotal?: (number|Long|null);

                /** StatusResponse indexSizeMb */
                indexSizeMb?: (number|null);

                /** StatusResponse warnings */
                warnings?: (string[]|null);

                /** StatusResponse uptimeSeconds */
                uptimeSeconds?: (number|Long|null);
            }

            /** Represents a StatusResponse. */
            class StatusResponse implements IStatusResponse {

                /**
                 * Constructs a new StatusResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IStatusResponse);

                /** StatusResponse state. */
                public state: tilbo.ipc.v1.DaemonState;

                /** StatusResponse filesIndexed. */
                public filesIndexed: (number|Long);

                /** StatusResponse tagsTotal. */
                public tagsTotal: (number|Long);

                /** StatusResponse indexSizeMb. */
                public indexSizeMb: number;

                /** StatusResponse warnings. */
                public warnings: string[];

                /** StatusResponse uptimeSeconds. */
                public uptimeSeconds: (number|Long);

                /**
                 * Creates a new StatusResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns StatusResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IStatusResponse): tilbo.ipc.v1.StatusResponse;

                /**
                 * Encodes the specified StatusResponse message. Does not implicitly {@link tilbo.ipc.v1.StatusResponse.verify|verify} messages.
                 * @param message StatusResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IStatusResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified StatusResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatusResponse.verify|verify} messages.
                 * @param message StatusResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IStatusResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a StatusResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns StatusResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.StatusResponse;

                /**
                 * Decodes a StatusResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns StatusResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.StatusResponse;

                /**
                 * Verifies a StatusResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a StatusResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns StatusResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.StatusResponse;

                /**
                 * Creates a plain object from a StatusResponse message. Also converts values to other types if specified.
                 * @param message StatusResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.StatusResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this StatusResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for StatusResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ReloadRulesRequest. */
            interface IReloadRulesRequest {
            }

            /** Represents a ReloadRulesRequest. */
            class ReloadRulesRequest implements IReloadRulesRequest {

                /**
                 * Constructs a new ReloadRulesRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IReloadRulesRequest);

                /**
                 * Creates a new ReloadRulesRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ReloadRulesRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IReloadRulesRequest): tilbo.ipc.v1.ReloadRulesRequest;

                /**
                 * Encodes the specified ReloadRulesRequest message. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesRequest.verify|verify} messages.
                 * @param message ReloadRulesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IReloadRulesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ReloadRulesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesRequest.verify|verify} messages.
                 * @param message ReloadRulesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IReloadRulesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ReloadRulesRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ReloadRulesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ReloadRulesRequest;

                /**
                 * Decodes a ReloadRulesRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ReloadRulesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ReloadRulesRequest;

                /**
                 * Verifies a ReloadRulesRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ReloadRulesRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ReloadRulesRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ReloadRulesRequest;

                /**
                 * Creates a plain object from a ReloadRulesRequest message. Also converts values to other types if specified.
                 * @param message ReloadRulesRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ReloadRulesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ReloadRulesRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ReloadRulesRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ReloadRulesResponse. */
            interface IReloadRulesResponse {

                /** ReloadRulesResponse rulesLoaded */
                rulesLoaded?: (number|null);

                /** ReloadRulesResponse errors */
                errors?: (string[]|null);
            }

            /** Represents a ReloadRulesResponse. */
            class ReloadRulesResponse implements IReloadRulesResponse {

                /**
                 * Constructs a new ReloadRulesResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IReloadRulesResponse);

                /** ReloadRulesResponse rulesLoaded. */
                public rulesLoaded: number;

                /** ReloadRulesResponse errors. */
                public errors: string[];

                /**
                 * Creates a new ReloadRulesResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ReloadRulesResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IReloadRulesResponse): tilbo.ipc.v1.ReloadRulesResponse;

                /**
                 * Encodes the specified ReloadRulesResponse message. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesResponse.verify|verify} messages.
                 * @param message ReloadRulesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IReloadRulesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ReloadRulesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesResponse.verify|verify} messages.
                 * @param message ReloadRulesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IReloadRulesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ReloadRulesResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ReloadRulesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ReloadRulesResponse;

                /**
                 * Decodes a ReloadRulesResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ReloadRulesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ReloadRulesResponse;

                /**
                 * Verifies a ReloadRulesResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ReloadRulesResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ReloadRulesResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ReloadRulesResponse;

                /**
                 * Creates a plain object from a ReloadRulesResponse message. Also converts values to other types if specified.
                 * @param message ReloadRulesResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ReloadRulesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ReloadRulesResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ReloadRulesResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListTagsRequest. */
            interface IListTagsRequest {

                /** ListTagsRequest prefix */
                prefix?: (string|null);
            }

            /** Represents a ListTagsRequest. */
            class ListTagsRequest implements IListTagsRequest {

                /**
                 * Constructs a new ListTagsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListTagsRequest);

                /** ListTagsRequest prefix. */
                public prefix: string;

                /**
                 * Creates a new ListTagsRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListTagsRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListTagsRequest): tilbo.ipc.v1.ListTagsRequest;

                /**
                 * Encodes the specified ListTagsRequest message. Does not implicitly {@link tilbo.ipc.v1.ListTagsRequest.verify|verify} messages.
                 * @param message ListTagsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListTagsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListTagsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTagsRequest.verify|verify} messages.
                 * @param message ListTagsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListTagsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListTagsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListTagsRequest;

                /**
                 * Decodes a ListTagsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListTagsRequest;

                /**
                 * Verifies a ListTagsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListTagsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListTagsRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListTagsRequest;

                /**
                 * Creates a plain object from a ListTagsRequest message. Also converts values to other types if specified.
                 * @param message ListTagsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListTagsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListTagsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListTagsRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListTagsResponse. */
            interface IListTagsResponse {

                /** ListTagsResponse tags */
                tags?: (string[]|null);
            }

            /** Represents a ListTagsResponse. */
            class ListTagsResponse implements IListTagsResponse {

                /**
                 * Constructs a new ListTagsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListTagsResponse);

                /** ListTagsResponse tags. */
                public tags: string[];

                /**
                 * Creates a new ListTagsResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListTagsResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListTagsResponse): tilbo.ipc.v1.ListTagsResponse;

                /**
                 * Encodes the specified ListTagsResponse message. Does not implicitly {@link tilbo.ipc.v1.ListTagsResponse.verify|verify} messages.
                 * @param message ListTagsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListTagsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTagsResponse.verify|verify} messages.
                 * @param message ListTagsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListTagsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListTagsResponse;

                /**
                 * Decodes a ListTagsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListTagsResponse;

                /**
                 * Verifies a ListTagsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListTagsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListTagsResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListTagsResponse;

                /**
                 * Creates a plain object from a ListTagsResponse message. Also converts values to other types if specified.
                 * @param message ListTagsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListTagsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListTagsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListTagsResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a HydrateTagsRequest. */
            interface IHydrateTagsRequest {

                /** HydrateTagsRequest paths */
                paths?: (string[]|null);
            }

            /** Represents a HydrateTagsRequest. */
            class HydrateTagsRequest implements IHydrateTagsRequest {

                /**
                 * Constructs a new HydrateTagsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IHydrateTagsRequest);

                /** HydrateTagsRequest paths. */
                public paths: string[];

                /**
                 * Creates a new HydrateTagsRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns HydrateTagsRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IHydrateTagsRequest): tilbo.ipc.v1.HydrateTagsRequest;

                /**
                 * Encodes the specified HydrateTagsRequest message. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsRequest.verify|verify} messages.
                 * @param message HydrateTagsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IHydrateTagsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified HydrateTagsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsRequest.verify|verify} messages.
                 * @param message HydrateTagsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IHydrateTagsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a HydrateTagsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns HydrateTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.HydrateTagsRequest;

                /**
                 * Decodes a HydrateTagsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns HydrateTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.HydrateTagsRequest;

                /**
                 * Verifies a HydrateTagsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a HydrateTagsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns HydrateTagsRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.HydrateTagsRequest;

                /**
                 * Creates a plain object from a HydrateTagsRequest message. Also converts values to other types if specified.
                 * @param message HydrateTagsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.HydrateTagsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this HydrateTagsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for HydrateTagsRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a HydratedPathTags. */
            interface IHydratedPathTags {

                /** HydratedPathTags path */
                path?: (string|null);

                /** HydratedPathTags tags */
                tags?: (string[]|null);
            }

            /** Represents a HydratedPathTags. */
            class HydratedPathTags implements IHydratedPathTags {

                /**
                 * Constructs a new HydratedPathTags.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IHydratedPathTags);

                /** HydratedPathTags path. */
                public path: string;

                /** HydratedPathTags tags. */
                public tags: string[];

                /**
                 * Creates a new HydratedPathTags instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns HydratedPathTags instance
                 */
                public static create(properties?: tilbo.ipc.v1.IHydratedPathTags): tilbo.ipc.v1.HydratedPathTags;

                /**
                 * Encodes the specified HydratedPathTags message. Does not implicitly {@link tilbo.ipc.v1.HydratedPathTags.verify|verify} messages.
                 * @param message HydratedPathTags message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IHydratedPathTags, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified HydratedPathTags message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydratedPathTags.verify|verify} messages.
                 * @param message HydratedPathTags message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IHydratedPathTags, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a HydratedPathTags message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns HydratedPathTags
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.HydratedPathTags;

                /**
                 * Decodes a HydratedPathTags message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns HydratedPathTags
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.HydratedPathTags;

                /**
                 * Verifies a HydratedPathTags message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a HydratedPathTags message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns HydratedPathTags
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.HydratedPathTags;

                /**
                 * Creates a plain object from a HydratedPathTags message. Also converts values to other types if specified.
                 * @param message HydratedPathTags
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.HydratedPathTags, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this HydratedPathTags to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for HydratedPathTags
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a HydrateTagsResponse. */
            interface IHydrateTagsResponse {

                /** HydrateTagsResponse entries */
                entries?: (tilbo.ipc.v1.IHydratedPathTags[]|null);
            }

            /** Represents a HydrateTagsResponse. */
            class HydrateTagsResponse implements IHydrateTagsResponse {

                /**
                 * Constructs a new HydrateTagsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IHydrateTagsResponse);

                /** HydrateTagsResponse entries. */
                public entries: tilbo.ipc.v1.IHydratedPathTags[];

                /**
                 * Creates a new HydrateTagsResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns HydrateTagsResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IHydrateTagsResponse): tilbo.ipc.v1.HydrateTagsResponse;

                /**
                 * Encodes the specified HydrateTagsResponse message. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsResponse.verify|verify} messages.
                 * @param message HydrateTagsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IHydrateTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified HydrateTagsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsResponse.verify|verify} messages.
                 * @param message HydrateTagsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IHydrateTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a HydrateTagsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns HydrateTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.HydrateTagsResponse;

                /**
                 * Decodes a HydrateTagsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns HydrateTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.HydrateTagsResponse;

                /**
                 * Verifies a HydrateTagsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a HydrateTagsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns HydrateTagsResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.HydrateTagsResponse;

                /**
                 * Creates a plain object from a HydrateTagsResponse message. Also converts values to other types if specified.
                 * @param message HydrateTagsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.HydrateTagsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this HydrateTagsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for HydrateTagsResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListDirectoryRequest. */
            interface IListDirectoryRequest {

                /** ListDirectoryRequest path */
                path?: (string|null);

                /** ListDirectoryRequest hidden */
                hidden?: (boolean|null);
            }

            /** Represents a ListDirectoryRequest. */
            class ListDirectoryRequest implements IListDirectoryRequest {

                /**
                 * Constructs a new ListDirectoryRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListDirectoryRequest);

                /** ListDirectoryRequest path. */
                public path: string;

                /** ListDirectoryRequest hidden. */
                public hidden: boolean;

                /**
                 * Creates a new ListDirectoryRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListDirectoryRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListDirectoryRequest): tilbo.ipc.v1.ListDirectoryRequest;

                /**
                 * Encodes the specified ListDirectoryRequest message. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryRequest.verify|verify} messages.
                 * @param message ListDirectoryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListDirectoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListDirectoryRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryRequest.verify|verify} messages.
                 * @param message ListDirectoryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListDirectoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListDirectoryRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListDirectoryRequest;

                /**
                 * Decodes a ListDirectoryRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListDirectoryRequest;

                /**
                 * Verifies a ListDirectoryRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListDirectoryRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListDirectoryRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListDirectoryRequest;

                /**
                 * Creates a plain object from a ListDirectoryRequest message. Also converts values to other types if specified.
                 * @param message ListDirectoryRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListDirectoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListDirectoryRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListDirectoryRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DirEntry. */
            interface IDirEntry {

                /** DirEntry name */
                name?: (string|null);

                /** DirEntry path */
                path?: (string|null);

                /** DirEntry isDir */
                isDir?: (boolean|null);

                /** DirEntry sizeBytes */
                sizeBytes?: (number|Long|null);

                /** DirEntry mtime */
                mtime?: (number|Long|null);

                /** DirEntry mode */
                mode?: (number|null);

                /** DirEntry hidden */
                hidden?: (boolean|null);
            }

            /** Represents a DirEntry. */
            class DirEntry implements IDirEntry {

                /**
                 * Constructs a new DirEntry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IDirEntry);

                /** DirEntry name. */
                public name: string;

                /** DirEntry path. */
                public path: string;

                /** DirEntry isDir. */
                public isDir: boolean;

                /** DirEntry sizeBytes. */
                public sizeBytes: (number|Long);

                /** DirEntry mtime. */
                public mtime: (number|Long);

                /** DirEntry mode. */
                public mode: number;

                /** DirEntry hidden. */
                public hidden: boolean;

                /**
                 * Creates a new DirEntry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DirEntry instance
                 */
                public static create(properties?: tilbo.ipc.v1.IDirEntry): tilbo.ipc.v1.DirEntry;

                /**
                 * Encodes the specified DirEntry message. Does not implicitly {@link tilbo.ipc.v1.DirEntry.verify|verify} messages.
                 * @param message DirEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IDirEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DirEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DirEntry.verify|verify} messages.
                 * @param message DirEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IDirEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DirEntry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DirEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.DirEntry;

                /**
                 * Decodes a DirEntry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DirEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.DirEntry;

                /**
                 * Verifies a DirEntry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DirEntry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DirEntry
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.DirEntry;

                /**
                 * Creates a plain object from a DirEntry message. Also converts values to other types if specified.
                 * @param message DirEntry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.DirEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DirEntry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DirEntry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListDirectoryResponse. */
            interface IListDirectoryResponse {

                /** ListDirectoryResponse entries */
                entries?: (tilbo.ipc.v1.IDirEntry[]|null);
            }

            /** Represents a ListDirectoryResponse. */
            class ListDirectoryResponse implements IListDirectoryResponse {

                /**
                 * Constructs a new ListDirectoryResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListDirectoryResponse);

                /** ListDirectoryResponse entries. */
                public entries: tilbo.ipc.v1.IDirEntry[];

                /**
                 * Creates a new ListDirectoryResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListDirectoryResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListDirectoryResponse): tilbo.ipc.v1.ListDirectoryResponse;

                /**
                 * Encodes the specified ListDirectoryResponse message. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryResponse.verify|verify} messages.
                 * @param message ListDirectoryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListDirectoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListDirectoryResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryResponse.verify|verify} messages.
                 * @param message ListDirectoryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListDirectoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListDirectoryResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListDirectoryResponse;

                /**
                 * Decodes a ListDirectoryResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListDirectoryResponse;

                /**
                 * Verifies a ListDirectoryResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListDirectoryResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListDirectoryResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListDirectoryResponse;

                /**
                 * Creates a plain object from a ListDirectoryResponse message. Also converts values to other types if specified.
                 * @param message ListDirectoryResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListDirectoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListDirectoryResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListDirectoryResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a StatFileRequest. */
            interface IStatFileRequest {

                /** StatFileRequest path */
                path?: (string|null);
            }

            /** Represents a StatFileRequest. */
            class StatFileRequest implements IStatFileRequest {

                /**
                 * Constructs a new StatFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IStatFileRequest);

                /** StatFileRequest path. */
                public path: string;

                /**
                 * Creates a new StatFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns StatFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IStatFileRequest): tilbo.ipc.v1.StatFileRequest;

                /**
                 * Encodes the specified StatFileRequest message. Does not implicitly {@link tilbo.ipc.v1.StatFileRequest.verify|verify} messages.
                 * @param message StatFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IStatFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified StatFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatFileRequest.verify|verify} messages.
                 * @param message StatFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IStatFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a StatFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns StatFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.StatFileRequest;

                /**
                 * Decodes a StatFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns StatFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.StatFileRequest;

                /**
                 * Verifies a StatFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a StatFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns StatFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.StatFileRequest;

                /**
                 * Creates a plain object from a StatFileRequest message. Also converts values to other types if specified.
                 * @param message StatFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.StatFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this StatFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for StatFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FileStat. */
            interface IFileStat {

                /** FileStat sizeBytes */
                sizeBytes?: (number|Long|null);

                /** FileStat mtime */
                mtime?: (number|Long|null);

                /** FileStat mode */
                mode?: (number|null);
            }

            /** Represents a FileStat. */
            class FileStat implements IFileStat {

                /**
                 * Constructs a new FileStat.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IFileStat);

                /** FileStat sizeBytes. */
                public sizeBytes: (number|Long);

                /** FileStat mtime. */
                public mtime: (number|Long);

                /** FileStat mode. */
                public mode: number;

                /**
                 * Creates a new FileStat instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FileStat instance
                 */
                public static create(properties?: tilbo.ipc.v1.IFileStat): tilbo.ipc.v1.FileStat;

                /**
                 * Encodes the specified FileStat message. Does not implicitly {@link tilbo.ipc.v1.FileStat.verify|verify} messages.
                 * @param message FileStat message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IFileStat, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FileStat message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileStat.verify|verify} messages.
                 * @param message FileStat message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IFileStat, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FileStat message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FileStat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.FileStat;

                /**
                 * Decodes a FileStat message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FileStat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.FileStat;

                /**
                 * Verifies a FileStat message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FileStat message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FileStat
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.FileStat;

                /**
                 * Creates a plain object from a FileStat message. Also converts values to other types if specified.
                 * @param message FileStat
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.FileStat, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FileStat to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FileStat
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a StatFileResponse. */
            interface IStatFileResponse {

                /** StatFileResponse stat */
                stat?: (tilbo.ipc.v1.IFileStat|null);
            }

            /** Represents a StatFileResponse. */
            class StatFileResponse implements IStatFileResponse {

                /**
                 * Constructs a new StatFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IStatFileResponse);

                /** StatFileResponse stat. */
                public stat?: (tilbo.ipc.v1.IFileStat|null);

                /**
                 * Creates a new StatFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns StatFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IStatFileResponse): tilbo.ipc.v1.StatFileResponse;

                /**
                 * Encodes the specified StatFileResponse message. Does not implicitly {@link tilbo.ipc.v1.StatFileResponse.verify|verify} messages.
                 * @param message StatFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IStatFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified StatFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatFileResponse.verify|verify} messages.
                 * @param message StatFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IStatFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a StatFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns StatFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.StatFileResponse;

                /**
                 * Decodes a StatFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns StatFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.StatFileResponse;

                /**
                 * Verifies a StatFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a StatFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns StatFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.StatFileResponse;

                /**
                 * Creates a plain object from a StatFileResponse message. Also converts values to other types if specified.
                 * @param message StatFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.StatFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this StatFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for StatFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GlobSearchRequest. */
            interface IGlobSearchRequest {

                /** GlobSearchRequest patterns */
                patterns?: (string[]|null);

                /** GlobSearchRequest limit */
                limit?: (number|null);

                /** GlobSearchRequest allowHidden */
                allowHidden?: (boolean|null);
            }

            /** Represents a GlobSearchRequest. */
            class GlobSearchRequest implements IGlobSearchRequest {

                /**
                 * Constructs a new GlobSearchRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGlobSearchRequest);

                /** GlobSearchRequest patterns. */
                public patterns: string[];

                /** GlobSearchRequest limit. */
                public limit: number;

                /** GlobSearchRequest allowHidden. */
                public allowHidden: boolean;

                /**
                 * Creates a new GlobSearchRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GlobSearchRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGlobSearchRequest): tilbo.ipc.v1.GlobSearchRequest;

                /**
                 * Encodes the specified GlobSearchRequest message. Does not implicitly {@link tilbo.ipc.v1.GlobSearchRequest.verify|verify} messages.
                 * @param message GlobSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGlobSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GlobSearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GlobSearchRequest.verify|verify} messages.
                 * @param message GlobSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGlobSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GlobSearchRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GlobSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GlobSearchRequest;

                /**
                 * Decodes a GlobSearchRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GlobSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GlobSearchRequest;

                /**
                 * Verifies a GlobSearchRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GlobSearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GlobSearchRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GlobSearchRequest;

                /**
                 * Creates a plain object from a GlobSearchRequest message. Also converts values to other types if specified.
                 * @param message GlobSearchRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GlobSearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GlobSearchRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GlobSearchRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GlobSearchResponse. */
            interface IGlobSearchResponse {

                /** GlobSearchResponse files */
                files?: (tilbo.ipc.v1.IFileResult[]|null);
            }

            /** Represents a GlobSearchResponse. */
            class GlobSearchResponse implements IGlobSearchResponse {

                /**
                 * Constructs a new GlobSearchResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGlobSearchResponse);

                /** GlobSearchResponse files. */
                public files: tilbo.ipc.v1.IFileResult[];

                /**
                 * Creates a new GlobSearchResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GlobSearchResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGlobSearchResponse): tilbo.ipc.v1.GlobSearchResponse;

                /**
                 * Encodes the specified GlobSearchResponse message. Does not implicitly {@link tilbo.ipc.v1.GlobSearchResponse.verify|verify} messages.
                 * @param message GlobSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGlobSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GlobSearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GlobSearchResponse.verify|verify} messages.
                 * @param message GlobSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGlobSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GlobSearchResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GlobSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GlobSearchResponse;

                /**
                 * Decodes a GlobSearchResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GlobSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GlobSearchResponse;

                /**
                 * Verifies a GlobSearchResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GlobSearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GlobSearchResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GlobSearchResponse;

                /**
                 * Creates a plain object from a GlobSearchResponse message. Also converts values to other types if specified.
                 * @param message GlobSearchResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GlobSearchResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GlobSearchResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GlobSearchResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RenameFileRequest. */
            interface IRenameFileRequest {

                /** RenameFileRequest path */
                path?: (string|null);

                /** RenameFileRequest newName */
                newName?: (string|null);
            }

            /** Represents a RenameFileRequest. */
            class RenameFileRequest implements IRenameFileRequest {

                /**
                 * Constructs a new RenameFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRenameFileRequest);

                /** RenameFileRequest path. */
                public path: string;

                /** RenameFileRequest newName. */
                public newName: string;

                /**
                 * Creates a new RenameFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RenameFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRenameFileRequest): tilbo.ipc.v1.RenameFileRequest;

                /**
                 * Encodes the specified RenameFileRequest message. Does not implicitly {@link tilbo.ipc.v1.RenameFileRequest.verify|verify} messages.
                 * @param message RenameFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRenameFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RenameFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RenameFileRequest.verify|verify} messages.
                 * @param message RenameFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRenameFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RenameFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RenameFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RenameFileRequest;

                /**
                 * Decodes a RenameFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RenameFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RenameFileRequest;

                /**
                 * Verifies a RenameFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RenameFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RenameFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RenameFileRequest;

                /**
                 * Creates a plain object from a RenameFileRequest message. Also converts values to other types if specified.
                 * @param message RenameFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RenameFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RenameFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RenameFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RenameFileResponse. */
            interface IRenameFileResponse {

                /** RenameFileResponse newPath */
                newPath?: (string|null);
            }

            /** Represents a RenameFileResponse. */
            class RenameFileResponse implements IRenameFileResponse {

                /**
                 * Constructs a new RenameFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRenameFileResponse);

                /** RenameFileResponse newPath. */
                public newPath: string;

                /**
                 * Creates a new RenameFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RenameFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRenameFileResponse): tilbo.ipc.v1.RenameFileResponse;

                /**
                 * Encodes the specified RenameFileResponse message. Does not implicitly {@link tilbo.ipc.v1.RenameFileResponse.verify|verify} messages.
                 * @param message RenameFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRenameFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RenameFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RenameFileResponse.verify|verify} messages.
                 * @param message RenameFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRenameFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RenameFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RenameFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RenameFileResponse;

                /**
                 * Decodes a RenameFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RenameFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RenameFileResponse;

                /**
                 * Verifies a RenameFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RenameFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RenameFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RenameFileResponse;

                /**
                 * Creates a plain object from a RenameFileResponse message. Also converts values to other types if specified.
                 * @param message RenameFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RenameFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RenameFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RenameFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DeleteFileRequest. */
            interface IDeleteFileRequest {

                /** DeleteFileRequest path */
                path?: (string|null);
            }

            /** Represents a DeleteFileRequest. */
            class DeleteFileRequest implements IDeleteFileRequest {

                /**
                 * Constructs a new DeleteFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IDeleteFileRequest);

                /** DeleteFileRequest path. */
                public path: string;

                /**
                 * Creates a new DeleteFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DeleteFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IDeleteFileRequest): tilbo.ipc.v1.DeleteFileRequest;

                /**
                 * Encodes the specified DeleteFileRequest message. Does not implicitly {@link tilbo.ipc.v1.DeleteFileRequest.verify|verify} messages.
                 * @param message DeleteFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IDeleteFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DeleteFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DeleteFileRequest.verify|verify} messages.
                 * @param message DeleteFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IDeleteFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DeleteFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DeleteFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.DeleteFileRequest;

                /**
                 * Decodes a DeleteFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DeleteFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.DeleteFileRequest;

                /**
                 * Verifies a DeleteFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DeleteFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DeleteFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.DeleteFileRequest;

                /**
                 * Creates a plain object from a DeleteFileRequest message. Also converts values to other types if specified.
                 * @param message DeleteFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.DeleteFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DeleteFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DeleteFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DeleteFileResponse. */
            interface IDeleteFileResponse {
            }

            /** Represents a DeleteFileResponse. */
            class DeleteFileResponse implements IDeleteFileResponse {

                /**
                 * Constructs a new DeleteFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IDeleteFileResponse);

                /**
                 * Creates a new DeleteFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DeleteFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IDeleteFileResponse): tilbo.ipc.v1.DeleteFileResponse;

                /**
                 * Encodes the specified DeleteFileResponse message. Does not implicitly {@link tilbo.ipc.v1.DeleteFileResponse.verify|verify} messages.
                 * @param message DeleteFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IDeleteFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DeleteFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DeleteFileResponse.verify|verify} messages.
                 * @param message DeleteFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IDeleteFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DeleteFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DeleteFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.DeleteFileResponse;

                /**
                 * Decodes a DeleteFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DeleteFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.DeleteFileResponse;

                /**
                 * Verifies a DeleteFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DeleteFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DeleteFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.DeleteFileResponse;

                /**
                 * Creates a plain object from a DeleteFileResponse message. Also converts values to other types if specified.
                 * @param message DeleteFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.DeleteFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DeleteFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DeleteFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ChmodFileRequest. */
            interface IChmodFileRequest {

                /** ChmodFileRequest path */
                path?: (string|null);

                /** ChmodFileRequest mode */
                mode?: (number|null);
            }

            /** Represents a ChmodFileRequest. */
            class ChmodFileRequest implements IChmodFileRequest {

                /**
                 * Constructs a new ChmodFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IChmodFileRequest);

                /** ChmodFileRequest path. */
                public path: string;

                /** ChmodFileRequest mode. */
                public mode: number;

                /**
                 * Creates a new ChmodFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ChmodFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IChmodFileRequest): tilbo.ipc.v1.ChmodFileRequest;

                /**
                 * Encodes the specified ChmodFileRequest message. Does not implicitly {@link tilbo.ipc.v1.ChmodFileRequest.verify|verify} messages.
                 * @param message ChmodFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IChmodFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ChmodFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ChmodFileRequest.verify|verify} messages.
                 * @param message ChmodFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IChmodFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ChmodFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ChmodFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ChmodFileRequest;

                /**
                 * Decodes a ChmodFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ChmodFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ChmodFileRequest;

                /**
                 * Verifies a ChmodFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ChmodFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ChmodFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ChmodFileRequest;

                /**
                 * Creates a plain object from a ChmodFileRequest message. Also converts values to other types if specified.
                 * @param message ChmodFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ChmodFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ChmodFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ChmodFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ChmodFileResponse. */
            interface IChmodFileResponse {
            }

            /** Represents a ChmodFileResponse. */
            class ChmodFileResponse implements IChmodFileResponse {

                /**
                 * Constructs a new ChmodFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IChmodFileResponse);

                /**
                 * Creates a new ChmodFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ChmodFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IChmodFileResponse): tilbo.ipc.v1.ChmodFileResponse;

                /**
                 * Encodes the specified ChmodFileResponse message. Does not implicitly {@link tilbo.ipc.v1.ChmodFileResponse.verify|verify} messages.
                 * @param message ChmodFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IChmodFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ChmodFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ChmodFileResponse.verify|verify} messages.
                 * @param message ChmodFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IChmodFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ChmodFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ChmodFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ChmodFileResponse;

                /**
                 * Decodes a ChmodFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ChmodFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ChmodFileResponse;

                /**
                 * Verifies a ChmodFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ChmodFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ChmodFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ChmodFileResponse;

                /**
                 * Creates a plain object from a ChmodFileResponse message. Also converts values to other types if specified.
                 * @param message ChmodFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ChmodFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ChmodFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ChmodFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListPlacesRequest. */
            interface IListPlacesRequest {
            }

            /** Represents a ListPlacesRequest. */
            class ListPlacesRequest implements IListPlacesRequest {

                /**
                 * Constructs a new ListPlacesRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListPlacesRequest);

                /**
                 * Creates a new ListPlacesRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListPlacesRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListPlacesRequest): tilbo.ipc.v1.ListPlacesRequest;

                /**
                 * Encodes the specified ListPlacesRequest message. Does not implicitly {@link tilbo.ipc.v1.ListPlacesRequest.verify|verify} messages.
                 * @param message ListPlacesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListPlacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListPlacesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListPlacesRequest.verify|verify} messages.
                 * @param message ListPlacesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListPlacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListPlacesRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListPlacesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListPlacesRequest;

                /**
                 * Decodes a ListPlacesRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListPlacesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListPlacesRequest;

                /**
                 * Verifies a ListPlacesRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListPlacesRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListPlacesRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListPlacesRequest;

                /**
                 * Creates a plain object from a ListPlacesRequest message. Also converts values to other types if specified.
                 * @param message ListPlacesRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListPlacesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListPlacesRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListPlacesRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PlaceEntry. */
            interface IPlaceEntry {

                /** PlaceEntry name */
                name?: (string|null);

                /** PlaceEntry path */
                path?: (string|null);
            }

            /** Represents a PlaceEntry. */
            class PlaceEntry implements IPlaceEntry {

                /**
                 * Constructs a new PlaceEntry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPlaceEntry);

                /** PlaceEntry name. */
                public name: string;

                /** PlaceEntry path. */
                public path: string;

                /**
                 * Creates a new PlaceEntry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PlaceEntry instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPlaceEntry): tilbo.ipc.v1.PlaceEntry;

                /**
                 * Encodes the specified PlaceEntry message. Does not implicitly {@link tilbo.ipc.v1.PlaceEntry.verify|verify} messages.
                 * @param message PlaceEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPlaceEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PlaceEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PlaceEntry.verify|verify} messages.
                 * @param message PlaceEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPlaceEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PlaceEntry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PlaceEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PlaceEntry;

                /**
                 * Decodes a PlaceEntry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PlaceEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PlaceEntry;

                /**
                 * Verifies a PlaceEntry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PlaceEntry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PlaceEntry
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PlaceEntry;

                /**
                 * Creates a plain object from a PlaceEntry message. Also converts values to other types if specified.
                 * @param message PlaceEntry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PlaceEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PlaceEntry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PlaceEntry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListPlacesResponse. */
            interface IListPlacesResponse {

                /** ListPlacesResponse places */
                places?: (tilbo.ipc.v1.IPlaceEntry[]|null);
            }

            /** Represents a ListPlacesResponse. */
            class ListPlacesResponse implements IListPlacesResponse {

                /**
                 * Constructs a new ListPlacesResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListPlacesResponse);

                /** ListPlacesResponse places. */
                public places: tilbo.ipc.v1.IPlaceEntry[];

                /**
                 * Creates a new ListPlacesResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListPlacesResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListPlacesResponse): tilbo.ipc.v1.ListPlacesResponse;

                /**
                 * Encodes the specified ListPlacesResponse message. Does not implicitly {@link tilbo.ipc.v1.ListPlacesResponse.verify|verify} messages.
                 * @param message ListPlacesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListPlacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListPlacesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListPlacesResponse.verify|verify} messages.
                 * @param message ListPlacesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListPlacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListPlacesResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListPlacesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListPlacesResponse;

                /**
                 * Decodes a ListPlacesResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListPlacesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListPlacesResponse;

                /**
                 * Verifies a ListPlacesResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListPlacesResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListPlacesResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListPlacesResponse;

                /**
                 * Creates a plain object from a ListPlacesResponse message. Also converts values to other types if specified.
                 * @param message ListPlacesResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListPlacesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListPlacesResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListPlacesResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FileTaggedEvent. */
            interface IFileTaggedEvent {

                /** FileTaggedEvent path */
                path?: (string|null);

                /** FileTaggedEvent added */
                added?: (string[]|null);

                /** FileTaggedEvent removed */
                removed?: (string[]|null);
            }

            /** Represents a FileTaggedEvent. */
            class FileTaggedEvent implements IFileTaggedEvent {

                /**
                 * Constructs a new FileTaggedEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IFileTaggedEvent);

                /** FileTaggedEvent path. */
                public path: string;

                /** FileTaggedEvent added. */
                public added: string[];

                /** FileTaggedEvent removed. */
                public removed: string[];

                /**
                 * Creates a new FileTaggedEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FileTaggedEvent instance
                 */
                public static create(properties?: tilbo.ipc.v1.IFileTaggedEvent): tilbo.ipc.v1.FileTaggedEvent;

                /**
                 * Encodes the specified FileTaggedEvent message. Does not implicitly {@link tilbo.ipc.v1.FileTaggedEvent.verify|verify} messages.
                 * @param message FileTaggedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IFileTaggedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FileTaggedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileTaggedEvent.verify|verify} messages.
                 * @param message FileTaggedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IFileTaggedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FileTaggedEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FileTaggedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.FileTaggedEvent;

                /**
                 * Decodes a FileTaggedEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FileTaggedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.FileTaggedEvent;

                /**
                 * Verifies a FileTaggedEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FileTaggedEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FileTaggedEvent
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.FileTaggedEvent;

                /**
                 * Creates a plain object from a FileTaggedEvent message. Also converts values to other types if specified.
                 * @param message FileTaggedEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.FileTaggedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FileTaggedEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FileTaggedEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an IndexUpdatedEvent. */
            interface IIndexUpdatedEvent {

                /** IndexUpdatedEvent filesTotal */
                filesTotal?: (number|Long|null);

                /** IndexUpdatedEvent tagsTotal */
                tagsTotal?: (number|Long|null);
            }

            /** Represents an IndexUpdatedEvent. */
            class IndexUpdatedEvent implements IIndexUpdatedEvent {

                /**
                 * Constructs a new IndexUpdatedEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IIndexUpdatedEvent);

                /** IndexUpdatedEvent filesTotal. */
                public filesTotal: (number|Long);

                /** IndexUpdatedEvent tagsTotal. */
                public tagsTotal: (number|Long);

                /**
                 * Creates a new IndexUpdatedEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns IndexUpdatedEvent instance
                 */
                public static create(properties?: tilbo.ipc.v1.IIndexUpdatedEvent): tilbo.ipc.v1.IndexUpdatedEvent;

                /**
                 * Encodes the specified IndexUpdatedEvent message. Does not implicitly {@link tilbo.ipc.v1.IndexUpdatedEvent.verify|verify} messages.
                 * @param message IndexUpdatedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IIndexUpdatedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified IndexUpdatedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.IndexUpdatedEvent.verify|verify} messages.
                 * @param message IndexUpdatedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IIndexUpdatedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an IndexUpdatedEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns IndexUpdatedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.IndexUpdatedEvent;

                /**
                 * Decodes an IndexUpdatedEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns IndexUpdatedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.IndexUpdatedEvent;

                /**
                 * Verifies an IndexUpdatedEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an IndexUpdatedEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns IndexUpdatedEvent
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.IndexUpdatedEvent;

                /**
                 * Creates a plain object from an IndexUpdatedEvent message. Also converts values to other types if specified.
                 * @param message IndexUpdatedEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.IndexUpdatedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this IndexUpdatedEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for IndexUpdatedEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a DaemonStateChangedEvent. */
            interface IDaemonStateChangedEvent {

                /** DaemonStateChangedEvent state */
                state?: (string|null);
            }

            /** Represents a DaemonStateChangedEvent. */
            class DaemonStateChangedEvent implements IDaemonStateChangedEvent {

                /**
                 * Constructs a new DaemonStateChangedEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IDaemonStateChangedEvent);

                /** DaemonStateChangedEvent state. */
                public state: string;

                /**
                 * Creates a new DaemonStateChangedEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns DaemonStateChangedEvent instance
                 */
                public static create(properties?: tilbo.ipc.v1.IDaemonStateChangedEvent): tilbo.ipc.v1.DaemonStateChangedEvent;

                /**
                 * Encodes the specified DaemonStateChangedEvent message. Does not implicitly {@link tilbo.ipc.v1.DaemonStateChangedEvent.verify|verify} messages.
                 * @param message DaemonStateChangedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IDaemonStateChangedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DaemonStateChangedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DaemonStateChangedEvent.verify|verify} messages.
                 * @param message DaemonStateChangedEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IDaemonStateChangedEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DaemonStateChangedEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DaemonStateChangedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.DaemonStateChangedEvent;

                /**
                 * Decodes a DaemonStateChangedEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DaemonStateChangedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.DaemonStateChangedEvent;

                /**
                 * Verifies a DaemonStateChangedEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DaemonStateChangedEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DaemonStateChangedEvent
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.DaemonStateChangedEvent;

                /**
                 * Creates a plain object from a DaemonStateChangedEvent message. Also converts values to other types if specified.
                 * @param message DaemonStateChangedEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.DaemonStateChangedEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DaemonStateChangedEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for DaemonStateChangedEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}
