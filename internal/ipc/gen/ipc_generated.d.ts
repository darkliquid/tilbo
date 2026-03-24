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

                /** Request listTags */
                listTags?: (tilbo.ipc.v1.IListTagsRequest|null);

                /** Request hydrateTags */
                hydrateTags?: (tilbo.ipc.v1.IHydrateTagsRequest|null);

                /** Request related */
                related?: (tilbo.ipc.v1.IRelatedRequest|null);

                /** Request globSearch */
                globSearch?: (tilbo.ipc.v1.IGlobSearchRequest|null);

                /** Request tag */
                tag?: (tilbo.ipc.v1.ITagRequest|null);

                /** Request metadata */
                metadata?: (tilbo.ipc.v1.IMetadataRequest|null);

                /** Request metadataSet */
                metadataSet?: (tilbo.ipc.v1.IMetadataSetRequest|null);

                /** Request status */
                status?: (tilbo.ipc.v1.IStatusRequest|null);

                /** Request reloadRules */
                reloadRules?: (tilbo.ipc.v1.IReloadRulesRequest|null);

                /** Request listDirectory */
                listDirectory?: (tilbo.ipc.v1.IListDirectoryRequest|null);

                /** Request statFile */
                statFile?: (tilbo.ipc.v1.IStatFileRequest|null);

                /** Request renameFile */
                renameFile?: (tilbo.ipc.v1.IRenameFileRequest|null);

                /** Request deleteFile */
                deleteFile?: (tilbo.ipc.v1.IDeleteFileRequest|null);

                /** Request chmodFile */
                chmodFile?: (tilbo.ipc.v1.IChmodFileRequest|null);

                /** Request copy */
                copy?: (tilbo.ipc.v1.ICopyRequest|null);

                /** Request paste */
                paste?: (tilbo.ipc.v1.IPasteRequest|null);

                /** Request createFile */
                createFile?: (tilbo.ipc.v1.ICreateFileRequest|null);

                /** Request createDirectory */
                createDirectory?: (tilbo.ipc.v1.ICreateDirectoryRequest|null);

                /** Request listPlaces */
                listPlaces?: (tilbo.ipc.v1.IListPlacesRequest|null);

                /** Request pinPlace */
                pinPlace?: (tilbo.ipc.v1.IPinPlaceRequest|null);

                /** Request unpinPlace */
                unpinPlace?: (tilbo.ipc.v1.IUnpinPlaceRequest|null);

                /** Request trashFile */
                trashFile?: (tilbo.ipc.v1.ITrashFileRequest|null);

                /** Request listTrash */
                listTrash?: (tilbo.ipc.v1.IListTrashRequest|null);

                /** Request restoreTrash */
                restoreTrash?: (tilbo.ipc.v1.IRestoreTrashRequest|null);

                /** Request emptyTrash */
                emptyTrash?: (tilbo.ipc.v1.IEmptyTrashRequest|null);

                /** Request listAppsForFile */
                listAppsForFile?: (tilbo.ipc.v1.IListAppsForFileRequest|null);

                /** Request openWithApp */
                openWithApp?: (tilbo.ipc.v1.IOpenWithAppRequest|null);

                /** Request getBrowserConfig */
                getBrowserConfig?: (tilbo.ipc.v1.IGetBrowserConfigRequest|null);

                /** Request launchGui */
                launchGui?: (tilbo.ipc.v1.ILaunchGUIRequest|null);

                /** Request getThumbnail */
                getThumbnail?: (tilbo.ipc.v1.IGetThumbnailRequest|null);

                /** Request listMounts */
                listMounts?: (tilbo.ipc.v1.IListMountsRequest|null);

                /** Request getFileBadges */
                getFileBadges?: (tilbo.ipc.v1.IGetFileBadgesRequest|null);

                /** Request getFileActions */
                getFileActions?: (tilbo.ipc.v1.IGetFileActionsRequest|null);

                /** Request runFileAction */
                runFileAction?: (tilbo.ipc.v1.IRunFileActionRequest|null);

                /** Request pinSearch */
                pinSearch?: (tilbo.ipc.v1.IPinSearchRequest|null);

                /** Request unpinSearch */
                unpinSearch?: (tilbo.ipc.v1.IUnpinSearchRequest|null);

                /** Request listSavedSearches */
                listSavedSearches?: (tilbo.ipc.v1.IListSavedSearchesRequest|null);
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

                /** Request listTags. */
                public listTags?: (tilbo.ipc.v1.IListTagsRequest|null);

                /** Request hydrateTags. */
                public hydrateTags?: (tilbo.ipc.v1.IHydrateTagsRequest|null);

                /** Request related. */
                public related?: (tilbo.ipc.v1.IRelatedRequest|null);

                /** Request globSearch. */
                public globSearch?: (tilbo.ipc.v1.IGlobSearchRequest|null);

                /** Request tag. */
                public tag?: (tilbo.ipc.v1.ITagRequest|null);

                /** Request metadata. */
                public metadata?: (tilbo.ipc.v1.IMetadataRequest|null);

                /** Request metadataSet. */
                public metadataSet?: (tilbo.ipc.v1.IMetadataSetRequest|null);

                /** Request status. */
                public status?: (tilbo.ipc.v1.IStatusRequest|null);

                /** Request reloadRules. */
                public reloadRules?: (tilbo.ipc.v1.IReloadRulesRequest|null);

                /** Request listDirectory. */
                public listDirectory?: (tilbo.ipc.v1.IListDirectoryRequest|null);

                /** Request statFile. */
                public statFile?: (tilbo.ipc.v1.IStatFileRequest|null);

                /** Request renameFile. */
                public renameFile?: (tilbo.ipc.v1.IRenameFileRequest|null);

                /** Request deleteFile. */
                public deleteFile?: (tilbo.ipc.v1.IDeleteFileRequest|null);

                /** Request chmodFile. */
                public chmodFile?: (tilbo.ipc.v1.IChmodFileRequest|null);

                /** Request copy. */
                public copy?: (tilbo.ipc.v1.ICopyRequest|null);

                /** Request paste. */
                public paste?: (tilbo.ipc.v1.IPasteRequest|null);

                /** Request createFile. */
                public createFile?: (tilbo.ipc.v1.ICreateFileRequest|null);

                /** Request createDirectory. */
                public createDirectory?: (tilbo.ipc.v1.ICreateDirectoryRequest|null);

                /** Request listPlaces. */
                public listPlaces?: (tilbo.ipc.v1.IListPlacesRequest|null);

                /** Request pinPlace. */
                public pinPlace?: (tilbo.ipc.v1.IPinPlaceRequest|null);

                /** Request unpinPlace. */
                public unpinPlace?: (tilbo.ipc.v1.IUnpinPlaceRequest|null);

                /** Request trashFile. */
                public trashFile?: (tilbo.ipc.v1.ITrashFileRequest|null);

                /** Request listTrash. */
                public listTrash?: (tilbo.ipc.v1.IListTrashRequest|null);

                /** Request restoreTrash. */
                public restoreTrash?: (tilbo.ipc.v1.IRestoreTrashRequest|null);

                /** Request emptyTrash. */
                public emptyTrash?: (tilbo.ipc.v1.IEmptyTrashRequest|null);

                /** Request listAppsForFile. */
                public listAppsForFile?: (tilbo.ipc.v1.IListAppsForFileRequest|null);

                /** Request openWithApp. */
                public openWithApp?: (tilbo.ipc.v1.IOpenWithAppRequest|null);

                /** Request getBrowserConfig. */
                public getBrowserConfig?: (tilbo.ipc.v1.IGetBrowserConfigRequest|null);

                /** Request launchGui. */
                public launchGui?: (tilbo.ipc.v1.ILaunchGUIRequest|null);

                /** Request getThumbnail. */
                public getThumbnail?: (tilbo.ipc.v1.IGetThumbnailRequest|null);

                /** Request listMounts. */
                public listMounts?: (tilbo.ipc.v1.IListMountsRequest|null);

                /** Request getFileBadges. */
                public getFileBadges?: (tilbo.ipc.v1.IGetFileBadgesRequest|null);

                /** Request getFileActions. */
                public getFileActions?: (tilbo.ipc.v1.IGetFileActionsRequest|null);

                /** Request runFileAction. */
                public runFileAction?: (tilbo.ipc.v1.IRunFileActionRequest|null);

                /** Request pinSearch. */
                public pinSearch?: (tilbo.ipc.v1.IPinSearchRequest|null);

                /** Request unpinSearch. */
                public unpinSearch?: (tilbo.ipc.v1.IUnpinSearchRequest|null);

                /** Request listSavedSearches. */
                public listSavedSearches?: (tilbo.ipc.v1.IListSavedSearchesRequest|null);

                /** Request kind. */
                public kind?: ("search"|"listTags"|"hydrateTags"|"related"|"globSearch"|"tag"|"metadata"|"metadataSet"|"status"|"reloadRules"|"listDirectory"|"statFile"|"renameFile"|"deleteFile"|"chmodFile"|"copy"|"paste"|"createFile"|"createDirectory"|"listPlaces"|"pinPlace"|"unpinPlace"|"trashFile"|"listTrash"|"restoreTrash"|"emptyTrash"|"listAppsForFile"|"openWithApp"|"getBrowserConfig"|"launchGui"|"getThumbnail"|"listMounts"|"getFileBadges"|"getFileActions"|"runFileAction"|"pinSearch"|"unpinSearch"|"listSavedSearches");

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

                /** Response listTags */
                listTags?: (tilbo.ipc.v1.IListTagsResponse|null);

                /** Response hydrateTags */
                hydrateTags?: (tilbo.ipc.v1.IHydrateTagsResponse|null);

                /** Response related */
                related?: (tilbo.ipc.v1.IRelatedResponse|null);

                /** Response globSearch */
                globSearch?: (tilbo.ipc.v1.IGlobSearchResponse|null);

                /** Response tag */
                tag?: (tilbo.ipc.v1.ITagResponse|null);

                /** Response metadata */
                metadata?: (tilbo.ipc.v1.IMetadataResponse|null);

                /** Response status */
                status?: (tilbo.ipc.v1.IStatusResponse|null);

                /** Response reloadRules */
                reloadRules?: (tilbo.ipc.v1.IReloadRulesResponse|null);

                /** Response listDirectory */
                listDirectory?: (tilbo.ipc.v1.IListDirectoryResponse|null);

                /** Response statFile */
                statFile?: (tilbo.ipc.v1.IStatFileResponse|null);

                /** Response renameFile */
                renameFile?: (tilbo.ipc.v1.IRenameFileResponse|null);

                /** Response deleteFile */
                deleteFile?: (tilbo.ipc.v1.IDeleteFileResponse|null);

                /** Response chmodFile */
                chmodFile?: (tilbo.ipc.v1.IChmodFileResponse|null);

                /** Response copy */
                copy?: (tilbo.ipc.v1.ICopyResponse|null);

                /** Response paste */
                paste?: (tilbo.ipc.v1.IPasteResponse|null);

                /** Response createFile */
                createFile?: (tilbo.ipc.v1.ICreateFileResponse|null);

                /** Response createDirectory */
                createDirectory?: (tilbo.ipc.v1.ICreateDirectoryResponse|null);

                /** Response listPlaces */
                listPlaces?: (tilbo.ipc.v1.IListPlacesResponse|null);

                /** Response pinPlace */
                pinPlace?: (tilbo.ipc.v1.IPinPlaceResponse|null);

                /** Response unpinPlace */
                unpinPlace?: (tilbo.ipc.v1.IUnpinPlaceResponse|null);

                /** Response trashFile */
                trashFile?: (tilbo.ipc.v1.ITrashFileResponse|null);

                /** Response listTrash */
                listTrash?: (tilbo.ipc.v1.IListTrashResponse|null);

                /** Response restoreTrash */
                restoreTrash?: (tilbo.ipc.v1.IRestoreTrashResponse|null);

                /** Response emptyTrash */
                emptyTrash?: (tilbo.ipc.v1.IEmptyTrashResponse|null);

                /** Response listAppsForFile */
                listAppsForFile?: (tilbo.ipc.v1.IListAppsForFileResponse|null);

                /** Response openWithApp */
                openWithApp?: (tilbo.ipc.v1.IOpenWithAppResponse|null);

                /** Response getBrowserConfig */
                getBrowserConfig?: (tilbo.ipc.v1.IGetBrowserConfigResponse|null);

                /** Response launchGui */
                launchGui?: (tilbo.ipc.v1.ILaunchGUIResponse|null);

                /** Response getThumbnail */
                getThumbnail?: (tilbo.ipc.v1.IGetThumbnailResponse|null);

                /** Response listMounts */
                listMounts?: (tilbo.ipc.v1.IListMountsResponse|null);

                /** Response getFileBadges */
                getFileBadges?: (tilbo.ipc.v1.IGetFileBadgesResponse|null);

                /** Response getFileActions */
                getFileActions?: (tilbo.ipc.v1.IGetFileActionsResponse|null);

                /** Response runFileAction */
                runFileAction?: (tilbo.ipc.v1.IRunFileActionResponse|null);

                /** Response pinSearch */
                pinSearch?: (tilbo.ipc.v1.IPinSearchResponse|null);

                /** Response unpinSearch */
                unpinSearch?: (tilbo.ipc.v1.IUnpinSearchResponse|null);

                /** Response listSavedSearches */
                listSavedSearches?: (tilbo.ipc.v1.IListSavedSearchesResponse|null);
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

                /** Response listTags. */
                public listTags?: (tilbo.ipc.v1.IListTagsResponse|null);

                /** Response hydrateTags. */
                public hydrateTags?: (tilbo.ipc.v1.IHydrateTagsResponse|null);

                /** Response related. */
                public related?: (tilbo.ipc.v1.IRelatedResponse|null);

                /** Response globSearch. */
                public globSearch?: (tilbo.ipc.v1.IGlobSearchResponse|null);

                /** Response tag. */
                public tag?: (tilbo.ipc.v1.ITagResponse|null);

                /** Response metadata. */
                public metadata?: (tilbo.ipc.v1.IMetadataResponse|null);

                /** Response status. */
                public status?: (tilbo.ipc.v1.IStatusResponse|null);

                /** Response reloadRules. */
                public reloadRules?: (tilbo.ipc.v1.IReloadRulesResponse|null);

                /** Response listDirectory. */
                public listDirectory?: (tilbo.ipc.v1.IListDirectoryResponse|null);

                /** Response statFile. */
                public statFile?: (tilbo.ipc.v1.IStatFileResponse|null);

                /** Response renameFile. */
                public renameFile?: (tilbo.ipc.v1.IRenameFileResponse|null);

                /** Response deleteFile. */
                public deleteFile?: (tilbo.ipc.v1.IDeleteFileResponse|null);

                /** Response chmodFile. */
                public chmodFile?: (tilbo.ipc.v1.IChmodFileResponse|null);

                /** Response copy. */
                public copy?: (tilbo.ipc.v1.ICopyResponse|null);

                /** Response paste. */
                public paste?: (tilbo.ipc.v1.IPasteResponse|null);

                /** Response createFile. */
                public createFile?: (tilbo.ipc.v1.ICreateFileResponse|null);

                /** Response createDirectory. */
                public createDirectory?: (tilbo.ipc.v1.ICreateDirectoryResponse|null);

                /** Response listPlaces. */
                public listPlaces?: (tilbo.ipc.v1.IListPlacesResponse|null);

                /** Response pinPlace. */
                public pinPlace?: (tilbo.ipc.v1.IPinPlaceResponse|null);

                /** Response unpinPlace. */
                public unpinPlace?: (tilbo.ipc.v1.IUnpinPlaceResponse|null);

                /** Response trashFile. */
                public trashFile?: (tilbo.ipc.v1.ITrashFileResponse|null);

                /** Response listTrash. */
                public listTrash?: (tilbo.ipc.v1.IListTrashResponse|null);

                /** Response restoreTrash. */
                public restoreTrash?: (tilbo.ipc.v1.IRestoreTrashResponse|null);

                /** Response emptyTrash. */
                public emptyTrash?: (tilbo.ipc.v1.IEmptyTrashResponse|null);

                /** Response listAppsForFile. */
                public listAppsForFile?: (tilbo.ipc.v1.IListAppsForFileResponse|null);

                /** Response openWithApp. */
                public openWithApp?: (tilbo.ipc.v1.IOpenWithAppResponse|null);

                /** Response getBrowserConfig. */
                public getBrowserConfig?: (tilbo.ipc.v1.IGetBrowserConfigResponse|null);

                /** Response launchGui. */
                public launchGui?: (tilbo.ipc.v1.ILaunchGUIResponse|null);

                /** Response getThumbnail. */
                public getThumbnail?: (tilbo.ipc.v1.IGetThumbnailResponse|null);

                /** Response listMounts. */
                public listMounts?: (tilbo.ipc.v1.IListMountsResponse|null);

                /** Response getFileBadges. */
                public getFileBadges?: (tilbo.ipc.v1.IGetFileBadgesResponse|null);

                /** Response getFileActions. */
                public getFileActions?: (tilbo.ipc.v1.IGetFileActionsResponse|null);

                /** Response runFileAction. */
                public runFileAction?: (tilbo.ipc.v1.IRunFileActionResponse|null);

                /** Response pinSearch. */
                public pinSearch?: (tilbo.ipc.v1.IPinSearchResponse|null);

                /** Response unpinSearch. */
                public unpinSearch?: (tilbo.ipc.v1.IUnpinSearchResponse|null);

                /** Response listSavedSearches. */
                public listSavedSearches?: (tilbo.ipc.v1.IListSavedSearchesResponse|null);

                /** Response kind. */
                public kind?: ("error"|"search"|"listTags"|"hydrateTags"|"related"|"globSearch"|"tag"|"metadata"|"status"|"reloadRules"|"listDirectory"|"statFile"|"renameFile"|"deleteFile"|"chmodFile"|"copy"|"paste"|"createFile"|"createDirectory"|"listPlaces"|"pinPlace"|"unpinPlace"|"trashFile"|"listTrash"|"restoreTrash"|"emptyTrash"|"listAppsForFile"|"openWithApp"|"getBrowserConfig"|"launchGui"|"getThumbnail"|"listMounts"|"getFileBadges"|"getFileActions"|"runFileAction"|"pinSearch"|"unpinSearch"|"listSavedSearches");

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

                /** Event showWindow */
                showWindow?: (tilbo.ipc.v1.IShowWindowEvent|null);
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

                /** Event showWindow. */
                public showWindow?: (tilbo.ipc.v1.IShowWindowEvent|null);

                /** Event kind. */
                public kind?: ("fileTagged"|"indexUpdated"|"daemonStateChanged"|"showWindow");

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

                /** FileResult isLink */
                isLink?: (boolean|null);

                /** FileResult linkTarget */
                linkTarget?: (string|null);
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

                /** FileResult isLink. */
                public isLink: boolean;

                /** FileResult linkTarget. */
                public linkTarget: string;

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

                /** DirEntry mimeType */
                mimeType?: (string|null);

                /** DirEntry iconName */
                iconName?: (string|null);

                /** DirEntry isLink */
                isLink?: (boolean|null);

                /** DirEntry linkTarget */
                linkTarget?: (string|null);
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

                /** DirEntry mimeType. */
                public mimeType: string;

                /** DirEntry iconName. */
                public iconName: string;

                /** DirEntry isLink. */
                public isLink: boolean;

                /** DirEntry linkTarget. */
                public linkTarget: string;

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

                /** PlaceEntry pinned */
                pinned?: (boolean|null);

                /** PlaceEntry iconName */
                iconName?: (string|null);
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

                /** PlaceEntry pinned. */
                public pinned: boolean;

                /** PlaceEntry iconName. */
                public iconName: string;

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

            /** Properties of a PinPlaceRequest. */
            interface IPinPlaceRequest {

                /** PinPlaceRequest name */
                name?: (string|null);

                /** PinPlaceRequest path */
                path?: (string|null);

                /** PinPlaceRequest iconName */
                iconName?: (string|null);
            }

            /** Represents a PinPlaceRequest. */
            class PinPlaceRequest implements IPinPlaceRequest {

                /**
                 * Constructs a new PinPlaceRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPinPlaceRequest);

                /** PinPlaceRequest name. */
                public name: string;

                /** PinPlaceRequest path. */
                public path: string;

                /** PinPlaceRequest iconName. */
                public iconName: string;

                /**
                 * Creates a new PinPlaceRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PinPlaceRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPinPlaceRequest): tilbo.ipc.v1.PinPlaceRequest;

                /**
                 * Encodes the specified PinPlaceRequest message. Does not implicitly {@link tilbo.ipc.v1.PinPlaceRequest.verify|verify} messages.
                 * @param message PinPlaceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPinPlaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PinPlaceRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PinPlaceRequest.verify|verify} messages.
                 * @param message PinPlaceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPinPlaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PinPlaceRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PinPlaceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PinPlaceRequest;

                /**
                 * Decodes a PinPlaceRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PinPlaceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PinPlaceRequest;

                /**
                 * Verifies a PinPlaceRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PinPlaceRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PinPlaceRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PinPlaceRequest;

                /**
                 * Creates a plain object from a PinPlaceRequest message. Also converts values to other types if specified.
                 * @param message PinPlaceRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PinPlaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PinPlaceRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PinPlaceRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PinPlaceResponse. */
            interface IPinPlaceResponse {
            }

            /** Represents a PinPlaceResponse. */
            class PinPlaceResponse implements IPinPlaceResponse {

                /**
                 * Constructs a new PinPlaceResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPinPlaceResponse);

                /**
                 * Creates a new PinPlaceResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PinPlaceResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPinPlaceResponse): tilbo.ipc.v1.PinPlaceResponse;

                /**
                 * Encodes the specified PinPlaceResponse message. Does not implicitly {@link tilbo.ipc.v1.PinPlaceResponse.verify|verify} messages.
                 * @param message PinPlaceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPinPlaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PinPlaceResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PinPlaceResponse.verify|verify} messages.
                 * @param message PinPlaceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPinPlaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PinPlaceResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PinPlaceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PinPlaceResponse;

                /**
                 * Decodes a PinPlaceResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PinPlaceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PinPlaceResponse;

                /**
                 * Verifies a PinPlaceResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PinPlaceResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PinPlaceResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PinPlaceResponse;

                /**
                 * Creates a plain object from a PinPlaceResponse message. Also converts values to other types if specified.
                 * @param message PinPlaceResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PinPlaceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PinPlaceResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PinPlaceResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an UnpinPlaceRequest. */
            interface IUnpinPlaceRequest {

                /** UnpinPlaceRequest path */
                path?: (string|null);
            }

            /** Represents an UnpinPlaceRequest. */
            class UnpinPlaceRequest implements IUnpinPlaceRequest {

                /**
                 * Constructs a new UnpinPlaceRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IUnpinPlaceRequest);

                /** UnpinPlaceRequest path. */
                public path: string;

                /**
                 * Creates a new UnpinPlaceRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UnpinPlaceRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IUnpinPlaceRequest): tilbo.ipc.v1.UnpinPlaceRequest;

                /**
                 * Encodes the specified UnpinPlaceRequest message. Does not implicitly {@link tilbo.ipc.v1.UnpinPlaceRequest.verify|verify} messages.
                 * @param message UnpinPlaceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IUnpinPlaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnpinPlaceRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.UnpinPlaceRequest.verify|verify} messages.
                 * @param message UnpinPlaceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IUnpinPlaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UnpinPlaceRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UnpinPlaceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.UnpinPlaceRequest;

                /**
                 * Decodes an UnpinPlaceRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UnpinPlaceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.UnpinPlaceRequest;

                /**
                 * Verifies an UnpinPlaceRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UnpinPlaceRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnpinPlaceRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.UnpinPlaceRequest;

                /**
                 * Creates a plain object from an UnpinPlaceRequest message. Also converts values to other types if specified.
                 * @param message UnpinPlaceRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.UnpinPlaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnpinPlaceRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UnpinPlaceRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an UnpinPlaceResponse. */
            interface IUnpinPlaceResponse {
            }

            /** Represents an UnpinPlaceResponse. */
            class UnpinPlaceResponse implements IUnpinPlaceResponse {

                /**
                 * Constructs a new UnpinPlaceResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IUnpinPlaceResponse);

                /**
                 * Creates a new UnpinPlaceResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UnpinPlaceResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IUnpinPlaceResponse): tilbo.ipc.v1.UnpinPlaceResponse;

                /**
                 * Encodes the specified UnpinPlaceResponse message. Does not implicitly {@link tilbo.ipc.v1.UnpinPlaceResponse.verify|verify} messages.
                 * @param message UnpinPlaceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IUnpinPlaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnpinPlaceResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.UnpinPlaceResponse.verify|verify} messages.
                 * @param message UnpinPlaceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IUnpinPlaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UnpinPlaceResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UnpinPlaceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.UnpinPlaceResponse;

                /**
                 * Decodes an UnpinPlaceResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UnpinPlaceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.UnpinPlaceResponse;

                /**
                 * Verifies an UnpinPlaceResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UnpinPlaceResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnpinPlaceResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.UnpinPlaceResponse;

                /**
                 * Creates a plain object from an UnpinPlaceResponse message. Also converts values to other types if specified.
                 * @param message UnpinPlaceResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.UnpinPlaceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnpinPlaceResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UnpinPlaceResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a TrashFileRequest. */
            interface ITrashFileRequest {

                /** TrashFileRequest path */
                path?: (string|null);
            }

            /** Represents a TrashFileRequest. */
            class TrashFileRequest implements ITrashFileRequest {

                /**
                 * Constructs a new TrashFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ITrashFileRequest);

                /** TrashFileRequest path. */
                public path: string;

                /**
                 * Creates a new TrashFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TrashFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ITrashFileRequest): tilbo.ipc.v1.TrashFileRequest;

                /**
                 * Encodes the specified TrashFileRequest message. Does not implicitly {@link tilbo.ipc.v1.TrashFileRequest.verify|verify} messages.
                 * @param message TrashFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ITrashFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TrashFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TrashFileRequest.verify|verify} messages.
                 * @param message TrashFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ITrashFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TrashFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TrashFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.TrashFileRequest;

                /**
                 * Decodes a TrashFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TrashFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.TrashFileRequest;

                /**
                 * Verifies a TrashFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TrashFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TrashFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.TrashFileRequest;

                /**
                 * Creates a plain object from a TrashFileRequest message. Also converts values to other types if specified.
                 * @param message TrashFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.TrashFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TrashFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TrashFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a TrashFileResponse. */
            interface ITrashFileResponse {
            }

            /** Represents a TrashFileResponse. */
            class TrashFileResponse implements ITrashFileResponse {

                /**
                 * Constructs a new TrashFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ITrashFileResponse);

                /**
                 * Creates a new TrashFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TrashFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ITrashFileResponse): tilbo.ipc.v1.TrashFileResponse;

                /**
                 * Encodes the specified TrashFileResponse message. Does not implicitly {@link tilbo.ipc.v1.TrashFileResponse.verify|verify} messages.
                 * @param message TrashFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ITrashFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TrashFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TrashFileResponse.verify|verify} messages.
                 * @param message TrashFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ITrashFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TrashFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TrashFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.TrashFileResponse;

                /**
                 * Decodes a TrashFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TrashFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.TrashFileResponse;

                /**
                 * Verifies a TrashFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TrashFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TrashFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.TrashFileResponse;

                /**
                 * Creates a plain object from a TrashFileResponse message. Also converts values to other types if specified.
                 * @param message TrashFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.TrashFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TrashFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TrashFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListTrashRequest. */
            interface IListTrashRequest {
            }

            /** Represents a ListTrashRequest. */
            class ListTrashRequest implements IListTrashRequest {

                /**
                 * Constructs a new ListTrashRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListTrashRequest);

                /**
                 * Creates a new ListTrashRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListTrashRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListTrashRequest): tilbo.ipc.v1.ListTrashRequest;

                /**
                 * Encodes the specified ListTrashRequest message. Does not implicitly {@link tilbo.ipc.v1.ListTrashRequest.verify|verify} messages.
                 * @param message ListTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListTrashRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTrashRequest.verify|verify} messages.
                 * @param message ListTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListTrashRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListTrashRequest;

                /**
                 * Decodes a ListTrashRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListTrashRequest;

                /**
                 * Verifies a ListTrashRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListTrashRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListTrashRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListTrashRequest;

                /**
                 * Creates a plain object from a ListTrashRequest message. Also converts values to other types if specified.
                 * @param message ListTrashRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListTrashRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListTrashRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListTrashRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a TrashEntry. */
            interface ITrashEntry {

                /** TrashEntry name */
                name?: (string|null);

                /** TrashEntry originalPath */
                originalPath?: (string|null);

                /** TrashEntry deletionDate */
                deletionDate?: (number|Long|null);

                /** TrashEntry sizeBytes */
                sizeBytes?: (number|Long|null);
            }

            /** Represents a TrashEntry. */
            class TrashEntry implements ITrashEntry {

                /**
                 * Constructs a new TrashEntry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ITrashEntry);

                /** TrashEntry name. */
                public name: string;

                /** TrashEntry originalPath. */
                public originalPath: string;

                /** TrashEntry deletionDate. */
                public deletionDate: (number|Long);

                /** TrashEntry sizeBytes. */
                public sizeBytes: (number|Long);

                /**
                 * Creates a new TrashEntry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns TrashEntry instance
                 */
                public static create(properties?: tilbo.ipc.v1.ITrashEntry): tilbo.ipc.v1.TrashEntry;

                /**
                 * Encodes the specified TrashEntry message. Does not implicitly {@link tilbo.ipc.v1.TrashEntry.verify|verify} messages.
                 * @param message TrashEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ITrashEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TrashEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TrashEntry.verify|verify} messages.
                 * @param message TrashEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ITrashEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TrashEntry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TrashEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.TrashEntry;

                /**
                 * Decodes a TrashEntry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TrashEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.TrashEntry;

                /**
                 * Verifies a TrashEntry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TrashEntry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TrashEntry
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.TrashEntry;

                /**
                 * Creates a plain object from a TrashEntry message. Also converts values to other types if specified.
                 * @param message TrashEntry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.TrashEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TrashEntry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for TrashEntry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListTrashResponse. */
            interface IListTrashResponse {

                /** ListTrashResponse entries */
                entries?: (tilbo.ipc.v1.ITrashEntry[]|null);
            }

            /** Represents a ListTrashResponse. */
            class ListTrashResponse implements IListTrashResponse {

                /**
                 * Constructs a new ListTrashResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListTrashResponse);

                /** ListTrashResponse entries. */
                public entries: tilbo.ipc.v1.ITrashEntry[];

                /**
                 * Creates a new ListTrashResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListTrashResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListTrashResponse): tilbo.ipc.v1.ListTrashResponse;

                /**
                 * Encodes the specified ListTrashResponse message. Does not implicitly {@link tilbo.ipc.v1.ListTrashResponse.verify|verify} messages.
                 * @param message ListTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListTrashResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTrashResponse.verify|verify} messages.
                 * @param message ListTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListTrashResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListTrashResponse;

                /**
                 * Decodes a ListTrashResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListTrashResponse;

                /**
                 * Verifies a ListTrashResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListTrashResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListTrashResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListTrashResponse;

                /**
                 * Creates a plain object from a ListTrashResponse message. Also converts values to other types if specified.
                 * @param message ListTrashResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListTrashResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListTrashResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListTrashResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RestoreTrashRequest. */
            interface IRestoreTrashRequest {

                /** RestoreTrashRequest trashName */
                trashName?: (string|null);
            }

            /** Represents a RestoreTrashRequest. */
            class RestoreTrashRequest implements IRestoreTrashRequest {

                /**
                 * Constructs a new RestoreTrashRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRestoreTrashRequest);

                /** RestoreTrashRequest trashName. */
                public trashName: string;

                /**
                 * Creates a new RestoreTrashRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RestoreTrashRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRestoreTrashRequest): tilbo.ipc.v1.RestoreTrashRequest;

                /**
                 * Encodes the specified RestoreTrashRequest message. Does not implicitly {@link tilbo.ipc.v1.RestoreTrashRequest.verify|verify} messages.
                 * @param message RestoreTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRestoreTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RestoreTrashRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RestoreTrashRequest.verify|verify} messages.
                 * @param message RestoreTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRestoreTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RestoreTrashRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RestoreTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RestoreTrashRequest;

                /**
                 * Decodes a RestoreTrashRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RestoreTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RestoreTrashRequest;

                /**
                 * Verifies a RestoreTrashRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RestoreTrashRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RestoreTrashRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RestoreTrashRequest;

                /**
                 * Creates a plain object from a RestoreTrashRequest message. Also converts values to other types if specified.
                 * @param message RestoreTrashRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RestoreTrashRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RestoreTrashRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RestoreTrashRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RestoreTrashResponse. */
            interface IRestoreTrashResponse {
            }

            /** Represents a RestoreTrashResponse. */
            class RestoreTrashResponse implements IRestoreTrashResponse {

                /**
                 * Constructs a new RestoreTrashResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRestoreTrashResponse);

                /**
                 * Creates a new RestoreTrashResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RestoreTrashResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRestoreTrashResponse): tilbo.ipc.v1.RestoreTrashResponse;

                /**
                 * Encodes the specified RestoreTrashResponse message. Does not implicitly {@link tilbo.ipc.v1.RestoreTrashResponse.verify|verify} messages.
                 * @param message RestoreTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRestoreTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RestoreTrashResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RestoreTrashResponse.verify|verify} messages.
                 * @param message RestoreTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRestoreTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RestoreTrashResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RestoreTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RestoreTrashResponse;

                /**
                 * Decodes a RestoreTrashResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RestoreTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RestoreTrashResponse;

                /**
                 * Verifies a RestoreTrashResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RestoreTrashResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RestoreTrashResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RestoreTrashResponse;

                /**
                 * Creates a plain object from a RestoreTrashResponse message. Also converts values to other types if specified.
                 * @param message RestoreTrashResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RestoreTrashResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RestoreTrashResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RestoreTrashResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an EmptyTrashRequest. */
            interface IEmptyTrashRequest {
            }

            /** Represents an EmptyTrashRequest. */
            class EmptyTrashRequest implements IEmptyTrashRequest {

                /**
                 * Constructs a new EmptyTrashRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IEmptyTrashRequest);

                /**
                 * Creates a new EmptyTrashRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EmptyTrashRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IEmptyTrashRequest): tilbo.ipc.v1.EmptyTrashRequest;

                /**
                 * Encodes the specified EmptyTrashRequest message. Does not implicitly {@link tilbo.ipc.v1.EmptyTrashRequest.verify|verify} messages.
                 * @param message EmptyTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IEmptyTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EmptyTrashRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.EmptyTrashRequest.verify|verify} messages.
                 * @param message EmptyTrashRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IEmptyTrashRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EmptyTrashRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EmptyTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.EmptyTrashRequest;

                /**
                 * Decodes an EmptyTrashRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EmptyTrashRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.EmptyTrashRequest;

                /**
                 * Verifies an EmptyTrashRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EmptyTrashRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EmptyTrashRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.EmptyTrashRequest;

                /**
                 * Creates a plain object from an EmptyTrashRequest message. Also converts values to other types if specified.
                 * @param message EmptyTrashRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.EmptyTrashRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EmptyTrashRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for EmptyTrashRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an EmptyTrashResponse. */
            interface IEmptyTrashResponse {
            }

            /** Represents an EmptyTrashResponse. */
            class EmptyTrashResponse implements IEmptyTrashResponse {

                /**
                 * Constructs a new EmptyTrashResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IEmptyTrashResponse);

                /**
                 * Creates a new EmptyTrashResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EmptyTrashResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IEmptyTrashResponse): tilbo.ipc.v1.EmptyTrashResponse;

                /**
                 * Encodes the specified EmptyTrashResponse message. Does not implicitly {@link tilbo.ipc.v1.EmptyTrashResponse.verify|verify} messages.
                 * @param message EmptyTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IEmptyTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EmptyTrashResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.EmptyTrashResponse.verify|verify} messages.
                 * @param message EmptyTrashResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IEmptyTrashResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EmptyTrashResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EmptyTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.EmptyTrashResponse;

                /**
                 * Decodes an EmptyTrashResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EmptyTrashResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.EmptyTrashResponse;

                /**
                 * Verifies an EmptyTrashResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EmptyTrashResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EmptyTrashResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.EmptyTrashResponse;

                /**
                 * Creates a plain object from an EmptyTrashResponse message. Also converts values to other types if specified.
                 * @param message EmptyTrashResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.EmptyTrashResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EmptyTrashResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for EmptyTrashResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an AppEntry. */
            interface IAppEntry {

                /** AppEntry id */
                id?: (string|null);

                /** AppEntry name */
                name?: (string|null);

                /** AppEntry iconName */
                iconName?: (string|null);
            }

            /** Represents an AppEntry. */
            class AppEntry implements IAppEntry {

                /**
                 * Constructs a new AppEntry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IAppEntry);

                /** AppEntry id. */
                public id: string;

                /** AppEntry name. */
                public name: string;

                /** AppEntry iconName. */
                public iconName: string;

                /**
                 * Creates a new AppEntry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns AppEntry instance
                 */
                public static create(properties?: tilbo.ipc.v1.IAppEntry): tilbo.ipc.v1.AppEntry;

                /**
                 * Encodes the specified AppEntry message. Does not implicitly {@link tilbo.ipc.v1.AppEntry.verify|verify} messages.
                 * @param message AppEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IAppEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified AppEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.AppEntry.verify|verify} messages.
                 * @param message AppEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IAppEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an AppEntry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns AppEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.AppEntry;

                /**
                 * Decodes an AppEntry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns AppEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.AppEntry;

                /**
                 * Verifies an AppEntry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an AppEntry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns AppEntry
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.AppEntry;

                /**
                 * Creates a plain object from an AppEntry message. Also converts values to other types if specified.
                 * @param message AppEntry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.AppEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this AppEntry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for AppEntry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListAppsForFileRequest. */
            interface IListAppsForFileRequest {

                /** ListAppsForFileRequest path */
                path?: (string|null);
            }

            /** Represents a ListAppsForFileRequest. */
            class ListAppsForFileRequest implements IListAppsForFileRequest {

                /**
                 * Constructs a new ListAppsForFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListAppsForFileRequest);

                /** ListAppsForFileRequest path. */
                public path: string;

                /**
                 * Creates a new ListAppsForFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListAppsForFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListAppsForFileRequest): tilbo.ipc.v1.ListAppsForFileRequest;

                /**
                 * Encodes the specified ListAppsForFileRequest message. Does not implicitly {@link tilbo.ipc.v1.ListAppsForFileRequest.verify|verify} messages.
                 * @param message ListAppsForFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListAppsForFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListAppsForFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListAppsForFileRequest.verify|verify} messages.
                 * @param message ListAppsForFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListAppsForFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListAppsForFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListAppsForFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListAppsForFileRequest;

                /**
                 * Decodes a ListAppsForFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListAppsForFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListAppsForFileRequest;

                /**
                 * Verifies a ListAppsForFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListAppsForFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListAppsForFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListAppsForFileRequest;

                /**
                 * Creates a plain object from a ListAppsForFileRequest message. Also converts values to other types if specified.
                 * @param message ListAppsForFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListAppsForFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListAppsForFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListAppsForFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListAppsForFileResponse. */
            interface IListAppsForFileResponse {

                /** ListAppsForFileResponse apps */
                apps?: (tilbo.ipc.v1.IAppEntry[]|null);
            }

            /** Represents a ListAppsForFileResponse. */
            class ListAppsForFileResponse implements IListAppsForFileResponse {

                /**
                 * Constructs a new ListAppsForFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListAppsForFileResponse);

                /** ListAppsForFileResponse apps. */
                public apps: tilbo.ipc.v1.IAppEntry[];

                /**
                 * Creates a new ListAppsForFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListAppsForFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListAppsForFileResponse): tilbo.ipc.v1.ListAppsForFileResponse;

                /**
                 * Encodes the specified ListAppsForFileResponse message. Does not implicitly {@link tilbo.ipc.v1.ListAppsForFileResponse.verify|verify} messages.
                 * @param message ListAppsForFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListAppsForFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListAppsForFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListAppsForFileResponse.verify|verify} messages.
                 * @param message ListAppsForFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListAppsForFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListAppsForFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListAppsForFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListAppsForFileResponse;

                /**
                 * Decodes a ListAppsForFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListAppsForFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListAppsForFileResponse;

                /**
                 * Verifies a ListAppsForFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListAppsForFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListAppsForFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListAppsForFileResponse;

                /**
                 * Creates a plain object from a ListAppsForFileResponse message. Also converts values to other types if specified.
                 * @param message ListAppsForFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListAppsForFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListAppsForFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListAppsForFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an OpenWithAppRequest. */
            interface IOpenWithAppRequest {

                /** OpenWithAppRequest path */
                path?: (string|null);

                /** OpenWithAppRequest appId */
                appId?: (string|null);
            }

            /** Represents an OpenWithAppRequest. */
            class OpenWithAppRequest implements IOpenWithAppRequest {

                /**
                 * Constructs a new OpenWithAppRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IOpenWithAppRequest);

                /** OpenWithAppRequest path. */
                public path: string;

                /** OpenWithAppRequest appId. */
                public appId: string;

                /**
                 * Creates a new OpenWithAppRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns OpenWithAppRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IOpenWithAppRequest): tilbo.ipc.v1.OpenWithAppRequest;

                /**
                 * Encodes the specified OpenWithAppRequest message. Does not implicitly {@link tilbo.ipc.v1.OpenWithAppRequest.verify|verify} messages.
                 * @param message OpenWithAppRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IOpenWithAppRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified OpenWithAppRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.OpenWithAppRequest.verify|verify} messages.
                 * @param message OpenWithAppRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IOpenWithAppRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an OpenWithAppRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns OpenWithAppRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.OpenWithAppRequest;

                /**
                 * Decodes an OpenWithAppRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns OpenWithAppRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.OpenWithAppRequest;

                /**
                 * Verifies an OpenWithAppRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an OpenWithAppRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns OpenWithAppRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.OpenWithAppRequest;

                /**
                 * Creates a plain object from an OpenWithAppRequest message. Also converts values to other types if specified.
                 * @param message OpenWithAppRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.OpenWithAppRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this OpenWithAppRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for OpenWithAppRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an OpenWithAppResponse. */
            interface IOpenWithAppResponse {
            }

            /** Represents an OpenWithAppResponse. */
            class OpenWithAppResponse implements IOpenWithAppResponse {

                /**
                 * Constructs a new OpenWithAppResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IOpenWithAppResponse);

                /**
                 * Creates a new OpenWithAppResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns OpenWithAppResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IOpenWithAppResponse): tilbo.ipc.v1.OpenWithAppResponse;

                /**
                 * Encodes the specified OpenWithAppResponse message. Does not implicitly {@link tilbo.ipc.v1.OpenWithAppResponse.verify|verify} messages.
                 * @param message OpenWithAppResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IOpenWithAppResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified OpenWithAppResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.OpenWithAppResponse.verify|verify} messages.
                 * @param message OpenWithAppResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IOpenWithAppResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an OpenWithAppResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns OpenWithAppResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.OpenWithAppResponse;

                /**
                 * Decodes an OpenWithAppResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns OpenWithAppResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.OpenWithAppResponse;

                /**
                 * Verifies an OpenWithAppResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an OpenWithAppResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns OpenWithAppResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.OpenWithAppResponse;

                /**
                 * Creates a plain object from an OpenWithAppResponse message. Also converts values to other types if specified.
                 * @param message OpenWithAppResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.OpenWithAppResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this OpenWithAppResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for OpenWithAppResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetBrowserConfigRequest. */
            interface IGetBrowserConfigRequest {
            }

            /** Represents a GetBrowserConfigRequest. */
            class GetBrowserConfigRequest implements IGetBrowserConfigRequest {

                /**
                 * Constructs a new GetBrowserConfigRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetBrowserConfigRequest);

                /**
                 * Creates a new GetBrowserConfigRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetBrowserConfigRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetBrowserConfigRequest): tilbo.ipc.v1.GetBrowserConfigRequest;

                /**
                 * Encodes the specified GetBrowserConfigRequest message. Does not implicitly {@link tilbo.ipc.v1.GetBrowserConfigRequest.verify|verify} messages.
                 * @param message GetBrowserConfigRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetBrowserConfigRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetBrowserConfigRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetBrowserConfigRequest.verify|verify} messages.
                 * @param message GetBrowserConfigRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetBrowserConfigRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetBrowserConfigRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetBrowserConfigRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetBrowserConfigRequest;

                /**
                 * Decodes a GetBrowserConfigRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetBrowserConfigRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetBrowserConfigRequest;

                /**
                 * Verifies a GetBrowserConfigRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetBrowserConfigRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetBrowserConfigRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetBrowserConfigRequest;

                /**
                 * Creates a plain object from a GetBrowserConfigRequest message. Also converts values to other types if specified.
                 * @param message GetBrowserConfigRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetBrowserConfigRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetBrowserConfigRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetBrowserConfigRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetBrowserConfigResponse. */
            interface IGetBrowserConfigResponse {

                /** GetBrowserConfigResponse keybindings */
                keybindings?: ({ [k: string]: string }|null);

                /** GetBrowserConfigResponse useTrash */
                useTrash?: (boolean|null);

                /** GetBrowserConfigResponse inlineThumbnails */
                inlineThumbnails?: (boolean|null);

                /** GetBrowserConfigResponse autoPropertiesSlideout */
                autoPropertiesSlideout?: (boolean|null);

                /** GetBrowserConfigResponse theme */
                theme?: (string|null);
            }

            /** Represents a GetBrowserConfigResponse. */
            class GetBrowserConfigResponse implements IGetBrowserConfigResponse {

                /**
                 * Constructs a new GetBrowserConfigResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetBrowserConfigResponse);

                /** GetBrowserConfigResponse keybindings. */
                public keybindings: { [k: string]: string };

                /** GetBrowserConfigResponse useTrash. */
                public useTrash: boolean;

                /** GetBrowserConfigResponse inlineThumbnails. */
                public inlineThumbnails: boolean;

                /** GetBrowserConfigResponse autoPropertiesSlideout. */
                public autoPropertiesSlideout: boolean;

                /** GetBrowserConfigResponse theme. */
                public theme: string;

                /**
                 * Creates a new GetBrowserConfigResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetBrowserConfigResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetBrowserConfigResponse): tilbo.ipc.v1.GetBrowserConfigResponse;

                /**
                 * Encodes the specified GetBrowserConfigResponse message. Does not implicitly {@link tilbo.ipc.v1.GetBrowserConfigResponse.verify|verify} messages.
                 * @param message GetBrowserConfigResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetBrowserConfigResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetBrowserConfigResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetBrowserConfigResponse.verify|verify} messages.
                 * @param message GetBrowserConfigResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetBrowserConfigResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetBrowserConfigResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetBrowserConfigResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetBrowserConfigResponse;

                /**
                 * Decodes a GetBrowserConfigResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetBrowserConfigResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetBrowserConfigResponse;

                /**
                 * Verifies a GetBrowserConfigResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetBrowserConfigResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetBrowserConfigResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetBrowserConfigResponse;

                /**
                 * Creates a plain object from a GetBrowserConfigResponse message. Also converts values to other types if specified.
                 * @param message GetBrowserConfigResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetBrowserConfigResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetBrowserConfigResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetBrowserConfigResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetFileBadgesRequest. */
            interface IGetFileBadgesRequest {

                /** GetFileBadgesRequest path */
                path?: (string|null);
            }

            /** Represents a GetFileBadgesRequest. */
            class GetFileBadgesRequest implements IGetFileBadgesRequest {

                /**
                 * Constructs a new GetFileBadgesRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetFileBadgesRequest);

                /** GetFileBadgesRequest path. */
                public path: string;

                /**
                 * Creates a new GetFileBadgesRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetFileBadgesRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetFileBadgesRequest): tilbo.ipc.v1.GetFileBadgesRequest;

                /**
                 * Encodes the specified GetFileBadgesRequest message. Does not implicitly {@link tilbo.ipc.v1.GetFileBadgesRequest.verify|verify} messages.
                 * @param message GetFileBadgesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetFileBadgesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetFileBadgesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetFileBadgesRequest.verify|verify} messages.
                 * @param message GetFileBadgesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetFileBadgesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetFileBadgesRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetFileBadgesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetFileBadgesRequest;

                /**
                 * Decodes a GetFileBadgesRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetFileBadgesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetFileBadgesRequest;

                /**
                 * Verifies a GetFileBadgesRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetFileBadgesRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetFileBadgesRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetFileBadgesRequest;

                /**
                 * Creates a plain object from a GetFileBadgesRequest message. Also converts values to other types if specified.
                 * @param message GetFileBadgesRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetFileBadgesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetFileBadgesRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetFileBadgesRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetFileBadgesResponse. */
            interface IGetFileBadgesResponse {

                /** GetFileBadgesResponse badges */
                badges?: (string[]|null);
            }

            /** Represents a GetFileBadgesResponse. */
            class GetFileBadgesResponse implements IGetFileBadgesResponse {

                /**
                 * Constructs a new GetFileBadgesResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetFileBadgesResponse);

                /** GetFileBadgesResponse badges. */
                public badges: string[];

                /**
                 * Creates a new GetFileBadgesResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetFileBadgesResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetFileBadgesResponse): tilbo.ipc.v1.GetFileBadgesResponse;

                /**
                 * Encodes the specified GetFileBadgesResponse message. Does not implicitly {@link tilbo.ipc.v1.GetFileBadgesResponse.verify|verify} messages.
                 * @param message GetFileBadgesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetFileBadgesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetFileBadgesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetFileBadgesResponse.verify|verify} messages.
                 * @param message GetFileBadgesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetFileBadgesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetFileBadgesResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetFileBadgesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetFileBadgesResponse;

                /**
                 * Decodes a GetFileBadgesResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetFileBadgesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetFileBadgesResponse;

                /**
                 * Verifies a GetFileBadgesResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetFileBadgesResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetFileBadgesResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetFileBadgesResponse;

                /**
                 * Creates a plain object from a GetFileBadgesResponse message. Also converts values to other types if specified.
                 * @param message GetFileBadgesResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetFileBadgesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetFileBadgesResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetFileBadgesResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a FileAction. */
            interface IFileAction {

                /** FileAction id */
                id?: (string|null);

                /** FileAction label */
                label?: (string|null);
            }

            /** Represents a FileAction. */
            class FileAction implements IFileAction {

                /**
                 * Constructs a new FileAction.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IFileAction);

                /** FileAction id. */
                public id: string;

                /** FileAction label. */
                public label: string;

                /**
                 * Creates a new FileAction instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns FileAction instance
                 */
                public static create(properties?: tilbo.ipc.v1.IFileAction): tilbo.ipc.v1.FileAction;

                /**
                 * Encodes the specified FileAction message. Does not implicitly {@link tilbo.ipc.v1.FileAction.verify|verify} messages.
                 * @param message FileAction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IFileAction, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified FileAction message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileAction.verify|verify} messages.
                 * @param message FileAction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IFileAction, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a FileAction message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns FileAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.FileAction;

                /**
                 * Decodes a FileAction message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns FileAction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.FileAction;

                /**
                 * Verifies a FileAction message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a FileAction message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns FileAction
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.FileAction;

                /**
                 * Creates a plain object from a FileAction message. Also converts values to other types if specified.
                 * @param message FileAction
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.FileAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this FileAction to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for FileAction
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetFileActionsRequest. */
            interface IGetFileActionsRequest {

                /** GetFileActionsRequest path */
                path?: (string|null);
            }

            /** Represents a GetFileActionsRequest. */
            class GetFileActionsRequest implements IGetFileActionsRequest {

                /**
                 * Constructs a new GetFileActionsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetFileActionsRequest);

                /** GetFileActionsRequest path. */
                public path: string;

                /**
                 * Creates a new GetFileActionsRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetFileActionsRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetFileActionsRequest): tilbo.ipc.v1.GetFileActionsRequest;

                /**
                 * Encodes the specified GetFileActionsRequest message. Does not implicitly {@link tilbo.ipc.v1.GetFileActionsRequest.verify|verify} messages.
                 * @param message GetFileActionsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetFileActionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetFileActionsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetFileActionsRequest.verify|verify} messages.
                 * @param message GetFileActionsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetFileActionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetFileActionsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetFileActionsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetFileActionsRequest;

                /**
                 * Decodes a GetFileActionsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetFileActionsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetFileActionsRequest;

                /**
                 * Verifies a GetFileActionsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetFileActionsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetFileActionsRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetFileActionsRequest;

                /**
                 * Creates a plain object from a GetFileActionsRequest message. Also converts values to other types if specified.
                 * @param message GetFileActionsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetFileActionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetFileActionsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetFileActionsRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetFileActionsResponse. */
            interface IGetFileActionsResponse {

                /** GetFileActionsResponse actions */
                actions?: (tilbo.ipc.v1.IFileAction[]|null);
            }

            /** Represents a GetFileActionsResponse. */
            class GetFileActionsResponse implements IGetFileActionsResponse {

                /**
                 * Constructs a new GetFileActionsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetFileActionsResponse);

                /** GetFileActionsResponse actions. */
                public actions: tilbo.ipc.v1.IFileAction[];

                /**
                 * Creates a new GetFileActionsResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetFileActionsResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetFileActionsResponse): tilbo.ipc.v1.GetFileActionsResponse;

                /**
                 * Encodes the specified GetFileActionsResponse message. Does not implicitly {@link tilbo.ipc.v1.GetFileActionsResponse.verify|verify} messages.
                 * @param message GetFileActionsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetFileActionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetFileActionsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetFileActionsResponse.verify|verify} messages.
                 * @param message GetFileActionsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetFileActionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetFileActionsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetFileActionsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetFileActionsResponse;

                /**
                 * Decodes a GetFileActionsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetFileActionsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetFileActionsResponse;

                /**
                 * Verifies a GetFileActionsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetFileActionsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetFileActionsResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetFileActionsResponse;

                /**
                 * Creates a plain object from a GetFileActionsResponse message. Also converts values to other types if specified.
                 * @param message GetFileActionsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetFileActionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetFileActionsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetFileActionsResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RunFileActionRequest. */
            interface IRunFileActionRequest {

                /** RunFileActionRequest path */
                path?: (string|null);

                /** RunFileActionRequest actionId */
                actionId?: (string|null);
            }

            /** Represents a RunFileActionRequest. */
            class RunFileActionRequest implements IRunFileActionRequest {

                /**
                 * Constructs a new RunFileActionRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRunFileActionRequest);

                /** RunFileActionRequest path. */
                public path: string;

                /** RunFileActionRequest actionId. */
                public actionId: string;

                /**
                 * Creates a new RunFileActionRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RunFileActionRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRunFileActionRequest): tilbo.ipc.v1.RunFileActionRequest;

                /**
                 * Encodes the specified RunFileActionRequest message. Does not implicitly {@link tilbo.ipc.v1.RunFileActionRequest.verify|verify} messages.
                 * @param message RunFileActionRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRunFileActionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RunFileActionRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RunFileActionRequest.verify|verify} messages.
                 * @param message RunFileActionRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRunFileActionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RunFileActionRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RunFileActionRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RunFileActionRequest;

                /**
                 * Decodes a RunFileActionRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RunFileActionRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RunFileActionRequest;

                /**
                 * Verifies a RunFileActionRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RunFileActionRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RunFileActionRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RunFileActionRequest;

                /**
                 * Creates a plain object from a RunFileActionRequest message. Also converts values to other types if specified.
                 * @param message RunFileActionRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RunFileActionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RunFileActionRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RunFileActionRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a RunFileActionResponse. */
            interface IRunFileActionResponse {
            }

            /** Represents a RunFileActionResponse. */
            class RunFileActionResponse implements IRunFileActionResponse {

                /**
                 * Constructs a new RunFileActionResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IRunFileActionResponse);

                /**
                 * Creates a new RunFileActionResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns RunFileActionResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IRunFileActionResponse): tilbo.ipc.v1.RunFileActionResponse;

                /**
                 * Encodes the specified RunFileActionResponse message. Does not implicitly {@link tilbo.ipc.v1.RunFileActionResponse.verify|verify} messages.
                 * @param message RunFileActionResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IRunFileActionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified RunFileActionResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RunFileActionResponse.verify|verify} messages.
                 * @param message RunFileActionResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IRunFileActionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a RunFileActionResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns RunFileActionResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.RunFileActionResponse;

                /**
                 * Decodes a RunFileActionResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns RunFileActionResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.RunFileActionResponse;

                /**
                 * Verifies a RunFileActionResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a RunFileActionResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns RunFileActionResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.RunFileActionResponse;

                /**
                 * Creates a plain object from a RunFileActionResponse message. Also converts values to other types if specified.
                 * @param message RunFileActionResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.RunFileActionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this RunFileActionResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for RunFileActionResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a LaunchGUIRequest. */
            interface ILaunchGUIRequest {

                /** LaunchGUIRequest path */
                path?: (string|null);
            }

            /** Represents a LaunchGUIRequest. */
            class LaunchGUIRequest implements ILaunchGUIRequest {

                /**
                 * Constructs a new LaunchGUIRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ILaunchGUIRequest);

                /** LaunchGUIRequest path. */
                public path: string;

                /**
                 * Creates a new LaunchGUIRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns LaunchGUIRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ILaunchGUIRequest): tilbo.ipc.v1.LaunchGUIRequest;

                /**
                 * Encodes the specified LaunchGUIRequest message. Does not implicitly {@link tilbo.ipc.v1.LaunchGUIRequest.verify|verify} messages.
                 * @param message LaunchGUIRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ILaunchGUIRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LaunchGUIRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.LaunchGUIRequest.verify|verify} messages.
                 * @param message LaunchGUIRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ILaunchGUIRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LaunchGUIRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns LaunchGUIRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.LaunchGUIRequest;

                /**
                 * Decodes a LaunchGUIRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns LaunchGUIRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.LaunchGUIRequest;

                /**
                 * Verifies a LaunchGUIRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a LaunchGUIRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LaunchGUIRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.LaunchGUIRequest;

                /**
                 * Creates a plain object from a LaunchGUIRequest message. Also converts values to other types if specified.
                 * @param message LaunchGUIRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.LaunchGUIRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LaunchGUIRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for LaunchGUIRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a LaunchGUIResponse. */
            interface ILaunchGUIResponse {

                /** LaunchGUIResponse alreadyRunning */
                alreadyRunning?: (boolean|null);
            }

            /** Represents a LaunchGUIResponse. */
            class LaunchGUIResponse implements ILaunchGUIResponse {

                /**
                 * Constructs a new LaunchGUIResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ILaunchGUIResponse);

                /** LaunchGUIResponse alreadyRunning. */
                public alreadyRunning: boolean;

                /**
                 * Creates a new LaunchGUIResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns LaunchGUIResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ILaunchGUIResponse): tilbo.ipc.v1.LaunchGUIResponse;

                /**
                 * Encodes the specified LaunchGUIResponse message. Does not implicitly {@link tilbo.ipc.v1.LaunchGUIResponse.verify|verify} messages.
                 * @param message LaunchGUIResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ILaunchGUIResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LaunchGUIResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.LaunchGUIResponse.verify|verify} messages.
                 * @param message LaunchGUIResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ILaunchGUIResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LaunchGUIResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns LaunchGUIResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.LaunchGUIResponse;

                /**
                 * Decodes a LaunchGUIResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns LaunchGUIResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.LaunchGUIResponse;

                /**
                 * Verifies a LaunchGUIResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a LaunchGUIResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LaunchGUIResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.LaunchGUIResponse;

                /**
                 * Creates a plain object from a LaunchGUIResponse message. Also converts values to other types if specified.
                 * @param message LaunchGUIResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.LaunchGUIResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LaunchGUIResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for LaunchGUIResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ShowWindowEvent. */
            interface IShowWindowEvent {

                /** ShowWindowEvent path */
                path?: (string|null);
            }

            /** Represents a ShowWindowEvent. */
            class ShowWindowEvent implements IShowWindowEvent {

                /**
                 * Constructs a new ShowWindowEvent.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IShowWindowEvent);

                /** ShowWindowEvent path. */
                public path: string;

                /**
                 * Creates a new ShowWindowEvent instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ShowWindowEvent instance
                 */
                public static create(properties?: tilbo.ipc.v1.IShowWindowEvent): tilbo.ipc.v1.ShowWindowEvent;

                /**
                 * Encodes the specified ShowWindowEvent message. Does not implicitly {@link tilbo.ipc.v1.ShowWindowEvent.verify|verify} messages.
                 * @param message ShowWindowEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IShowWindowEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ShowWindowEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ShowWindowEvent.verify|verify} messages.
                 * @param message ShowWindowEvent message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IShowWindowEvent, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ShowWindowEvent message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ShowWindowEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ShowWindowEvent;

                /**
                 * Decodes a ShowWindowEvent message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ShowWindowEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ShowWindowEvent;

                /**
                 * Verifies a ShowWindowEvent message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ShowWindowEvent message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ShowWindowEvent
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ShowWindowEvent;

                /**
                 * Creates a plain object from a ShowWindowEvent message. Also converts values to other types if specified.
                 * @param message ShowWindowEvent
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ShowWindowEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ShowWindowEvent to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ShowWindowEvent
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** ThumbnailSize enum. */
            enum ThumbnailSize {
                THUMBNAIL_SIZE_UNSPECIFIED = 0,
                THUMBNAIL_SIZE_NORMAL = 1,
                THUMBNAIL_SIZE_LARGE = 2
            }

            /** Properties of a GetThumbnailRequest. */
            interface IGetThumbnailRequest {

                /** GetThumbnailRequest path */
                path?: (string|null);

                /** GetThumbnailRequest size */
                size?: (tilbo.ipc.v1.ThumbnailSize|null);
            }

            /** Represents a GetThumbnailRequest. */
            class GetThumbnailRequest implements IGetThumbnailRequest {

                /**
                 * Constructs a new GetThumbnailRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetThumbnailRequest);

                /** GetThumbnailRequest path. */
                public path: string;

                /** GetThumbnailRequest size. */
                public size: tilbo.ipc.v1.ThumbnailSize;

                /**
                 * Creates a new GetThumbnailRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetThumbnailRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetThumbnailRequest): tilbo.ipc.v1.GetThumbnailRequest;

                /**
                 * Encodes the specified GetThumbnailRequest message. Does not implicitly {@link tilbo.ipc.v1.GetThumbnailRequest.verify|verify} messages.
                 * @param message GetThumbnailRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetThumbnailRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetThumbnailRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetThumbnailRequest.verify|verify} messages.
                 * @param message GetThumbnailRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetThumbnailRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetThumbnailRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetThumbnailRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetThumbnailRequest;

                /**
                 * Decodes a GetThumbnailRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetThumbnailRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetThumbnailRequest;

                /**
                 * Verifies a GetThumbnailRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetThumbnailRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetThumbnailRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetThumbnailRequest;

                /**
                 * Creates a plain object from a GetThumbnailRequest message. Also converts values to other types if specified.
                 * @param message GetThumbnailRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetThumbnailRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetThumbnailRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetThumbnailRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a GetThumbnailResponse. */
            interface IGetThumbnailResponse {

                /** GetThumbnailResponse thumbnailPath */
                thumbnailPath?: (string|null);

                /** GetThumbnailResponse width */
                width?: (number|null);

                /** GetThumbnailResponse height */
                height?: (number|null);
            }

            /** Represents a GetThumbnailResponse. */
            class GetThumbnailResponse implements IGetThumbnailResponse {

                /**
                 * Constructs a new GetThumbnailResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IGetThumbnailResponse);

                /** GetThumbnailResponse thumbnailPath. */
                public thumbnailPath: string;

                /** GetThumbnailResponse width. */
                public width: number;

                /** GetThumbnailResponse height. */
                public height: number;

                /**
                 * Creates a new GetThumbnailResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GetThumbnailResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IGetThumbnailResponse): tilbo.ipc.v1.GetThumbnailResponse;

                /**
                 * Encodes the specified GetThumbnailResponse message. Does not implicitly {@link tilbo.ipc.v1.GetThumbnailResponse.verify|verify} messages.
                 * @param message GetThumbnailResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IGetThumbnailResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GetThumbnailResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GetThumbnailResponse.verify|verify} messages.
                 * @param message GetThumbnailResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IGetThumbnailResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GetThumbnailResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GetThumbnailResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.GetThumbnailResponse;

                /**
                 * Decodes a GetThumbnailResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GetThumbnailResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.GetThumbnailResponse;

                /**
                 * Verifies a GetThumbnailResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GetThumbnailResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GetThumbnailResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.GetThumbnailResponse;

                /**
                 * Creates a plain object from a GetThumbnailResponse message. Also converts values to other types if specified.
                 * @param message GetThumbnailResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.GetThumbnailResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GetThumbnailResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for GetThumbnailResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CopyRequest. */
            interface ICopyRequest {

                /** CopyRequest paths */
                paths?: (string[]|null);

                /** CopyRequest isMove */
                isMove?: (boolean|null);
            }

            /** Represents a CopyRequest. */
            class CopyRequest implements ICopyRequest {

                /**
                 * Constructs a new CopyRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICopyRequest);

                /** CopyRequest paths. */
                public paths: string[];

                /** CopyRequest isMove. */
                public isMove: boolean;

                /**
                 * Creates a new CopyRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CopyRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICopyRequest): tilbo.ipc.v1.CopyRequest;

                /**
                 * Encodes the specified CopyRequest message. Does not implicitly {@link tilbo.ipc.v1.CopyRequest.verify|verify} messages.
                 * @param message CopyRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICopyRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CopyRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CopyRequest.verify|verify} messages.
                 * @param message CopyRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICopyRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CopyRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CopyRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CopyRequest;

                /**
                 * Decodes a CopyRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CopyRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CopyRequest;

                /**
                 * Verifies a CopyRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CopyRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CopyRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CopyRequest;

                /**
                 * Creates a plain object from a CopyRequest message. Also converts values to other types if specified.
                 * @param message CopyRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CopyRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CopyRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CopyRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CopyResponse. */
            interface ICopyResponse {
            }

            /** Represents a CopyResponse. */
            class CopyResponse implements ICopyResponse {

                /**
                 * Constructs a new CopyResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICopyResponse);

                /**
                 * Creates a new CopyResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CopyResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICopyResponse): tilbo.ipc.v1.CopyResponse;

                /**
                 * Encodes the specified CopyResponse message. Does not implicitly {@link tilbo.ipc.v1.CopyResponse.verify|verify} messages.
                 * @param message CopyResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICopyResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CopyResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CopyResponse.verify|verify} messages.
                 * @param message CopyResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICopyResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CopyResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CopyResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CopyResponse;

                /**
                 * Decodes a CopyResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CopyResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CopyResponse;

                /**
                 * Verifies a CopyResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CopyResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CopyResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CopyResponse;

                /**
                 * Creates a plain object from a CopyResponse message. Also converts values to other types if specified.
                 * @param message CopyResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CopyResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CopyResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CopyResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PasteRequest. */
            interface IPasteRequest {

                /** PasteRequest destinationDir */
                destinationDir?: (string|null);
            }

            /** Represents a PasteRequest. */
            class PasteRequest implements IPasteRequest {

                /**
                 * Constructs a new PasteRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPasteRequest);

                /** PasteRequest destinationDir. */
                public destinationDir: string;

                /**
                 * Creates a new PasteRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PasteRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPasteRequest): tilbo.ipc.v1.PasteRequest;

                /**
                 * Encodes the specified PasteRequest message. Does not implicitly {@link tilbo.ipc.v1.PasteRequest.verify|verify} messages.
                 * @param message PasteRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPasteRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PasteRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PasteRequest.verify|verify} messages.
                 * @param message PasteRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPasteRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PasteRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PasteRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PasteRequest;

                /**
                 * Decodes a PasteRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PasteRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PasteRequest;

                /**
                 * Verifies a PasteRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PasteRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PasteRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PasteRequest;

                /**
                 * Creates a plain object from a PasteRequest message. Also converts values to other types if specified.
                 * @param message PasteRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PasteRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PasteRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PasteRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PasteResponse. */
            interface IPasteResponse {

                /** PasteResponse newPaths */
                newPaths?: (string[]|null);
            }

            /** Represents a PasteResponse. */
            class PasteResponse implements IPasteResponse {

                /**
                 * Constructs a new PasteResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPasteResponse);

                /** PasteResponse newPaths. */
                public newPaths: string[];

                /**
                 * Creates a new PasteResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PasteResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPasteResponse): tilbo.ipc.v1.PasteResponse;

                /**
                 * Encodes the specified PasteResponse message. Does not implicitly {@link tilbo.ipc.v1.PasteResponse.verify|verify} messages.
                 * @param message PasteResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPasteResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PasteResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PasteResponse.verify|verify} messages.
                 * @param message PasteResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPasteResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PasteResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PasteResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PasteResponse;

                /**
                 * Decodes a PasteResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PasteResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PasteResponse;

                /**
                 * Verifies a PasteResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PasteResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PasteResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PasteResponse;

                /**
                 * Creates a plain object from a PasteResponse message. Also converts values to other types if specified.
                 * @param message PasteResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PasteResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PasteResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PasteResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CreateFileRequest. */
            interface ICreateFileRequest {

                /** CreateFileRequest destinationDir */
                destinationDir?: (string|null);

                /** CreateFileRequest name */
                name?: (string|null);
            }

            /** Represents a CreateFileRequest. */
            class CreateFileRequest implements ICreateFileRequest {

                /**
                 * Constructs a new CreateFileRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICreateFileRequest);

                /** CreateFileRequest destinationDir. */
                public destinationDir: string;

                /** CreateFileRequest name. */
                public name: string;

                /**
                 * Creates a new CreateFileRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CreateFileRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICreateFileRequest): tilbo.ipc.v1.CreateFileRequest;

                /**
                 * Encodes the specified CreateFileRequest message. Does not implicitly {@link tilbo.ipc.v1.CreateFileRequest.verify|verify} messages.
                 * @param message CreateFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICreateFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CreateFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CreateFileRequest.verify|verify} messages.
                 * @param message CreateFileRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICreateFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CreateFileRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CreateFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CreateFileRequest;

                /**
                 * Decodes a CreateFileRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CreateFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CreateFileRequest;

                /**
                 * Verifies a CreateFileRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CreateFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CreateFileRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CreateFileRequest;

                /**
                 * Creates a plain object from a CreateFileRequest message. Also converts values to other types if specified.
                 * @param message CreateFileRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CreateFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CreateFileRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CreateFileRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CreateFileResponse. */
            interface ICreateFileResponse {

                /** CreateFileResponse path */
                path?: (string|null);
            }

            /** Represents a CreateFileResponse. */
            class CreateFileResponse implements ICreateFileResponse {

                /**
                 * Constructs a new CreateFileResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICreateFileResponse);

                /** CreateFileResponse path. */
                public path: string;

                /**
                 * Creates a new CreateFileResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CreateFileResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICreateFileResponse): tilbo.ipc.v1.CreateFileResponse;

                /**
                 * Encodes the specified CreateFileResponse message. Does not implicitly {@link tilbo.ipc.v1.CreateFileResponse.verify|verify} messages.
                 * @param message CreateFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICreateFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CreateFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CreateFileResponse.verify|verify} messages.
                 * @param message CreateFileResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICreateFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CreateFileResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CreateFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CreateFileResponse;

                /**
                 * Decodes a CreateFileResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CreateFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CreateFileResponse;

                /**
                 * Verifies a CreateFileResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CreateFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CreateFileResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CreateFileResponse;

                /**
                 * Creates a plain object from a CreateFileResponse message. Also converts values to other types if specified.
                 * @param message CreateFileResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CreateFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CreateFileResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CreateFileResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CreateDirectoryRequest. */
            interface ICreateDirectoryRequest {

                /** CreateDirectoryRequest destinationDir */
                destinationDir?: (string|null);

                /** CreateDirectoryRequest name */
                name?: (string|null);
            }

            /** Represents a CreateDirectoryRequest. */
            class CreateDirectoryRequest implements ICreateDirectoryRequest {

                /**
                 * Constructs a new CreateDirectoryRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICreateDirectoryRequest);

                /** CreateDirectoryRequest destinationDir. */
                public destinationDir: string;

                /** CreateDirectoryRequest name. */
                public name: string;

                /**
                 * Creates a new CreateDirectoryRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CreateDirectoryRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICreateDirectoryRequest): tilbo.ipc.v1.CreateDirectoryRequest;

                /**
                 * Encodes the specified CreateDirectoryRequest message. Does not implicitly {@link tilbo.ipc.v1.CreateDirectoryRequest.verify|verify} messages.
                 * @param message CreateDirectoryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICreateDirectoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CreateDirectoryRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CreateDirectoryRequest.verify|verify} messages.
                 * @param message CreateDirectoryRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICreateDirectoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CreateDirectoryRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CreateDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CreateDirectoryRequest;

                /**
                 * Decodes a CreateDirectoryRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CreateDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CreateDirectoryRequest;

                /**
                 * Verifies a CreateDirectoryRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CreateDirectoryRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CreateDirectoryRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CreateDirectoryRequest;

                /**
                 * Creates a plain object from a CreateDirectoryRequest message. Also converts values to other types if specified.
                 * @param message CreateDirectoryRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CreateDirectoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CreateDirectoryRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CreateDirectoryRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a CreateDirectoryResponse. */
            interface ICreateDirectoryResponse {

                /** CreateDirectoryResponse path */
                path?: (string|null);
            }

            /** Represents a CreateDirectoryResponse. */
            class CreateDirectoryResponse implements ICreateDirectoryResponse {

                /**
                 * Constructs a new CreateDirectoryResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ICreateDirectoryResponse);

                /** CreateDirectoryResponse path. */
                public path: string;

                /**
                 * Creates a new CreateDirectoryResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns CreateDirectoryResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.ICreateDirectoryResponse): tilbo.ipc.v1.CreateDirectoryResponse;

                /**
                 * Encodes the specified CreateDirectoryResponse message. Does not implicitly {@link tilbo.ipc.v1.CreateDirectoryResponse.verify|verify} messages.
                 * @param message CreateDirectoryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ICreateDirectoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified CreateDirectoryResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.CreateDirectoryResponse.verify|verify} messages.
                 * @param message CreateDirectoryResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ICreateDirectoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a CreateDirectoryResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns CreateDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.CreateDirectoryResponse;

                /**
                 * Decodes a CreateDirectoryResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns CreateDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.CreateDirectoryResponse;

                /**
                 * Verifies a CreateDirectoryResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a CreateDirectoryResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns CreateDirectoryResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.CreateDirectoryResponse;

                /**
                 * Creates a plain object from a CreateDirectoryResponse message. Also converts values to other types if specified.
                 * @param message CreateDirectoryResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.CreateDirectoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this CreateDirectoryResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for CreateDirectoryResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a MountEntry. */
            interface IMountEntry {

                /** MountEntry path */
                path?: (string|null);

                /** MountEntry label */
                label?: (string|null);

                /** MountEntry iconName */
                iconName?: (string|null);
            }

            /** Represents a MountEntry. */
            class MountEntry implements IMountEntry {

                /**
                 * Constructs a new MountEntry.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IMountEntry);

                /** MountEntry path. */
                public path: string;

                /** MountEntry label. */
                public label: string;

                /** MountEntry iconName. */
                public iconName: string;

                /**
                 * Creates a new MountEntry instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns MountEntry instance
                 */
                public static create(properties?: tilbo.ipc.v1.IMountEntry): tilbo.ipc.v1.MountEntry;

                /**
                 * Encodes the specified MountEntry message. Does not implicitly {@link tilbo.ipc.v1.MountEntry.verify|verify} messages.
                 * @param message MountEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IMountEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MountEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MountEntry.verify|verify} messages.
                 * @param message MountEntry message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IMountEntry, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MountEntry message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MountEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.MountEntry;

                /**
                 * Decodes a MountEntry message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MountEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.MountEntry;

                /**
                 * Verifies a MountEntry message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MountEntry message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MountEntry
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.MountEntry;

                /**
                 * Creates a plain object from a MountEntry message. Also converts values to other types if specified.
                 * @param message MountEntry
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.MountEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MountEntry to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for MountEntry
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListMountsRequest. */
            interface IListMountsRequest {
            }

            /** Represents a ListMountsRequest. */
            class ListMountsRequest implements IListMountsRequest {

                /**
                 * Constructs a new ListMountsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListMountsRequest);

                /**
                 * Creates a new ListMountsRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListMountsRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListMountsRequest): tilbo.ipc.v1.ListMountsRequest;

                /**
                 * Encodes the specified ListMountsRequest message. Does not implicitly {@link tilbo.ipc.v1.ListMountsRequest.verify|verify} messages.
                 * @param message ListMountsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListMountsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListMountsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListMountsRequest.verify|verify} messages.
                 * @param message ListMountsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListMountsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListMountsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListMountsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListMountsRequest;

                /**
                 * Decodes a ListMountsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListMountsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListMountsRequest;

                /**
                 * Verifies a ListMountsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListMountsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListMountsRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListMountsRequest;

                /**
                 * Creates a plain object from a ListMountsRequest message. Also converts values to other types if specified.
                 * @param message ListMountsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListMountsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListMountsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListMountsRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListMountsResponse. */
            interface IListMountsResponse {

                /** ListMountsResponse mounts */
                mounts?: (tilbo.ipc.v1.IMountEntry[]|null);
            }

            /** Represents a ListMountsResponse. */
            class ListMountsResponse implements IListMountsResponse {

                /**
                 * Constructs a new ListMountsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListMountsResponse);

                /** ListMountsResponse mounts. */
                public mounts: tilbo.ipc.v1.IMountEntry[];

                /**
                 * Creates a new ListMountsResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListMountsResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListMountsResponse): tilbo.ipc.v1.ListMountsResponse;

                /**
                 * Encodes the specified ListMountsResponse message. Does not implicitly {@link tilbo.ipc.v1.ListMountsResponse.verify|verify} messages.
                 * @param message ListMountsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListMountsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListMountsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListMountsResponse.verify|verify} messages.
                 * @param message ListMountsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListMountsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListMountsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListMountsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListMountsResponse;

                /**
                 * Decodes a ListMountsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListMountsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListMountsResponse;

                /**
                 * Verifies a ListMountsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListMountsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListMountsResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListMountsResponse;

                /**
                 * Creates a plain object from a ListMountsResponse message. Also converts values to other types if specified.
                 * @param message ListMountsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListMountsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListMountsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListMountsResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a SavedSearch. */
            interface ISavedSearch {

                /** SavedSearch name */
                name?: (string|null);

                /** SavedSearch chips */
                chips?: (string[]|null);

                /** SavedSearch iconName */
                iconName?: (string|null);

                /** SavedSearch id */
                id?: (string|null);
            }

            /** Represents a SavedSearch. */
            class SavedSearch implements ISavedSearch {

                /**
                 * Constructs a new SavedSearch.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.ISavedSearch);

                /** SavedSearch name. */
                public name: string;

                /** SavedSearch chips. */
                public chips: string[];

                /** SavedSearch iconName. */
                public iconName: string;

                /** SavedSearch id. */
                public id: string;

                /**
                 * Creates a new SavedSearch instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns SavedSearch instance
                 */
                public static create(properties?: tilbo.ipc.v1.ISavedSearch): tilbo.ipc.v1.SavedSearch;

                /**
                 * Encodes the specified SavedSearch message. Does not implicitly {@link tilbo.ipc.v1.SavedSearch.verify|verify} messages.
                 * @param message SavedSearch message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.ISavedSearch, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified SavedSearch message, length delimited. Does not implicitly {@link tilbo.ipc.v1.SavedSearch.verify|verify} messages.
                 * @param message SavedSearch message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.ISavedSearch, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a SavedSearch message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns SavedSearch
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.SavedSearch;

                /**
                 * Decodes a SavedSearch message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns SavedSearch
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.SavedSearch;

                /**
                 * Verifies a SavedSearch message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a SavedSearch message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns SavedSearch
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.SavedSearch;

                /**
                 * Creates a plain object from a SavedSearch message. Also converts values to other types if specified.
                 * @param message SavedSearch
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.SavedSearch, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this SavedSearch to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for SavedSearch
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PinSearchRequest. */
            interface IPinSearchRequest {

                /** PinSearchRequest name */
                name?: (string|null);

                /** PinSearchRequest chips */
                chips?: (string[]|null);

                /** PinSearchRequest iconName */
                iconName?: (string|null);
            }

            /** Represents a PinSearchRequest. */
            class PinSearchRequest implements IPinSearchRequest {

                /**
                 * Constructs a new PinSearchRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPinSearchRequest);

                /** PinSearchRequest name. */
                public name: string;

                /** PinSearchRequest chips. */
                public chips: string[];

                /** PinSearchRequest iconName. */
                public iconName: string;

                /**
                 * Creates a new PinSearchRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PinSearchRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPinSearchRequest): tilbo.ipc.v1.PinSearchRequest;

                /**
                 * Encodes the specified PinSearchRequest message. Does not implicitly {@link tilbo.ipc.v1.PinSearchRequest.verify|verify} messages.
                 * @param message PinSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPinSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PinSearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PinSearchRequest.verify|verify} messages.
                 * @param message PinSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPinSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PinSearchRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PinSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PinSearchRequest;

                /**
                 * Decodes a PinSearchRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PinSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PinSearchRequest;

                /**
                 * Verifies a PinSearchRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PinSearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PinSearchRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PinSearchRequest;

                /**
                 * Creates a plain object from a PinSearchRequest message. Also converts values to other types if specified.
                 * @param message PinSearchRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PinSearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PinSearchRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PinSearchRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a PinSearchResponse. */
            interface IPinSearchResponse {

                /** PinSearchResponse search */
                search?: (tilbo.ipc.v1.ISavedSearch|null);
            }

            /** Represents a PinSearchResponse. */
            class PinSearchResponse implements IPinSearchResponse {

                /**
                 * Constructs a new PinSearchResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IPinSearchResponse);

                /** PinSearchResponse search. */
                public search?: (tilbo.ipc.v1.ISavedSearch|null);

                /**
                 * Creates a new PinSearchResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns PinSearchResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IPinSearchResponse): tilbo.ipc.v1.PinSearchResponse;

                /**
                 * Encodes the specified PinSearchResponse message. Does not implicitly {@link tilbo.ipc.v1.PinSearchResponse.verify|verify} messages.
                 * @param message PinSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IPinSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified PinSearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PinSearchResponse.verify|verify} messages.
                 * @param message PinSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IPinSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a PinSearchResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns PinSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.PinSearchResponse;

                /**
                 * Decodes a PinSearchResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns PinSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.PinSearchResponse;

                /**
                 * Verifies a PinSearchResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a PinSearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns PinSearchResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.PinSearchResponse;

                /**
                 * Creates a plain object from a PinSearchResponse message. Also converts values to other types if specified.
                 * @param message PinSearchResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.PinSearchResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this PinSearchResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for PinSearchResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an UnpinSearchRequest. */
            interface IUnpinSearchRequest {

                /** UnpinSearchRequest id */
                id?: (string|null);
            }

            /** Represents an UnpinSearchRequest. */
            class UnpinSearchRequest implements IUnpinSearchRequest {

                /**
                 * Constructs a new UnpinSearchRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IUnpinSearchRequest);

                /** UnpinSearchRequest id. */
                public id: string;

                /**
                 * Creates a new UnpinSearchRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UnpinSearchRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IUnpinSearchRequest): tilbo.ipc.v1.UnpinSearchRequest;

                /**
                 * Encodes the specified UnpinSearchRequest message. Does not implicitly {@link tilbo.ipc.v1.UnpinSearchRequest.verify|verify} messages.
                 * @param message UnpinSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IUnpinSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnpinSearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.UnpinSearchRequest.verify|verify} messages.
                 * @param message UnpinSearchRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IUnpinSearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UnpinSearchRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UnpinSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.UnpinSearchRequest;

                /**
                 * Decodes an UnpinSearchRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UnpinSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.UnpinSearchRequest;

                /**
                 * Verifies an UnpinSearchRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UnpinSearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnpinSearchRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.UnpinSearchRequest;

                /**
                 * Creates a plain object from an UnpinSearchRequest message. Also converts values to other types if specified.
                 * @param message UnpinSearchRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.UnpinSearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnpinSearchRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UnpinSearchRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of an UnpinSearchResponse. */
            interface IUnpinSearchResponse {
            }

            /** Represents an UnpinSearchResponse. */
            class UnpinSearchResponse implements IUnpinSearchResponse {

                /**
                 * Constructs a new UnpinSearchResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IUnpinSearchResponse);

                /**
                 * Creates a new UnpinSearchResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns UnpinSearchResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IUnpinSearchResponse): tilbo.ipc.v1.UnpinSearchResponse;

                /**
                 * Encodes the specified UnpinSearchResponse message. Does not implicitly {@link tilbo.ipc.v1.UnpinSearchResponse.verify|verify} messages.
                 * @param message UnpinSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IUnpinSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified UnpinSearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.UnpinSearchResponse.verify|verify} messages.
                 * @param message UnpinSearchResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IUnpinSearchResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an UnpinSearchResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns UnpinSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.UnpinSearchResponse;

                /**
                 * Decodes an UnpinSearchResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns UnpinSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.UnpinSearchResponse;

                /**
                 * Verifies an UnpinSearchResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an UnpinSearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns UnpinSearchResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.UnpinSearchResponse;

                /**
                 * Creates a plain object from an UnpinSearchResponse message. Also converts values to other types if specified.
                 * @param message UnpinSearchResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.UnpinSearchResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this UnpinSearchResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for UnpinSearchResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListSavedSearchesRequest. */
            interface IListSavedSearchesRequest {
            }

            /** Represents a ListSavedSearchesRequest. */
            class ListSavedSearchesRequest implements IListSavedSearchesRequest {

                /**
                 * Constructs a new ListSavedSearchesRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListSavedSearchesRequest);

                /**
                 * Creates a new ListSavedSearchesRequest instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListSavedSearchesRequest instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListSavedSearchesRequest): tilbo.ipc.v1.ListSavedSearchesRequest;

                /**
                 * Encodes the specified ListSavedSearchesRequest message. Does not implicitly {@link tilbo.ipc.v1.ListSavedSearchesRequest.verify|verify} messages.
                 * @param message ListSavedSearchesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListSavedSearchesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListSavedSearchesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListSavedSearchesRequest.verify|verify} messages.
                 * @param message ListSavedSearchesRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListSavedSearchesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListSavedSearchesRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListSavedSearchesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListSavedSearchesRequest;

                /**
                 * Decodes a ListSavedSearchesRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListSavedSearchesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListSavedSearchesRequest;

                /**
                 * Verifies a ListSavedSearchesRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListSavedSearchesRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListSavedSearchesRequest
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListSavedSearchesRequest;

                /**
                 * Creates a plain object from a ListSavedSearchesRequest message. Also converts values to other types if specified.
                 * @param message ListSavedSearchesRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListSavedSearchesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListSavedSearchesRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListSavedSearchesRequest
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ListSavedSearchesResponse. */
            interface IListSavedSearchesResponse {

                /** ListSavedSearchesResponse searches */
                searches?: (tilbo.ipc.v1.ISavedSearch[]|null);
            }

            /** Represents a ListSavedSearchesResponse. */
            class ListSavedSearchesResponse implements IListSavedSearchesResponse {

                /**
                 * Constructs a new ListSavedSearchesResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: tilbo.ipc.v1.IListSavedSearchesResponse);

                /** ListSavedSearchesResponse searches. */
                public searches: tilbo.ipc.v1.ISavedSearch[];

                /**
                 * Creates a new ListSavedSearchesResponse instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ListSavedSearchesResponse instance
                 */
                public static create(properties?: tilbo.ipc.v1.IListSavedSearchesResponse): tilbo.ipc.v1.ListSavedSearchesResponse;

                /**
                 * Encodes the specified ListSavedSearchesResponse message. Does not implicitly {@link tilbo.ipc.v1.ListSavedSearchesResponse.verify|verify} messages.
                 * @param message ListSavedSearchesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: tilbo.ipc.v1.IListSavedSearchesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ListSavedSearchesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListSavedSearchesResponse.verify|verify} messages.
                 * @param message ListSavedSearchesResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: tilbo.ipc.v1.IListSavedSearchesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ListSavedSearchesResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ListSavedSearchesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): tilbo.ipc.v1.ListSavedSearchesResponse;

                /**
                 * Decodes a ListSavedSearchesResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ListSavedSearchesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): tilbo.ipc.v1.ListSavedSearchesResponse;

                /**
                 * Verifies a ListSavedSearchesResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ListSavedSearchesResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ListSavedSearchesResponse
                 */
                public static fromObject(object: { [k: string]: any }): tilbo.ipc.v1.ListSavedSearchesResponse;

                /**
                 * Creates a plain object from a ListSavedSearchesResponse message. Also converts values to other types if specified.
                 * @param message ListSavedSearchesResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: tilbo.ipc.v1.ListSavedSearchesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ListSavedSearchesResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ListSavedSearchesResponse
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}
