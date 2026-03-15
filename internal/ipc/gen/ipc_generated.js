/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const tilbo = $root.tilbo = (() => {

    /**
     * Namespace tilbo.
     * @exports tilbo
     * @namespace
     */
    const tilbo = {};

    tilbo.ipc = (function() {

        /**
         * Namespace ipc.
         * @memberof tilbo
         * @namespace
         */
        const ipc = {};

        ipc.v1 = (function() {

            /**
             * Namespace v1.
             * @memberof tilbo.ipc
             * @namespace
             */
            const v1 = {};

            v1.Envelope = (function() {

                /**
                 * Properties of an Envelope.
                 * @memberof tilbo.ipc.v1
                 * @interface IEnvelope
                 * @property {number|Long|null} [requestId] Envelope requestId
                 * @property {tilbo.ipc.v1.IRequest|null} [request] Envelope request
                 * @property {tilbo.ipc.v1.IResponse|null} [response] Envelope response
                 * @property {tilbo.ipc.v1.IEvent|null} [event] Envelope event
                 */

                /**
                 * Constructs a new Envelope.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents an Envelope.
                 * @implements IEnvelope
                 * @constructor
                 * @param {tilbo.ipc.v1.IEnvelope=} [properties] Properties to set
                 */
                function Envelope(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Envelope requestId.
                 * @member {number|Long} requestId
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.requestId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Envelope request.
                 * @member {tilbo.ipc.v1.IRequest|null|undefined} request
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.request = null;

                /**
                 * Envelope response.
                 * @member {tilbo.ipc.v1.IResponse|null|undefined} response
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.response = null;

                /**
                 * Envelope event.
                 * @member {tilbo.ipc.v1.IEvent|null|undefined} event
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.event = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * Envelope payload.
                 * @member {"request"|"response"|"event"|undefined} payload
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 */
                Object.defineProperty(Envelope.prototype, "payload", {
                    get: $util.oneOfGetter($oneOfFields = ["request", "response", "event"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {tilbo.ipc.v1.IEnvelope=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.Envelope} Envelope instance
                 */
                Envelope.create = function create(properties) {
                    return new Envelope(properties);
                };

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link tilbo.ipc.v1.Envelope.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {tilbo.ipc.v1.IEnvelope} message Envelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Envelope.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.requestId);
                    if (message.request != null && Object.hasOwnProperty.call(message, "request"))
                        $root.tilbo.ipc.v1.Request.encode(message.request, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.response != null && Object.hasOwnProperty.call(message, "response"))
                        $root.tilbo.ipc.v1.Response.encode(message.response, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.event != null && Object.hasOwnProperty.call(message, "event"))
                        $root.tilbo.ipc.v1.Event.encode(message.event, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Envelope message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Envelope.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {tilbo.ipc.v1.IEnvelope} message Envelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Envelope.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.Envelope} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Envelope.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Envelope();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.requestId = reader.uint64();
                                break;
                            }
                        case 2: {
                                message.request = $root.tilbo.ipc.v1.Request.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.response = $root.tilbo.ipc.v1.Response.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.event = $root.tilbo.ipc.v1.Event.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Envelope message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.Envelope} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Envelope.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Envelope message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Envelope.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.requestId != null && message.hasOwnProperty("requestId"))
                        if (!$util.isInteger(message.requestId) && !(message.requestId && $util.isInteger(message.requestId.low) && $util.isInteger(message.requestId.high)))
                            return "requestId: integer|Long expected";
                    if (message.request != null && message.hasOwnProperty("request")) {
                        properties.payload = 1;
                        {
                            let error = $root.tilbo.ipc.v1.Request.verify(message.request);
                            if (error)
                                return "request." + error;
                        }
                    }
                    if (message.response != null && message.hasOwnProperty("response")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        {
                            let error = $root.tilbo.ipc.v1.Response.verify(message.response);
                            if (error)
                                return "response." + error;
                        }
                    }
                    if (message.event != null && message.hasOwnProperty("event")) {
                        if (properties.payload === 1)
                            return "payload: multiple values";
                        properties.payload = 1;
                        {
                            let error = $root.tilbo.ipc.v1.Event.verify(message.event);
                            if (error)
                                return "event." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.Envelope} Envelope
                 */
                Envelope.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.Envelope)
                        return object;
                    let message = new $root.tilbo.ipc.v1.Envelope();
                    if (object.requestId != null)
                        if ($util.Long)
                            (message.requestId = $util.Long.fromValue(object.requestId)).unsigned = true;
                        else if (typeof object.requestId === "string")
                            message.requestId = parseInt(object.requestId, 10);
                        else if (typeof object.requestId === "number")
                            message.requestId = object.requestId;
                        else if (typeof object.requestId === "object")
                            message.requestId = new $util.LongBits(object.requestId.low >>> 0, object.requestId.high >>> 0).toNumber(true);
                    if (object.request != null) {
                        if (typeof object.request !== "object")
                            throw TypeError(".tilbo.ipc.v1.Envelope.request: object expected");
                        message.request = $root.tilbo.ipc.v1.Request.fromObject(object.request);
                    }
                    if (object.response != null) {
                        if (typeof object.response !== "object")
                            throw TypeError(".tilbo.ipc.v1.Envelope.response: object expected");
                        message.response = $root.tilbo.ipc.v1.Response.fromObject(object.response);
                    }
                    if (object.event != null) {
                        if (typeof object.event !== "object")
                            throw TypeError(".tilbo.ipc.v1.Envelope.event: object expected");
                        message.event = $root.tilbo.ipc.v1.Event.fromObject(object.event);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {tilbo.ipc.v1.Envelope} message Envelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Envelope.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.requestId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.requestId = options.longs === String ? "0" : 0;
                    if (message.requestId != null && message.hasOwnProperty("requestId"))
                        if (typeof message.requestId === "number")
                            object.requestId = options.longs === String ? String(message.requestId) : message.requestId;
                        else
                            object.requestId = options.longs === String ? $util.Long.prototype.toString.call(message.requestId) : options.longs === Number ? new $util.LongBits(message.requestId.low >>> 0, message.requestId.high >>> 0).toNumber(true) : message.requestId;
                    if (message.request != null && message.hasOwnProperty("request")) {
                        object.request = $root.tilbo.ipc.v1.Request.toObject(message.request, options);
                        if (options.oneofs)
                            object.payload = "request";
                    }
                    if (message.response != null && message.hasOwnProperty("response")) {
                        object.response = $root.tilbo.ipc.v1.Response.toObject(message.response, options);
                        if (options.oneofs)
                            object.payload = "response";
                    }
                    if (message.event != null && message.hasOwnProperty("event")) {
                        object.event = $root.tilbo.ipc.v1.Event.toObject(message.event, options);
                        if (options.oneofs)
                            object.payload = "event";
                    }
                    return object;
                };

                /**
                 * Converts this Envelope to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.Envelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Envelope.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Envelope
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.Envelope
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Envelope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.Envelope";
                };

                return Envelope;
            })();

            v1.Request = (function() {

                /**
                 * Properties of a Request.
                 * @memberof tilbo.ipc.v1
                 * @interface IRequest
                 * @property {tilbo.ipc.v1.ISearchRequest|null} [search] Request search
                 * @property {tilbo.ipc.v1.ITagRequest|null} [tag] Request tag
                 * @property {tilbo.ipc.v1.IMetadataRequest|null} [metadata] Request metadata
                 * @property {tilbo.ipc.v1.IMetadataSetRequest|null} [metadataSet] Request metadataSet
                 * @property {tilbo.ipc.v1.IRelatedRequest|null} [related] Request related
                 * @property {tilbo.ipc.v1.IStatusRequest|null} [status] Request status
                 * @property {tilbo.ipc.v1.IReloadRulesRequest|null} [reloadRules] Request reloadRules
                 * @property {tilbo.ipc.v1.IListTagsRequest|null} [listTags] Request listTags
                 * @property {tilbo.ipc.v1.IHydrateTagsRequest|null} [hydrateTags] Request hydrateTags
                 * @property {tilbo.ipc.v1.IListDirectoryRequest|null} [listDirectory] Request listDirectory
                 * @property {tilbo.ipc.v1.IStatFileRequest|null} [statFile] Request statFile
                 * @property {tilbo.ipc.v1.IGlobSearchRequest|null} [globSearch] Request globSearch
                 * @property {tilbo.ipc.v1.IRenameFileRequest|null} [renameFile] Request renameFile
                 * @property {tilbo.ipc.v1.IDeleteFileRequest|null} [deleteFile] Request deleteFile
                 * @property {tilbo.ipc.v1.IChmodFileRequest|null} [chmodFile] Request chmodFile
                 * @property {tilbo.ipc.v1.IListPlacesRequest|null} [listPlaces] Request listPlaces
                 */

                /**
                 * Constructs a new Request.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a Request.
                 * @implements IRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IRequest=} [properties] Properties to set
                 */
                function Request(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Request search.
                 * @member {tilbo.ipc.v1.ISearchRequest|null|undefined} search
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.search = null;

                /**
                 * Request tag.
                 * @member {tilbo.ipc.v1.ITagRequest|null|undefined} tag
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.tag = null;

                /**
                 * Request metadata.
                 * @member {tilbo.ipc.v1.IMetadataRequest|null|undefined} metadata
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.metadata = null;

                /**
                 * Request metadataSet.
                 * @member {tilbo.ipc.v1.IMetadataSetRequest|null|undefined} metadataSet
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.metadataSet = null;

                /**
                 * Request related.
                 * @member {tilbo.ipc.v1.IRelatedRequest|null|undefined} related
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.related = null;

                /**
                 * Request status.
                 * @member {tilbo.ipc.v1.IStatusRequest|null|undefined} status
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.status = null;

                /**
                 * Request reloadRules.
                 * @member {tilbo.ipc.v1.IReloadRulesRequest|null|undefined} reloadRules
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.reloadRules = null;

                /**
                 * Request listTags.
                 * @member {tilbo.ipc.v1.IListTagsRequest|null|undefined} listTags
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.listTags = null;

                /**
                 * Request hydrateTags.
                 * @member {tilbo.ipc.v1.IHydrateTagsRequest|null|undefined} hydrateTags
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.hydrateTags = null;

                /**
                 * Request listDirectory.
                 * @member {tilbo.ipc.v1.IListDirectoryRequest|null|undefined} listDirectory
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.listDirectory = null;

                /**
                 * Request statFile.
                 * @member {tilbo.ipc.v1.IStatFileRequest|null|undefined} statFile
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.statFile = null;

                /**
                 * Request globSearch.
                 * @member {tilbo.ipc.v1.IGlobSearchRequest|null|undefined} globSearch
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.globSearch = null;

                /**
                 * Request renameFile.
                 * @member {tilbo.ipc.v1.IRenameFileRequest|null|undefined} renameFile
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.renameFile = null;

                /**
                 * Request deleteFile.
                 * @member {tilbo.ipc.v1.IDeleteFileRequest|null|undefined} deleteFile
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.deleteFile = null;

                /**
                 * Request chmodFile.
                 * @member {tilbo.ipc.v1.IChmodFileRequest|null|undefined} chmodFile
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.chmodFile = null;

                /**
                 * Request listPlaces.
                 * @member {tilbo.ipc.v1.IListPlacesRequest|null|undefined} listPlaces
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Request.prototype.listPlaces = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * Request kind.
                 * @member {"search"|"tag"|"metadata"|"metadataSet"|"related"|"status"|"reloadRules"|"listTags"|"hydrateTags"|"listDirectory"|"statFile"|"globSearch"|"renameFile"|"deleteFile"|"chmodFile"|"listPlaces"|undefined} kind
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 */
                Object.defineProperty(Request.prototype, "kind", {
                    get: $util.oneOfGetter($oneOfFields = ["search", "tag", "metadata", "metadataSet", "related", "status", "reloadRules", "listTags", "hydrateTags", "listDirectory", "statFile", "globSearch", "renameFile", "deleteFile", "chmodFile", "listPlaces"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new Request instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {tilbo.ipc.v1.IRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.Request} Request instance
                 */
                Request.create = function create(properties) {
                    return new Request(properties);
                };

                /**
                 * Encodes the specified Request message. Does not implicitly {@link tilbo.ipc.v1.Request.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {tilbo.ipc.v1.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                        $root.tilbo.ipc.v1.SearchRequest.encode(message.search, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                        $root.tilbo.ipc.v1.TagRequest.encode(message.tag, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                        $root.tilbo.ipc.v1.MetadataRequest.encode(message.metadata, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.metadataSet != null && Object.hasOwnProperty.call(message, "metadataSet"))
                        $root.tilbo.ipc.v1.MetadataSetRequest.encode(message.metadataSet, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.related != null && Object.hasOwnProperty.call(message, "related"))
                        $root.tilbo.ipc.v1.RelatedRequest.encode(message.related, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                        $root.tilbo.ipc.v1.StatusRequest.encode(message.status, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.reloadRules != null && Object.hasOwnProperty.call(message, "reloadRules"))
                        $root.tilbo.ipc.v1.ReloadRulesRequest.encode(message.reloadRules, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                    if (message.listTags != null && Object.hasOwnProperty.call(message, "listTags"))
                        $root.tilbo.ipc.v1.ListTagsRequest.encode(message.listTags, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                    if (message.hydrateTags != null && Object.hasOwnProperty.call(message, "hydrateTags"))
                        $root.tilbo.ipc.v1.HydrateTagsRequest.encode(message.hydrateTags, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                    if (message.listDirectory != null && Object.hasOwnProperty.call(message, "listDirectory"))
                        $root.tilbo.ipc.v1.ListDirectoryRequest.encode(message.listDirectory, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                    if (message.statFile != null && Object.hasOwnProperty.call(message, "statFile"))
                        $root.tilbo.ipc.v1.StatFileRequest.encode(message.statFile, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                    if (message.globSearch != null && Object.hasOwnProperty.call(message, "globSearch"))
                        $root.tilbo.ipc.v1.GlobSearchRequest.encode(message.globSearch, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                    if (message.renameFile != null && Object.hasOwnProperty.call(message, "renameFile"))
                        $root.tilbo.ipc.v1.RenameFileRequest.encode(message.renameFile, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
                    if (message.deleteFile != null && Object.hasOwnProperty.call(message, "deleteFile"))
                        $root.tilbo.ipc.v1.DeleteFileRequest.encode(message.deleteFile, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
                    if (message.chmodFile != null && Object.hasOwnProperty.call(message, "chmodFile"))
                        $root.tilbo.ipc.v1.ChmodFileRequest.encode(message.chmodFile, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
                    if (message.listPlaces != null && Object.hasOwnProperty.call(message, "listPlaces"))
                        $root.tilbo.ipc.v1.ListPlacesRequest.encode(message.listPlaces, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Request message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Request.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {tilbo.ipc.v1.IRequest} message Request message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Request.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Request message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Request();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.search = $root.tilbo.ipc.v1.SearchRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.tag = $root.tilbo.ipc.v1.TagRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.metadata = $root.tilbo.ipc.v1.MetadataRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.related = $root.tilbo.ipc.v1.RelatedRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 6: {
                                message.status = $root.tilbo.ipc.v1.StatusRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 7: {
                                message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 8: {
                                message.listTags = $root.tilbo.ipc.v1.ListTagsRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 9: {
                                message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 10: {
                                message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 11: {
                                message.statFile = $root.tilbo.ipc.v1.StatFileRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 12: {
                                message.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 13: {
                                message.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 14: {
                                message.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 15: {
                                message.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.decode(reader, reader.uint32());
                                break;
                            }
                        case 16: {
                                message.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Request message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.Request} Request
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Request.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Request message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Request.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.search != null && message.hasOwnProperty("search")) {
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.SearchRequest.verify(message.search);
                            if (error)
                                return "search." + error;
                        }
                    }
                    if (message.tag != null && message.hasOwnProperty("tag")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.TagRequest.verify(message.tag);
                            if (error)
                                return "tag." + error;
                        }
                    }
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.MetadataRequest.verify(message.metadata);
                            if (error)
                                return "metadata." + error;
                        }
                    }
                    if (message.metadataSet != null && message.hasOwnProperty("metadataSet")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.MetadataSetRequest.verify(message.metadataSet);
                            if (error)
                                return "metadataSet." + error;
                        }
                    }
                    if (message.related != null && message.hasOwnProperty("related")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.RelatedRequest.verify(message.related);
                            if (error)
                                return "related." + error;
                        }
                    }
                    if (message.status != null && message.hasOwnProperty("status")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.StatusRequest.verify(message.status);
                            if (error)
                                return "status." + error;
                        }
                    }
                    if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ReloadRulesRequest.verify(message.reloadRules);
                            if (error)
                                return "reloadRules." + error;
                        }
                    }
                    if (message.listTags != null && message.hasOwnProperty("listTags")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListTagsRequest.verify(message.listTags);
                            if (error)
                                return "listTags." + error;
                        }
                    }
                    if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.HydrateTagsRequest.verify(message.hydrateTags);
                            if (error)
                                return "hydrateTags." + error;
                        }
                    }
                    if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListDirectoryRequest.verify(message.listDirectory);
                            if (error)
                                return "listDirectory." + error;
                        }
                    }
                    if (message.statFile != null && message.hasOwnProperty("statFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.StatFileRequest.verify(message.statFile);
                            if (error)
                                return "statFile." + error;
                        }
                    }
                    if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.GlobSearchRequest.verify(message.globSearch);
                            if (error)
                                return "globSearch." + error;
                        }
                    }
                    if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.RenameFileRequest.verify(message.renameFile);
                            if (error)
                                return "renameFile." + error;
                        }
                    }
                    if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.DeleteFileRequest.verify(message.deleteFile);
                            if (error)
                                return "deleteFile." + error;
                        }
                    }
                    if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ChmodFileRequest.verify(message.chmodFile);
                            if (error)
                                return "chmodFile." + error;
                        }
                    }
                    if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListPlacesRequest.verify(message.listPlaces);
                            if (error)
                                return "listPlaces." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a Request message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.Request} Request
                 */
                Request.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.Request)
                        return object;
                    let message = new $root.tilbo.ipc.v1.Request();
                    if (object.search != null) {
                        if (typeof object.search !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.search: object expected");
                        message.search = $root.tilbo.ipc.v1.SearchRequest.fromObject(object.search);
                    }
                    if (object.tag != null) {
                        if (typeof object.tag !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.tag: object expected");
                        message.tag = $root.tilbo.ipc.v1.TagRequest.fromObject(object.tag);
                    }
                    if (object.metadata != null) {
                        if (typeof object.metadata !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.metadata: object expected");
                        message.metadata = $root.tilbo.ipc.v1.MetadataRequest.fromObject(object.metadata);
                    }
                    if (object.metadataSet != null) {
                        if (typeof object.metadataSet !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.metadataSet: object expected");
                        message.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.fromObject(object.metadataSet);
                    }
                    if (object.related != null) {
                        if (typeof object.related !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.related: object expected");
                        message.related = $root.tilbo.ipc.v1.RelatedRequest.fromObject(object.related);
                    }
                    if (object.status != null) {
                        if (typeof object.status !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.status: object expected");
                        message.status = $root.tilbo.ipc.v1.StatusRequest.fromObject(object.status);
                    }
                    if (object.reloadRules != null) {
                        if (typeof object.reloadRules !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.reloadRules: object expected");
                        message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.fromObject(object.reloadRules);
                    }
                    if (object.listTags != null) {
                        if (typeof object.listTags !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.listTags: object expected");
                        message.listTags = $root.tilbo.ipc.v1.ListTagsRequest.fromObject(object.listTags);
                    }
                    if (object.hydrateTags != null) {
                        if (typeof object.hydrateTags !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.hydrateTags: object expected");
                        message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.fromObject(object.hydrateTags);
                    }
                    if (object.listDirectory != null) {
                        if (typeof object.listDirectory !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.listDirectory: object expected");
                        message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.fromObject(object.listDirectory);
                    }
                    if (object.statFile != null) {
                        if (typeof object.statFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.statFile: object expected");
                        message.statFile = $root.tilbo.ipc.v1.StatFileRequest.fromObject(object.statFile);
                    }
                    if (object.globSearch != null) {
                        if (typeof object.globSearch !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.globSearch: object expected");
                        message.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.fromObject(object.globSearch);
                    }
                    if (object.renameFile != null) {
                        if (typeof object.renameFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.renameFile: object expected");
                        message.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.fromObject(object.renameFile);
                    }
                    if (object.deleteFile != null) {
                        if (typeof object.deleteFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.deleteFile: object expected");
                        message.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.fromObject(object.deleteFile);
                    }
                    if (object.chmodFile != null) {
                        if (typeof object.chmodFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.chmodFile: object expected");
                        message.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.fromObject(object.chmodFile);
                    }
                    if (object.listPlaces != null) {
                        if (typeof object.listPlaces !== "object")
                            throw TypeError(".tilbo.ipc.v1.Request.listPlaces: object expected");
                        message.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.fromObject(object.listPlaces);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Request message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {tilbo.ipc.v1.Request} message Request
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Request.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.search != null && message.hasOwnProperty("search")) {
                        object.search = $root.tilbo.ipc.v1.SearchRequest.toObject(message.search, options);
                        if (options.oneofs)
                            object.kind = "search";
                    }
                    if (message.tag != null && message.hasOwnProperty("tag")) {
                        object.tag = $root.tilbo.ipc.v1.TagRequest.toObject(message.tag, options);
                        if (options.oneofs)
                            object.kind = "tag";
                    }
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        object.metadata = $root.tilbo.ipc.v1.MetadataRequest.toObject(message.metadata, options);
                        if (options.oneofs)
                            object.kind = "metadata";
                    }
                    if (message.metadataSet != null && message.hasOwnProperty("metadataSet")) {
                        object.metadataSet = $root.tilbo.ipc.v1.MetadataSetRequest.toObject(message.metadataSet, options);
                        if (options.oneofs)
                            object.kind = "metadataSet";
                    }
                    if (message.related != null && message.hasOwnProperty("related")) {
                        object.related = $root.tilbo.ipc.v1.RelatedRequest.toObject(message.related, options);
                        if (options.oneofs)
                            object.kind = "related";
                    }
                    if (message.status != null && message.hasOwnProperty("status")) {
                        object.status = $root.tilbo.ipc.v1.StatusRequest.toObject(message.status, options);
                        if (options.oneofs)
                            object.kind = "status";
                    }
                    if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
                        object.reloadRules = $root.tilbo.ipc.v1.ReloadRulesRequest.toObject(message.reloadRules, options);
                        if (options.oneofs)
                            object.kind = "reloadRules";
                    }
                    if (message.listTags != null && message.hasOwnProperty("listTags")) {
                        object.listTags = $root.tilbo.ipc.v1.ListTagsRequest.toObject(message.listTags, options);
                        if (options.oneofs)
                            object.kind = "listTags";
                    }
                    if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
                        object.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsRequest.toObject(message.hydrateTags, options);
                        if (options.oneofs)
                            object.kind = "hydrateTags";
                    }
                    if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
                        object.listDirectory = $root.tilbo.ipc.v1.ListDirectoryRequest.toObject(message.listDirectory, options);
                        if (options.oneofs)
                            object.kind = "listDirectory";
                    }
                    if (message.statFile != null && message.hasOwnProperty("statFile")) {
                        object.statFile = $root.tilbo.ipc.v1.StatFileRequest.toObject(message.statFile, options);
                        if (options.oneofs)
                            object.kind = "statFile";
                    }
                    if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
                        object.globSearch = $root.tilbo.ipc.v1.GlobSearchRequest.toObject(message.globSearch, options);
                        if (options.oneofs)
                            object.kind = "globSearch";
                    }
                    if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
                        object.renameFile = $root.tilbo.ipc.v1.RenameFileRequest.toObject(message.renameFile, options);
                        if (options.oneofs)
                            object.kind = "renameFile";
                    }
                    if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
                        object.deleteFile = $root.tilbo.ipc.v1.DeleteFileRequest.toObject(message.deleteFile, options);
                        if (options.oneofs)
                            object.kind = "deleteFile";
                    }
                    if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
                        object.chmodFile = $root.tilbo.ipc.v1.ChmodFileRequest.toObject(message.chmodFile, options);
                        if (options.oneofs)
                            object.kind = "chmodFile";
                    }
                    if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
                        object.listPlaces = $root.tilbo.ipc.v1.ListPlacesRequest.toObject(message.listPlaces, options);
                        if (options.oneofs)
                            object.kind = "listPlaces";
                    }
                    return object;
                };

                /**
                 * Converts this Request to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.Request
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Request.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Request
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.Request
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Request.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.Request";
                };

                return Request;
            })();

            v1.Response = (function() {

                /**
                 * Properties of a Response.
                 * @memberof tilbo.ipc.v1
                 * @interface IResponse
                 * @property {tilbo.ipc.v1.IErrorResponse|null} [error] Response error
                 * @property {tilbo.ipc.v1.ISearchResponse|null} [search] Response search
                 * @property {tilbo.ipc.v1.ITagResponse|null} [tag] Response tag
                 * @property {tilbo.ipc.v1.IMetadataResponse|null} [metadata] Response metadata
                 * @property {tilbo.ipc.v1.IRelatedResponse|null} [related] Response related
                 * @property {tilbo.ipc.v1.IStatusResponse|null} [status] Response status
                 * @property {tilbo.ipc.v1.IReloadRulesResponse|null} [reloadRules] Response reloadRules
                 * @property {tilbo.ipc.v1.IListTagsResponse|null} [listTags] Response listTags
                 * @property {tilbo.ipc.v1.IHydrateTagsResponse|null} [hydrateTags] Response hydrateTags
                 * @property {tilbo.ipc.v1.IListDirectoryResponse|null} [listDirectory] Response listDirectory
                 * @property {tilbo.ipc.v1.IStatFileResponse|null} [statFile] Response statFile
                 * @property {tilbo.ipc.v1.IGlobSearchResponse|null} [globSearch] Response globSearch
                 * @property {tilbo.ipc.v1.IRenameFileResponse|null} [renameFile] Response renameFile
                 * @property {tilbo.ipc.v1.IDeleteFileResponse|null} [deleteFile] Response deleteFile
                 * @property {tilbo.ipc.v1.IChmodFileResponse|null} [chmodFile] Response chmodFile
                 * @property {tilbo.ipc.v1.IListPlacesResponse|null} [listPlaces] Response listPlaces
                 */

                /**
                 * Constructs a new Response.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a Response.
                 * @implements IResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IResponse=} [properties] Properties to set
                 */
                function Response(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Response error.
                 * @member {tilbo.ipc.v1.IErrorResponse|null|undefined} error
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.error = null;

                /**
                 * Response search.
                 * @member {tilbo.ipc.v1.ISearchResponse|null|undefined} search
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.search = null;

                /**
                 * Response tag.
                 * @member {tilbo.ipc.v1.ITagResponse|null|undefined} tag
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.tag = null;

                /**
                 * Response metadata.
                 * @member {tilbo.ipc.v1.IMetadataResponse|null|undefined} metadata
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.metadata = null;

                /**
                 * Response related.
                 * @member {tilbo.ipc.v1.IRelatedResponse|null|undefined} related
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.related = null;

                /**
                 * Response status.
                 * @member {tilbo.ipc.v1.IStatusResponse|null|undefined} status
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.status = null;

                /**
                 * Response reloadRules.
                 * @member {tilbo.ipc.v1.IReloadRulesResponse|null|undefined} reloadRules
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.reloadRules = null;

                /**
                 * Response listTags.
                 * @member {tilbo.ipc.v1.IListTagsResponse|null|undefined} listTags
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.listTags = null;

                /**
                 * Response hydrateTags.
                 * @member {tilbo.ipc.v1.IHydrateTagsResponse|null|undefined} hydrateTags
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.hydrateTags = null;

                /**
                 * Response listDirectory.
                 * @member {tilbo.ipc.v1.IListDirectoryResponse|null|undefined} listDirectory
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.listDirectory = null;

                /**
                 * Response statFile.
                 * @member {tilbo.ipc.v1.IStatFileResponse|null|undefined} statFile
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.statFile = null;

                /**
                 * Response globSearch.
                 * @member {tilbo.ipc.v1.IGlobSearchResponse|null|undefined} globSearch
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.globSearch = null;

                /**
                 * Response renameFile.
                 * @member {tilbo.ipc.v1.IRenameFileResponse|null|undefined} renameFile
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.renameFile = null;

                /**
                 * Response deleteFile.
                 * @member {tilbo.ipc.v1.IDeleteFileResponse|null|undefined} deleteFile
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.deleteFile = null;

                /**
                 * Response chmodFile.
                 * @member {tilbo.ipc.v1.IChmodFileResponse|null|undefined} chmodFile
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.chmodFile = null;

                /**
                 * Response listPlaces.
                 * @member {tilbo.ipc.v1.IListPlacesResponse|null|undefined} listPlaces
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Response.prototype.listPlaces = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * Response kind.
                 * @member {"error"|"search"|"tag"|"metadata"|"related"|"status"|"reloadRules"|"listTags"|"hydrateTags"|"listDirectory"|"statFile"|"globSearch"|"renameFile"|"deleteFile"|"chmodFile"|"listPlaces"|undefined} kind
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 */
                Object.defineProperty(Response.prototype, "kind", {
                    get: $util.oneOfGetter($oneOfFields = ["error", "search", "tag", "metadata", "related", "status", "reloadRules", "listTags", "hydrateTags", "listDirectory", "statFile", "globSearch", "renameFile", "deleteFile", "chmodFile", "listPlaces"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new Response instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {tilbo.ipc.v1.IResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.Response} Response instance
                 */
                Response.create = function create(properties) {
                    return new Response(properties);
                };

                /**
                 * Encodes the specified Response message. Does not implicitly {@link tilbo.ipc.v1.Response.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {tilbo.ipc.v1.IResponse} message Response message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Response.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                        $root.tilbo.ipc.v1.ErrorResponse.encode(message.error, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                        $root.tilbo.ipc.v1.SearchResponse.encode(message.search, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                        $root.tilbo.ipc.v1.TagResponse.encode(message.tag, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                        $root.tilbo.ipc.v1.MetadataResponse.encode(message.metadata, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                    if (message.related != null && Object.hasOwnProperty.call(message, "related"))
                        $root.tilbo.ipc.v1.RelatedResponse.encode(message.related, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                    if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                        $root.tilbo.ipc.v1.StatusResponse.encode(message.status, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                    if (message.reloadRules != null && Object.hasOwnProperty.call(message, "reloadRules"))
                        $root.tilbo.ipc.v1.ReloadRulesResponse.encode(message.reloadRules, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                    if (message.listTags != null && Object.hasOwnProperty.call(message, "listTags"))
                        $root.tilbo.ipc.v1.ListTagsResponse.encode(message.listTags, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                    if (message.hydrateTags != null && Object.hasOwnProperty.call(message, "hydrateTags"))
                        $root.tilbo.ipc.v1.HydrateTagsResponse.encode(message.hydrateTags, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                    if (message.listDirectory != null && Object.hasOwnProperty.call(message, "listDirectory"))
                        $root.tilbo.ipc.v1.ListDirectoryResponse.encode(message.listDirectory, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                    if (message.statFile != null && Object.hasOwnProperty.call(message, "statFile"))
                        $root.tilbo.ipc.v1.StatFileResponse.encode(message.statFile, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                    if (message.globSearch != null && Object.hasOwnProperty.call(message, "globSearch"))
                        $root.tilbo.ipc.v1.GlobSearchResponse.encode(message.globSearch, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                    if (message.renameFile != null && Object.hasOwnProperty.call(message, "renameFile"))
                        $root.tilbo.ipc.v1.RenameFileResponse.encode(message.renameFile, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
                    if (message.deleteFile != null && Object.hasOwnProperty.call(message, "deleteFile"))
                        $root.tilbo.ipc.v1.DeleteFileResponse.encode(message.deleteFile, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
                    if (message.chmodFile != null && Object.hasOwnProperty.call(message, "chmodFile"))
                        $root.tilbo.ipc.v1.ChmodFileResponse.encode(message.chmodFile, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
                    if (message.listPlaces != null && Object.hasOwnProperty.call(message, "listPlaces"))
                        $root.tilbo.ipc.v1.ListPlacesResponse.encode(message.listPlaces, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Response message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Response.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {tilbo.ipc.v1.IResponse} message Response message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Response.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Response message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.Response} Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Response.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Response();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.error = $root.tilbo.ipc.v1.ErrorResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.search = $root.tilbo.ipc.v1.SearchResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.tag = $root.tilbo.ipc.v1.TagResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 4: {
                                message.metadata = $root.tilbo.ipc.v1.MetadataResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 5: {
                                message.related = $root.tilbo.ipc.v1.RelatedResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 6: {
                                message.status = $root.tilbo.ipc.v1.StatusResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 7: {
                                message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 8: {
                                message.listTags = $root.tilbo.ipc.v1.ListTagsResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 9: {
                                message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 10: {
                                message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 11: {
                                message.statFile = $root.tilbo.ipc.v1.StatFileResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 12: {
                                message.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 13: {
                                message.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 14: {
                                message.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 15: {
                                message.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.decode(reader, reader.uint32());
                                break;
                            }
                        case 16: {
                                message.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Response message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.Response} Response
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Response.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Response message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Response.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.error != null && message.hasOwnProperty("error")) {
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ErrorResponse.verify(message.error);
                            if (error)
                                return "error." + error;
                        }
                    }
                    if (message.search != null && message.hasOwnProperty("search")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.SearchResponse.verify(message.search);
                            if (error)
                                return "search." + error;
                        }
                    }
                    if (message.tag != null && message.hasOwnProperty("tag")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.TagResponse.verify(message.tag);
                            if (error)
                                return "tag." + error;
                        }
                    }
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.MetadataResponse.verify(message.metadata);
                            if (error)
                                return "metadata." + error;
                        }
                    }
                    if (message.related != null && message.hasOwnProperty("related")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.RelatedResponse.verify(message.related);
                            if (error)
                                return "related." + error;
                        }
                    }
                    if (message.status != null && message.hasOwnProperty("status")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.StatusResponse.verify(message.status);
                            if (error)
                                return "status." + error;
                        }
                    }
                    if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ReloadRulesResponse.verify(message.reloadRules);
                            if (error)
                                return "reloadRules." + error;
                        }
                    }
                    if (message.listTags != null && message.hasOwnProperty("listTags")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListTagsResponse.verify(message.listTags);
                            if (error)
                                return "listTags." + error;
                        }
                    }
                    if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.HydrateTagsResponse.verify(message.hydrateTags);
                            if (error)
                                return "hydrateTags." + error;
                        }
                    }
                    if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListDirectoryResponse.verify(message.listDirectory);
                            if (error)
                                return "listDirectory." + error;
                        }
                    }
                    if (message.statFile != null && message.hasOwnProperty("statFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.StatFileResponse.verify(message.statFile);
                            if (error)
                                return "statFile." + error;
                        }
                    }
                    if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.GlobSearchResponse.verify(message.globSearch);
                            if (error)
                                return "globSearch." + error;
                        }
                    }
                    if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.RenameFileResponse.verify(message.renameFile);
                            if (error)
                                return "renameFile." + error;
                        }
                    }
                    if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.DeleteFileResponse.verify(message.deleteFile);
                            if (error)
                                return "deleteFile." + error;
                        }
                    }
                    if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ChmodFileResponse.verify(message.chmodFile);
                            if (error)
                                return "chmodFile." + error;
                        }
                    }
                    if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.ListPlacesResponse.verify(message.listPlaces);
                            if (error)
                                return "listPlaces." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a Response message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.Response} Response
                 */
                Response.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.Response)
                        return object;
                    let message = new $root.tilbo.ipc.v1.Response();
                    if (object.error != null) {
                        if (typeof object.error !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.error: object expected");
                        message.error = $root.tilbo.ipc.v1.ErrorResponse.fromObject(object.error);
                    }
                    if (object.search != null) {
                        if (typeof object.search !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.search: object expected");
                        message.search = $root.tilbo.ipc.v1.SearchResponse.fromObject(object.search);
                    }
                    if (object.tag != null) {
                        if (typeof object.tag !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.tag: object expected");
                        message.tag = $root.tilbo.ipc.v1.TagResponse.fromObject(object.tag);
                    }
                    if (object.metadata != null) {
                        if (typeof object.metadata !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.metadata: object expected");
                        message.metadata = $root.tilbo.ipc.v1.MetadataResponse.fromObject(object.metadata);
                    }
                    if (object.related != null) {
                        if (typeof object.related !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.related: object expected");
                        message.related = $root.tilbo.ipc.v1.RelatedResponse.fromObject(object.related);
                    }
                    if (object.status != null) {
                        if (typeof object.status !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.status: object expected");
                        message.status = $root.tilbo.ipc.v1.StatusResponse.fromObject(object.status);
                    }
                    if (object.reloadRules != null) {
                        if (typeof object.reloadRules !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.reloadRules: object expected");
                        message.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.fromObject(object.reloadRules);
                    }
                    if (object.listTags != null) {
                        if (typeof object.listTags !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.listTags: object expected");
                        message.listTags = $root.tilbo.ipc.v1.ListTagsResponse.fromObject(object.listTags);
                    }
                    if (object.hydrateTags != null) {
                        if (typeof object.hydrateTags !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.hydrateTags: object expected");
                        message.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.fromObject(object.hydrateTags);
                    }
                    if (object.listDirectory != null) {
                        if (typeof object.listDirectory !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.listDirectory: object expected");
                        message.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.fromObject(object.listDirectory);
                    }
                    if (object.statFile != null) {
                        if (typeof object.statFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.statFile: object expected");
                        message.statFile = $root.tilbo.ipc.v1.StatFileResponse.fromObject(object.statFile);
                    }
                    if (object.globSearch != null) {
                        if (typeof object.globSearch !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.globSearch: object expected");
                        message.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.fromObject(object.globSearch);
                    }
                    if (object.renameFile != null) {
                        if (typeof object.renameFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.renameFile: object expected");
                        message.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.fromObject(object.renameFile);
                    }
                    if (object.deleteFile != null) {
                        if (typeof object.deleteFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.deleteFile: object expected");
                        message.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.fromObject(object.deleteFile);
                    }
                    if (object.chmodFile != null) {
                        if (typeof object.chmodFile !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.chmodFile: object expected");
                        message.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.fromObject(object.chmodFile);
                    }
                    if (object.listPlaces != null) {
                        if (typeof object.listPlaces !== "object")
                            throw TypeError(".tilbo.ipc.v1.Response.listPlaces: object expected");
                        message.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.fromObject(object.listPlaces);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Response message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {tilbo.ipc.v1.Response} message Response
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Response.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.error != null && message.hasOwnProperty("error")) {
                        object.error = $root.tilbo.ipc.v1.ErrorResponse.toObject(message.error, options);
                        if (options.oneofs)
                            object.kind = "error";
                    }
                    if (message.search != null && message.hasOwnProperty("search")) {
                        object.search = $root.tilbo.ipc.v1.SearchResponse.toObject(message.search, options);
                        if (options.oneofs)
                            object.kind = "search";
                    }
                    if (message.tag != null && message.hasOwnProperty("tag")) {
                        object.tag = $root.tilbo.ipc.v1.TagResponse.toObject(message.tag, options);
                        if (options.oneofs)
                            object.kind = "tag";
                    }
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        object.metadata = $root.tilbo.ipc.v1.MetadataResponse.toObject(message.metadata, options);
                        if (options.oneofs)
                            object.kind = "metadata";
                    }
                    if (message.related != null && message.hasOwnProperty("related")) {
                        object.related = $root.tilbo.ipc.v1.RelatedResponse.toObject(message.related, options);
                        if (options.oneofs)
                            object.kind = "related";
                    }
                    if (message.status != null && message.hasOwnProperty("status")) {
                        object.status = $root.tilbo.ipc.v1.StatusResponse.toObject(message.status, options);
                        if (options.oneofs)
                            object.kind = "status";
                    }
                    if (message.reloadRules != null && message.hasOwnProperty("reloadRules")) {
                        object.reloadRules = $root.tilbo.ipc.v1.ReloadRulesResponse.toObject(message.reloadRules, options);
                        if (options.oneofs)
                            object.kind = "reloadRules";
                    }
                    if (message.listTags != null && message.hasOwnProperty("listTags")) {
                        object.listTags = $root.tilbo.ipc.v1.ListTagsResponse.toObject(message.listTags, options);
                        if (options.oneofs)
                            object.kind = "listTags";
                    }
                    if (message.hydrateTags != null && message.hasOwnProperty("hydrateTags")) {
                        object.hydrateTags = $root.tilbo.ipc.v1.HydrateTagsResponse.toObject(message.hydrateTags, options);
                        if (options.oneofs)
                            object.kind = "hydrateTags";
                    }
                    if (message.listDirectory != null && message.hasOwnProperty("listDirectory")) {
                        object.listDirectory = $root.tilbo.ipc.v1.ListDirectoryResponse.toObject(message.listDirectory, options);
                        if (options.oneofs)
                            object.kind = "listDirectory";
                    }
                    if (message.statFile != null && message.hasOwnProperty("statFile")) {
                        object.statFile = $root.tilbo.ipc.v1.StatFileResponse.toObject(message.statFile, options);
                        if (options.oneofs)
                            object.kind = "statFile";
                    }
                    if (message.globSearch != null && message.hasOwnProperty("globSearch")) {
                        object.globSearch = $root.tilbo.ipc.v1.GlobSearchResponse.toObject(message.globSearch, options);
                        if (options.oneofs)
                            object.kind = "globSearch";
                    }
                    if (message.renameFile != null && message.hasOwnProperty("renameFile")) {
                        object.renameFile = $root.tilbo.ipc.v1.RenameFileResponse.toObject(message.renameFile, options);
                        if (options.oneofs)
                            object.kind = "renameFile";
                    }
                    if (message.deleteFile != null && message.hasOwnProperty("deleteFile")) {
                        object.deleteFile = $root.tilbo.ipc.v1.DeleteFileResponse.toObject(message.deleteFile, options);
                        if (options.oneofs)
                            object.kind = "deleteFile";
                    }
                    if (message.chmodFile != null && message.hasOwnProperty("chmodFile")) {
                        object.chmodFile = $root.tilbo.ipc.v1.ChmodFileResponse.toObject(message.chmodFile, options);
                        if (options.oneofs)
                            object.kind = "chmodFile";
                    }
                    if (message.listPlaces != null && message.hasOwnProperty("listPlaces")) {
                        object.listPlaces = $root.tilbo.ipc.v1.ListPlacesResponse.toObject(message.listPlaces, options);
                        if (options.oneofs)
                            object.kind = "listPlaces";
                    }
                    return object;
                };

                /**
                 * Converts this Response to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.Response
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Response.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Response
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.Response
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Response.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.Response";
                };

                return Response;
            })();

            v1.Event = (function() {

                /**
                 * Properties of an Event.
                 * @memberof tilbo.ipc.v1
                 * @interface IEvent
                 * @property {tilbo.ipc.v1.IFileTaggedEvent|null} [fileTagged] Event fileTagged
                 * @property {tilbo.ipc.v1.IIndexUpdatedEvent|null} [indexUpdated] Event indexUpdated
                 * @property {tilbo.ipc.v1.IDaemonStateChangedEvent|null} [daemonStateChanged] Event daemonStateChanged
                 */

                /**
                 * Constructs a new Event.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents an Event.
                 * @implements IEvent
                 * @constructor
                 * @param {tilbo.ipc.v1.IEvent=} [properties] Properties to set
                 */
                function Event(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Event fileTagged.
                 * @member {tilbo.ipc.v1.IFileTaggedEvent|null|undefined} fileTagged
                 * @memberof tilbo.ipc.v1.Event
                 * @instance
                 */
                Event.prototype.fileTagged = null;

                /**
                 * Event indexUpdated.
                 * @member {tilbo.ipc.v1.IIndexUpdatedEvent|null|undefined} indexUpdated
                 * @memberof tilbo.ipc.v1.Event
                 * @instance
                 */
                Event.prototype.indexUpdated = null;

                /**
                 * Event daemonStateChanged.
                 * @member {tilbo.ipc.v1.IDaemonStateChangedEvent|null|undefined} daemonStateChanged
                 * @memberof tilbo.ipc.v1.Event
                 * @instance
                 */
                Event.prototype.daemonStateChanged = null;

                // OneOf field names bound to virtual getters and setters
                let $oneOfFields;

                /**
                 * Event kind.
                 * @member {"fileTagged"|"indexUpdated"|"daemonStateChanged"|undefined} kind
                 * @memberof tilbo.ipc.v1.Event
                 * @instance
                 */
                Object.defineProperty(Event.prototype, "kind", {
                    get: $util.oneOfGetter($oneOfFields = ["fileTagged", "indexUpdated", "daemonStateChanged"]),
                    set: $util.oneOfSetter($oneOfFields)
                });

                /**
                 * Creates a new Event instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {tilbo.ipc.v1.IEvent=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.Event} Event instance
                 */
                Event.create = function create(properties) {
                    return new Event(properties);
                };

                /**
                 * Encodes the specified Event message. Does not implicitly {@link tilbo.ipc.v1.Event.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {tilbo.ipc.v1.IEvent} message Event message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Event.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.fileTagged != null && Object.hasOwnProperty.call(message, "fileTagged"))
                        $root.tilbo.ipc.v1.FileTaggedEvent.encode(message.fileTagged, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.indexUpdated != null && Object.hasOwnProperty.call(message, "indexUpdated"))
                        $root.tilbo.ipc.v1.IndexUpdatedEvent.encode(message.indexUpdated, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                    if (message.daemonStateChanged != null && Object.hasOwnProperty.call(message, "daemonStateChanged"))
                        $root.tilbo.ipc.v1.DaemonStateChangedEvent.encode(message.daemonStateChanged, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified Event message, length delimited. Does not implicitly {@link tilbo.ipc.v1.Event.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {tilbo.ipc.v1.IEvent} message Event message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Event.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Event message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.Event} Event
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Event.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.Event();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.decode(reader, reader.uint32());
                                break;
                            }
                        case 3: {
                                message.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Event message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.Event} Event
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Event.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Event message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Event.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    let properties = {};
                    if (message.fileTagged != null && message.hasOwnProperty("fileTagged")) {
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.FileTaggedEvent.verify(message.fileTagged);
                            if (error)
                                return "fileTagged." + error;
                        }
                    }
                    if (message.indexUpdated != null && message.hasOwnProperty("indexUpdated")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.IndexUpdatedEvent.verify(message.indexUpdated);
                            if (error)
                                return "indexUpdated." + error;
                        }
                    }
                    if (message.daemonStateChanged != null && message.hasOwnProperty("daemonStateChanged")) {
                        if (properties.kind === 1)
                            return "kind: multiple values";
                        properties.kind = 1;
                        {
                            let error = $root.tilbo.ipc.v1.DaemonStateChangedEvent.verify(message.daemonStateChanged);
                            if (error)
                                return "daemonStateChanged." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates an Event message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.Event} Event
                 */
                Event.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.Event)
                        return object;
                    let message = new $root.tilbo.ipc.v1.Event();
                    if (object.fileTagged != null) {
                        if (typeof object.fileTagged !== "object")
                            throw TypeError(".tilbo.ipc.v1.Event.fileTagged: object expected");
                        message.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.fromObject(object.fileTagged);
                    }
                    if (object.indexUpdated != null) {
                        if (typeof object.indexUpdated !== "object")
                            throw TypeError(".tilbo.ipc.v1.Event.indexUpdated: object expected");
                        message.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.fromObject(object.indexUpdated);
                    }
                    if (object.daemonStateChanged != null) {
                        if (typeof object.daemonStateChanged !== "object")
                            throw TypeError(".tilbo.ipc.v1.Event.daemonStateChanged: object expected");
                        message.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.fromObject(object.daemonStateChanged);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an Event message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {tilbo.ipc.v1.Event} message Event
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Event.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (message.fileTagged != null && message.hasOwnProperty("fileTagged")) {
                        object.fileTagged = $root.tilbo.ipc.v1.FileTaggedEvent.toObject(message.fileTagged, options);
                        if (options.oneofs)
                            object.kind = "fileTagged";
                    }
                    if (message.indexUpdated != null && message.hasOwnProperty("indexUpdated")) {
                        object.indexUpdated = $root.tilbo.ipc.v1.IndexUpdatedEvent.toObject(message.indexUpdated, options);
                        if (options.oneofs)
                            object.kind = "indexUpdated";
                    }
                    if (message.daemonStateChanged != null && message.hasOwnProperty("daemonStateChanged")) {
                        object.daemonStateChanged = $root.tilbo.ipc.v1.DaemonStateChangedEvent.toObject(message.daemonStateChanged, options);
                        if (options.oneofs)
                            object.kind = "daemonStateChanged";
                    }
                    return object;
                };

                /**
                 * Converts this Event to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.Event
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Event.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for Event
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.Event
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.Event";
                };

                return Event;
            })();

            v1.ErrorResponse = (function() {

                /**
                 * Properties of an ErrorResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IErrorResponse
                 * @property {number|null} [code] ErrorResponse code
                 * @property {string|null} [message] ErrorResponse message
                 */

                /**
                 * Constructs a new ErrorResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents an ErrorResponse.
                 * @implements IErrorResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IErrorResponse=} [properties] Properties to set
                 */
                function ErrorResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ErrorResponse code.
                 * @member {number} code
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @instance
                 */
                ErrorResponse.prototype.code = 0;

                /**
                 * ErrorResponse message.
                 * @member {string} message
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @instance
                 */
                ErrorResponse.prototype.message = "";

                /**
                 * Creates a new ErrorResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {tilbo.ipc.v1.IErrorResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ErrorResponse} ErrorResponse instance
                 */
                ErrorResponse.create = function create(properties) {
                    return new ErrorResponse(properties);
                };

                /**
                 * Encodes the specified ErrorResponse message. Does not implicitly {@link tilbo.ipc.v1.ErrorResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {tilbo.ipc.v1.IErrorResponse} message ErrorResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ErrorResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.code);
                    if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                    return writer;
                };

                /**
                 * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ErrorResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {tilbo.ipc.v1.IErrorResponse} message ErrorResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an ErrorResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ErrorResponse} ErrorResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ErrorResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ErrorResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.code = reader.uint32();
                                break;
                            }
                        case 2: {
                                message.message = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ErrorResponse} ErrorResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ErrorResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an ErrorResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ErrorResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.code != null && message.hasOwnProperty("code"))
                        if (!$util.isInteger(message.code))
                            return "code: integer expected";
                    if (message.message != null && message.hasOwnProperty("message"))
                        if (!$util.isString(message.message))
                            return "message: string expected";
                    return null;
                };

                /**
                 * Creates an ErrorResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ErrorResponse} ErrorResponse
                 */
                ErrorResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ErrorResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ErrorResponse();
                    if (object.code != null)
                        message.code = object.code >>> 0;
                    if (object.message != null)
                        message.message = String(object.message);
                    return message;
                };

                /**
                 * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {tilbo.ipc.v1.ErrorResponse} message ErrorResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ErrorResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.code = 0;
                        object.message = "";
                    }
                    if (message.code != null && message.hasOwnProperty("code"))
                        object.code = message.code;
                    if (message.message != null && message.hasOwnProperty("message"))
                        object.message = message.message;
                    return object;
                };

                /**
                 * Converts this ErrorResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ErrorResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ErrorResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ErrorResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ErrorResponse";
                };

                return ErrorResponse;
            })();

            v1.SearchRequest = (function() {

                /**
                 * Properties of a SearchRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface ISearchRequest
                 * @property {Array.<string>|null} [tags] SearchRequest tags
                 * @property {boolean|null} [tagsAny] SearchRequest tagsAny
                 * @property {Array.<string>|null} [tagExclude] SearchRequest tagExclude
                 * @property {Object.<string,string>|null} [metaFilters] SearchRequest metaFilters
                 * @property {string|null} [ftsQuery] SearchRequest ftsQuery
                 * @property {number|null} [limit] SearchRequest limit
                 * @property {number|null} [offset] SearchRequest offset
                 * @property {Array.<string>|null} [sortBy] SearchRequest sortBy
                 * @property {string|null} [vectorQuery] SearchRequest vectorQuery
                 */

                /**
                 * Constructs a new SearchRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a SearchRequest.
                 * @implements ISearchRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.ISearchRequest=} [properties] Properties to set
                 */
                function SearchRequest(properties) {
                    this.tags = [];
                    this.tagExclude = [];
                    this.metaFilters = {};
                    this.sortBy = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SearchRequest tags.
                 * @member {Array.<string>} tags
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.tags = $util.emptyArray;

                /**
                 * SearchRequest tagsAny.
                 * @member {boolean} tagsAny
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.tagsAny = false;

                /**
                 * SearchRequest tagExclude.
                 * @member {Array.<string>} tagExclude
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.tagExclude = $util.emptyArray;

                /**
                 * SearchRequest metaFilters.
                 * @member {Object.<string,string>} metaFilters
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.metaFilters = $util.emptyObject;

                /**
                 * SearchRequest ftsQuery.
                 * @member {string} ftsQuery
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.ftsQuery = "";

                /**
                 * SearchRequest limit.
                 * @member {number} limit
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.limit = 0;

                /**
                 * SearchRequest offset.
                 * @member {number} offset
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.offset = 0;

                /**
                 * SearchRequest sortBy.
                 * @member {Array.<string>} sortBy
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.sortBy = $util.emptyArray;

                /**
                 * SearchRequest vectorQuery.
                 * @member {string} vectorQuery
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 */
                SearchRequest.prototype.vectorQuery = "";

                /**
                 * Creates a new SearchRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.ISearchRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.SearchRequest} SearchRequest instance
                 */
                SearchRequest.create = function create(properties) {
                    return new SearchRequest(properties);
                };

                /**
                 * Encodes the specified SearchRequest message. Does not implicitly {@link tilbo.ipc.v1.SearchRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.ISearchRequest} message SearchRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SearchRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.tags != null && message.tags.length)
                        for (let i = 0; i < message.tags.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.tags[i]);
                    if (message.tagsAny != null && Object.hasOwnProperty.call(message, "tagsAny"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.tagsAny);
                    if (message.tagExclude != null && message.tagExclude.length)
                        for (let i = 0; i < message.tagExclude.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.tagExclude[i]);
                    if (message.metaFilters != null && Object.hasOwnProperty.call(message, "metaFilters"))
                        for (let keys = Object.keys(message.metaFilters), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metaFilters[keys[i]]).ldelim();
                    if (message.ftsQuery != null && Object.hasOwnProperty.call(message, "ftsQuery"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.ftsQuery);
                    if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                        writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.limit);
                    if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                        writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.offset);
                    if (message.sortBy != null && message.sortBy.length)
                        for (let i = 0; i < message.sortBy.length; ++i)
                            writer.uint32(/* id 8, wireType 2 =*/66).string(message.sortBy[i]);
                    if (message.vectorQuery != null && Object.hasOwnProperty.call(message, "vectorQuery"))
                        writer.uint32(/* id 9, wireType 2 =*/74).string(message.vectorQuery);
                    return writer;
                };

                /**
                 * Encodes the specified SearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.SearchRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.ISearchRequest} message SearchRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SearchRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a SearchRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.SearchRequest} SearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SearchRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.SearchRequest(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.tags && message.tags.length))
                                    message.tags = [];
                                message.tags.push(reader.string());
                                break;
                            }
                        case 2: {
                                message.tagsAny = reader.bool();
                                break;
                            }
                        case 3: {
                                if (!(message.tagExclude && message.tagExclude.length))
                                    message.tagExclude = [];
                                message.tagExclude.push(reader.string());
                                break;
                            }
                        case 4: {
                                if (message.metaFilters === $util.emptyObject)
                                    message.metaFilters = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.metaFilters[key] = value;
                                break;
                            }
                        case 5: {
                                message.ftsQuery = reader.string();
                                break;
                            }
                        case 6: {
                                message.limit = reader.uint32();
                                break;
                            }
                        case 7: {
                                message.offset = reader.uint32();
                                break;
                            }
                        case 8: {
                                if (!(message.sortBy && message.sortBy.length))
                                    message.sortBy = [];
                                message.sortBy.push(reader.string());
                                break;
                            }
                        case 9: {
                                message.vectorQuery = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a SearchRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.SearchRequest} SearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SearchRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SearchRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SearchRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.tags != null && message.hasOwnProperty("tags")) {
                        if (!Array.isArray(message.tags))
                            return "tags: array expected";
                        for (let i = 0; i < message.tags.length; ++i)
                            if (!$util.isString(message.tags[i]))
                                return "tags: string[] expected";
                    }
                    if (message.tagsAny != null && message.hasOwnProperty("tagsAny"))
                        if (typeof message.tagsAny !== "boolean")
                            return "tagsAny: boolean expected";
                    if (message.tagExclude != null && message.hasOwnProperty("tagExclude")) {
                        if (!Array.isArray(message.tagExclude))
                            return "tagExclude: array expected";
                        for (let i = 0; i < message.tagExclude.length; ++i)
                            if (!$util.isString(message.tagExclude[i]))
                                return "tagExclude: string[] expected";
                    }
                    if (message.metaFilters != null && message.hasOwnProperty("metaFilters")) {
                        if (!$util.isObject(message.metaFilters))
                            return "metaFilters: object expected";
                        let key = Object.keys(message.metaFilters);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.metaFilters[key[i]]))
                                return "metaFilters: string{k:string} expected";
                    }
                    if (message.ftsQuery != null && message.hasOwnProperty("ftsQuery"))
                        if (!$util.isString(message.ftsQuery))
                            return "ftsQuery: string expected";
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        if (!$util.isInteger(message.limit))
                            return "limit: integer expected";
                    if (message.offset != null && message.hasOwnProperty("offset"))
                        if (!$util.isInteger(message.offset))
                            return "offset: integer expected";
                    if (message.sortBy != null && message.hasOwnProperty("sortBy")) {
                        if (!Array.isArray(message.sortBy))
                            return "sortBy: array expected";
                        for (let i = 0; i < message.sortBy.length; ++i)
                            if (!$util.isString(message.sortBy[i]))
                                return "sortBy: string[] expected";
                    }
                    if (message.vectorQuery != null && message.hasOwnProperty("vectorQuery"))
                        if (!$util.isString(message.vectorQuery))
                            return "vectorQuery: string expected";
                    return null;
                };

                /**
                 * Creates a SearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.SearchRequest} SearchRequest
                 */
                SearchRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.SearchRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.SearchRequest();
                    if (object.tags) {
                        if (!Array.isArray(object.tags))
                            throw TypeError(".tilbo.ipc.v1.SearchRequest.tags: array expected");
                        message.tags = [];
                        for (let i = 0; i < object.tags.length; ++i)
                            message.tags[i] = String(object.tags[i]);
                    }
                    if (object.tagsAny != null)
                        message.tagsAny = Boolean(object.tagsAny);
                    if (object.tagExclude) {
                        if (!Array.isArray(object.tagExclude))
                            throw TypeError(".tilbo.ipc.v1.SearchRequest.tagExclude: array expected");
                        message.tagExclude = [];
                        for (let i = 0; i < object.tagExclude.length; ++i)
                            message.tagExclude[i] = String(object.tagExclude[i]);
                    }
                    if (object.metaFilters) {
                        if (typeof object.metaFilters !== "object")
                            throw TypeError(".tilbo.ipc.v1.SearchRequest.metaFilters: object expected");
                        message.metaFilters = {};
                        for (let keys = Object.keys(object.metaFilters), i = 0; i < keys.length; ++i)
                            message.metaFilters[keys[i]] = String(object.metaFilters[keys[i]]);
                    }
                    if (object.ftsQuery != null)
                        message.ftsQuery = String(object.ftsQuery);
                    if (object.limit != null)
                        message.limit = object.limit >>> 0;
                    if (object.offset != null)
                        message.offset = object.offset >>> 0;
                    if (object.sortBy) {
                        if (!Array.isArray(object.sortBy))
                            throw TypeError(".tilbo.ipc.v1.SearchRequest.sortBy: array expected");
                        message.sortBy = [];
                        for (let i = 0; i < object.sortBy.length; ++i)
                            message.sortBy[i] = String(object.sortBy[i]);
                    }
                    if (object.vectorQuery != null)
                        message.vectorQuery = String(object.vectorQuery);
                    return message;
                };

                /**
                 * Creates a plain object from a SearchRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.SearchRequest} message SearchRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SearchRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.tags = [];
                        object.tagExclude = [];
                        object.sortBy = [];
                    }
                    if (options.objects || options.defaults)
                        object.metaFilters = {};
                    if (options.defaults) {
                        object.tagsAny = false;
                        object.ftsQuery = "";
                        object.limit = 0;
                        object.offset = 0;
                        object.vectorQuery = "";
                    }
                    if (message.tags && message.tags.length) {
                        object.tags = [];
                        for (let j = 0; j < message.tags.length; ++j)
                            object.tags[j] = message.tags[j];
                    }
                    if (message.tagsAny != null && message.hasOwnProperty("tagsAny"))
                        object.tagsAny = message.tagsAny;
                    if (message.tagExclude && message.tagExclude.length) {
                        object.tagExclude = [];
                        for (let j = 0; j < message.tagExclude.length; ++j)
                            object.tagExclude[j] = message.tagExclude[j];
                    }
                    let keys2;
                    if (message.metaFilters && (keys2 = Object.keys(message.metaFilters)).length) {
                        object.metaFilters = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.metaFilters[keys2[j]] = message.metaFilters[keys2[j]];
                    }
                    if (message.ftsQuery != null && message.hasOwnProperty("ftsQuery"))
                        object.ftsQuery = message.ftsQuery;
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        object.limit = message.limit;
                    if (message.offset != null && message.hasOwnProperty("offset"))
                        object.offset = message.offset;
                    if (message.sortBy && message.sortBy.length) {
                        object.sortBy = [];
                        for (let j = 0; j < message.sortBy.length; ++j)
                            object.sortBy[j] = message.sortBy[j];
                    }
                    if (message.vectorQuery != null && message.hasOwnProperty("vectorQuery"))
                        object.vectorQuery = message.vectorQuery;
                    return object;
                };

                /**
                 * Converts this SearchRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SearchRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SearchRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.SearchRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SearchRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.SearchRequest";
                };

                return SearchRequest;
            })();

            v1.FileResult = (function() {

                /**
                 * Properties of a FileResult.
                 * @memberof tilbo.ipc.v1
                 * @interface IFileResult
                 * @property {string|null} [path] FileResult path
                 * @property {Array.<string>|null} [tags] FileResult tags
                 * @property {Object.<string,string>|null} [metadata] FileResult metadata
                 * @property {number|null} [score] FileResult score
                 * @property {number|Long|null} [mtime] FileResult mtime
                 * @property {number|Long|null} [sizeBytes] FileResult sizeBytes
                 */

                /**
                 * Constructs a new FileResult.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a FileResult.
                 * @implements IFileResult
                 * @constructor
                 * @param {tilbo.ipc.v1.IFileResult=} [properties] Properties to set
                 */
                function FileResult(properties) {
                    this.tags = [];
                    this.metadata = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FileResult path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.path = "";

                /**
                 * FileResult tags.
                 * @member {Array.<string>} tags
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.tags = $util.emptyArray;

                /**
                 * FileResult metadata.
                 * @member {Object.<string,string>} metadata
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.metadata = $util.emptyObject;

                /**
                 * FileResult score.
                 * @member {number} score
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.score = 0;

                /**
                 * FileResult mtime.
                 * @member {number|Long} mtime
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.mtime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * FileResult sizeBytes.
                 * @member {number|Long} sizeBytes
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 */
                FileResult.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Creates a new FileResult instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {tilbo.ipc.v1.IFileResult=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.FileResult} FileResult instance
                 */
                FileResult.create = function create(properties) {
                    return new FileResult(properties);
                };

                /**
                 * Encodes the specified FileResult message. Does not implicitly {@link tilbo.ipc.v1.FileResult.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {tilbo.ipc.v1.IFileResult} message FileResult message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileResult.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.tags != null && message.tags.length)
                        for (let i = 0; i < message.tags.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.tags[i]);
                    if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                        for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
                    if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                        writer.uint32(/* id 4, wireType 1 =*/33).double(message.score);
                    if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int64(message.mtime);
                    if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
                        writer.uint32(/* id 6, wireType 0 =*/48).int64(message.sizeBytes);
                    return writer;
                };

                /**
                 * Encodes the specified FileResult message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileResult.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {tilbo.ipc.v1.IFileResult} message FileResult message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileResult.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FileResult message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.FileResult} FileResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileResult.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileResult(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                if (!(message.tags && message.tags.length))
                                    message.tags = [];
                                message.tags.push(reader.string());
                                break;
                            }
                        case 3: {
                                if (message.metadata === $util.emptyObject)
                                    message.metadata = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.metadata[key] = value;
                                break;
                            }
                        case 4: {
                                message.score = reader.double();
                                break;
                            }
                        case 5: {
                                message.mtime = reader.int64();
                                break;
                            }
                        case 6: {
                                message.sizeBytes = reader.int64();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FileResult message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.FileResult} FileResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileResult.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FileResult message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FileResult.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.tags != null && message.hasOwnProperty("tags")) {
                        if (!Array.isArray(message.tags))
                            return "tags: array expected";
                        for (let i = 0; i < message.tags.length; ++i)
                            if (!$util.isString(message.tags[i]))
                                return "tags: string[] expected";
                    }
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        if (!$util.isObject(message.metadata))
                            return "metadata: object expected";
                        let key = Object.keys(message.metadata);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.metadata[key[i]]))
                                return "metadata: string{k:string} expected";
                    }
                    if (message.score != null && message.hasOwnProperty("score"))
                        if (typeof message.score !== "number")
                            return "score: number expected";
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
                            return "mtime: integer|Long expected";
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
                            return "sizeBytes: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a FileResult message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.FileResult} FileResult
                 */
                FileResult.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.FileResult)
                        return object;
                    let message = new $root.tilbo.ipc.v1.FileResult();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.tags) {
                        if (!Array.isArray(object.tags))
                            throw TypeError(".tilbo.ipc.v1.FileResult.tags: array expected");
                        message.tags = [];
                        for (let i = 0; i < object.tags.length; ++i)
                            message.tags[i] = String(object.tags[i]);
                    }
                    if (object.metadata) {
                        if (typeof object.metadata !== "object")
                            throw TypeError(".tilbo.ipc.v1.FileResult.metadata: object expected");
                        message.metadata = {};
                        for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                            message.metadata[keys[i]] = String(object.metadata[keys[i]]);
                    }
                    if (object.score != null)
                        message.score = Number(object.score);
                    if (object.mtime != null)
                        if ($util.Long)
                            (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
                        else if (typeof object.mtime === "string")
                            message.mtime = parseInt(object.mtime, 10);
                        else if (typeof object.mtime === "number")
                            message.mtime = object.mtime;
                        else if (typeof object.mtime === "object")
                            message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
                    if (object.sizeBytes != null)
                        if ($util.Long)
                            (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
                        else if (typeof object.sizeBytes === "string")
                            message.sizeBytes = parseInt(object.sizeBytes, 10);
                        else if (typeof object.sizeBytes === "number")
                            message.sizeBytes = object.sizeBytes;
                        else if (typeof object.sizeBytes === "object")
                            message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
                    return message;
                };

                /**
                 * Creates a plain object from a FileResult message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {tilbo.ipc.v1.FileResult} message FileResult
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FileResult.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.tags = [];
                    if (options.objects || options.defaults)
                        object.metadata = {};
                    if (options.defaults) {
                        object.path = "";
                        object.score = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.mtime = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.sizeBytes = options.longs === String ? "0" : 0;
                    }
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.tags && message.tags.length) {
                        object.tags = [];
                        for (let j = 0; j < message.tags.length; ++j)
                            object.tags[j] = message.tags[j];
                    }
                    let keys2;
                    if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                        object.metadata = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.metadata[keys2[j]] = message.metadata[keys2[j]];
                    }
                    if (message.score != null && message.hasOwnProperty("score"))
                        object.score = options.json && !isFinite(message.score) ? String(message.score) : message.score;
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (typeof message.mtime === "number")
                            object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
                        else
                            object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (typeof message.sizeBytes === "number")
                            object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
                        else
                            object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
                    return object;
                };

                /**
                 * Converts this FileResult to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.FileResult
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FileResult.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FileResult
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.FileResult
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FileResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.FileResult";
                };

                return FileResult;
            })();

            v1.SearchResponse = (function() {

                /**
                 * Properties of a SearchResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface ISearchResponse
                 * @property {Array.<tilbo.ipc.v1.IFileResult>|null} [files] SearchResponse files
                 * @property {number|null} [total] SearchResponse total
                 */

                /**
                 * Constructs a new SearchResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a SearchResponse.
                 * @implements ISearchResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.ISearchResponse=} [properties] Properties to set
                 */
                function SearchResponse(properties) {
                    this.files = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * SearchResponse files.
                 * @member {Array.<tilbo.ipc.v1.IFileResult>} files
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @instance
                 */
                SearchResponse.prototype.files = $util.emptyArray;

                /**
                 * SearchResponse total.
                 * @member {number} total
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @instance
                 */
                SearchResponse.prototype.total = 0;

                /**
                 * Creates a new SearchResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.ISearchResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.SearchResponse} SearchResponse instance
                 */
                SearchResponse.create = function create(properties) {
                    return new SearchResponse(properties);
                };

                /**
                 * Encodes the specified SearchResponse message. Does not implicitly {@link tilbo.ipc.v1.SearchResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.ISearchResponse} message SearchResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SearchResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.files != null && message.files.length)
                        for (let i = 0; i < message.files.length; ++i)
                            $root.tilbo.ipc.v1.FileResult.encode(message.files[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.total);
                    return writer;
                };

                /**
                 * Encodes the specified SearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.SearchResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.ISearchResponse} message SearchResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                SearchResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a SearchResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.SearchResponse} SearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SearchResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.SearchResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.files && message.files.length))
                                    message.files = [];
                                message.files.push($root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32()));
                                break;
                            }
                        case 2: {
                                message.total = reader.uint32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a SearchResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.SearchResponse} SearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                SearchResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a SearchResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                SearchResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.files != null && message.hasOwnProperty("files")) {
                        if (!Array.isArray(message.files))
                            return "files: array expected";
                        for (let i = 0; i < message.files.length; ++i) {
                            let error = $root.tilbo.ipc.v1.FileResult.verify(message.files[i]);
                            if (error)
                                return "files." + error;
                        }
                    }
                    if (message.total != null && message.hasOwnProperty("total"))
                        if (!$util.isInteger(message.total))
                            return "total: integer expected";
                    return null;
                };

                /**
                 * Creates a SearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.SearchResponse} SearchResponse
                 */
                SearchResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.SearchResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.SearchResponse();
                    if (object.files) {
                        if (!Array.isArray(object.files))
                            throw TypeError(".tilbo.ipc.v1.SearchResponse.files: array expected");
                        message.files = [];
                        for (let i = 0; i < object.files.length; ++i) {
                            if (typeof object.files[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.SearchResponse.files: object expected");
                            message.files[i] = $root.tilbo.ipc.v1.FileResult.fromObject(object.files[i]);
                        }
                    }
                    if (object.total != null)
                        message.total = object.total >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a SearchResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.SearchResponse} message SearchResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                SearchResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.files = [];
                    if (options.defaults)
                        object.total = 0;
                    if (message.files && message.files.length) {
                        object.files = [];
                        for (let j = 0; j < message.files.length; ++j)
                            object.files[j] = $root.tilbo.ipc.v1.FileResult.toObject(message.files[j], options);
                    }
                    if (message.total != null && message.hasOwnProperty("total"))
                        object.total = message.total;
                    return object;
                };

                /**
                 * Converts this SearchResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                SearchResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for SearchResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.SearchResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                SearchResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.SearchResponse";
                };

                return SearchResponse;
            })();

            /**
             * TagOperation enum.
             * @name tilbo.ipc.v1.TagOperation
             * @enum {number}
             * @property {number} TAG_OPERATION_UNSPECIFIED=0 TAG_OPERATION_UNSPECIFIED value
             * @property {number} TAG_OPERATION_ADD=1 TAG_OPERATION_ADD value
             * @property {number} TAG_OPERATION_REMOVE=2 TAG_OPERATION_REMOVE value
             * @property {number} TAG_OPERATION_SET=3 TAG_OPERATION_SET value
             */
            v1.TagOperation = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "TAG_OPERATION_UNSPECIFIED"] = 0;
                values[valuesById[1] = "TAG_OPERATION_ADD"] = 1;
                values[valuesById[2] = "TAG_OPERATION_REMOVE"] = 2;
                values[valuesById[3] = "TAG_OPERATION_SET"] = 3;
                return values;
            })();

            v1.TagRequest = (function() {

                /**
                 * Properties of a TagRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface ITagRequest
                 * @property {Array.<string>|null} [paths] TagRequest paths
                 * @property {Array.<string>|null} [tags] TagRequest tags
                 * @property {tilbo.ipc.v1.TagOperation|null} [operation] TagRequest operation
                 */

                /**
                 * Constructs a new TagRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a TagRequest.
                 * @implements ITagRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.ITagRequest=} [properties] Properties to set
                 */
                function TagRequest(properties) {
                    this.paths = [];
                    this.tags = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * TagRequest paths.
                 * @member {Array.<string>} paths
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @instance
                 */
                TagRequest.prototype.paths = $util.emptyArray;

                /**
                 * TagRequest tags.
                 * @member {Array.<string>} tags
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @instance
                 */
                TagRequest.prototype.tags = $util.emptyArray;

                /**
                 * TagRequest operation.
                 * @member {tilbo.ipc.v1.TagOperation} operation
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @instance
                 */
                TagRequest.prototype.operation = 0;

                /**
                 * Creates a new TagRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {tilbo.ipc.v1.ITagRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.TagRequest} TagRequest instance
                 */
                TagRequest.create = function create(properties) {
                    return new TagRequest(properties);
                };

                /**
                 * Encodes the specified TagRequest message. Does not implicitly {@link tilbo.ipc.v1.TagRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {tilbo.ipc.v1.ITagRequest} message TagRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TagRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.paths != null && message.paths.length)
                        for (let i = 0; i < message.paths.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.paths[i]);
                    if (message.tags != null && message.tags.length)
                        for (let i = 0; i < message.tags.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.tags[i]);
                    if (message.operation != null && Object.hasOwnProperty.call(message, "operation"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.operation);
                    return writer;
                };

                /**
                 * Encodes the specified TagRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TagRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {tilbo.ipc.v1.ITagRequest} message TagRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a TagRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.TagRequest} TagRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TagRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TagRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.paths && message.paths.length))
                                    message.paths = [];
                                message.paths.push(reader.string());
                                break;
                            }
                        case 2: {
                                if (!(message.tags && message.tags.length))
                                    message.tags = [];
                                message.tags.push(reader.string());
                                break;
                            }
                        case 3: {
                                message.operation = reader.int32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a TagRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.TagRequest} TagRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TagRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a TagRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                TagRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.paths != null && message.hasOwnProperty("paths")) {
                        if (!Array.isArray(message.paths))
                            return "paths: array expected";
                        for (let i = 0; i < message.paths.length; ++i)
                            if (!$util.isString(message.paths[i]))
                                return "paths: string[] expected";
                    }
                    if (message.tags != null && message.hasOwnProperty("tags")) {
                        if (!Array.isArray(message.tags))
                            return "tags: array expected";
                        for (let i = 0; i < message.tags.length; ++i)
                            if (!$util.isString(message.tags[i]))
                                return "tags: string[] expected";
                    }
                    if (message.operation != null && message.hasOwnProperty("operation"))
                        switch (message.operation) {
                        default:
                            return "operation: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a TagRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.TagRequest} TagRequest
                 */
                TagRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.TagRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.TagRequest();
                    if (object.paths) {
                        if (!Array.isArray(object.paths))
                            throw TypeError(".tilbo.ipc.v1.TagRequest.paths: array expected");
                        message.paths = [];
                        for (let i = 0; i < object.paths.length; ++i)
                            message.paths[i] = String(object.paths[i]);
                    }
                    if (object.tags) {
                        if (!Array.isArray(object.tags))
                            throw TypeError(".tilbo.ipc.v1.TagRequest.tags: array expected");
                        message.tags = [];
                        for (let i = 0; i < object.tags.length; ++i)
                            message.tags[i] = String(object.tags[i]);
                    }
                    switch (object.operation) {
                    default:
                        if (typeof object.operation === "number") {
                            message.operation = object.operation;
                            break;
                        }
                        break;
                    case "TAG_OPERATION_UNSPECIFIED":
                    case 0:
                        message.operation = 0;
                        break;
                    case "TAG_OPERATION_ADD":
                    case 1:
                        message.operation = 1;
                        break;
                    case "TAG_OPERATION_REMOVE":
                    case 2:
                        message.operation = 2;
                        break;
                    case "TAG_OPERATION_SET":
                    case 3:
                        message.operation = 3;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a TagRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {tilbo.ipc.v1.TagRequest} message TagRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                TagRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.paths = [];
                        object.tags = [];
                    }
                    if (options.defaults)
                        object.operation = options.enums === String ? "TAG_OPERATION_UNSPECIFIED" : 0;
                    if (message.paths && message.paths.length) {
                        object.paths = [];
                        for (let j = 0; j < message.paths.length; ++j)
                            object.paths[j] = message.paths[j];
                    }
                    if (message.tags && message.tags.length) {
                        object.tags = [];
                        for (let j = 0; j < message.tags.length; ++j)
                            object.tags[j] = message.tags[j];
                    }
                    if (message.operation != null && message.hasOwnProperty("operation"))
                        object.operation = options.enums === String ? $root.tilbo.ipc.v1.TagOperation[message.operation] === undefined ? message.operation : $root.tilbo.ipc.v1.TagOperation[message.operation] : message.operation;
                    return object;
                };

                /**
                 * Converts this TagRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                TagRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for TagRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.TagRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                TagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.TagRequest";
                };

                return TagRequest;
            })();

            v1.TagResponse = (function() {

                /**
                 * Properties of a TagResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface ITagResponse
                 * @property {Array.<string>|null} [pathsOk] TagResponse pathsOk
                 * @property {Array.<string>|null} [pathsError] TagResponse pathsError
                 * @property {Object.<string,string>|null} [errors] TagResponse errors
                 */

                /**
                 * Constructs a new TagResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a TagResponse.
                 * @implements ITagResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.ITagResponse=} [properties] Properties to set
                 */
                function TagResponse(properties) {
                    this.pathsOk = [];
                    this.pathsError = [];
                    this.errors = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * TagResponse pathsOk.
                 * @member {Array.<string>} pathsOk
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @instance
                 */
                TagResponse.prototype.pathsOk = $util.emptyArray;

                /**
                 * TagResponse pathsError.
                 * @member {Array.<string>} pathsError
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @instance
                 */
                TagResponse.prototype.pathsError = $util.emptyArray;

                /**
                 * TagResponse errors.
                 * @member {Object.<string,string>} errors
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @instance
                 */
                TagResponse.prototype.errors = $util.emptyObject;

                /**
                 * Creates a new TagResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {tilbo.ipc.v1.ITagResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.TagResponse} TagResponse instance
                 */
                TagResponse.create = function create(properties) {
                    return new TagResponse(properties);
                };

                /**
                 * Encodes the specified TagResponse message. Does not implicitly {@link tilbo.ipc.v1.TagResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {tilbo.ipc.v1.ITagResponse} message TagResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TagResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.pathsOk != null && message.pathsOk.length)
                        for (let i = 0; i < message.pathsOk.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.pathsOk[i]);
                    if (message.pathsError != null && message.pathsError.length)
                        for (let i = 0; i < message.pathsError.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.pathsError[i]);
                    if (message.errors != null && Object.hasOwnProperty.call(message, "errors"))
                        for (let keys = Object.keys(message.errors), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.errors[keys[i]]).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified TagResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.TagResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {tilbo.ipc.v1.ITagResponse} message TagResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                TagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a TagResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.TagResponse} TagResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TagResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.TagResponse(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.pathsOk && message.pathsOk.length))
                                    message.pathsOk = [];
                                message.pathsOk.push(reader.string());
                                break;
                            }
                        case 2: {
                                if (!(message.pathsError && message.pathsError.length))
                                    message.pathsError = [];
                                message.pathsError.push(reader.string());
                                break;
                            }
                        case 3: {
                                if (message.errors === $util.emptyObject)
                                    message.errors = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.errors[key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a TagResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.TagResponse} TagResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                TagResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a TagResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                TagResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.pathsOk != null && message.hasOwnProperty("pathsOk")) {
                        if (!Array.isArray(message.pathsOk))
                            return "pathsOk: array expected";
                        for (let i = 0; i < message.pathsOk.length; ++i)
                            if (!$util.isString(message.pathsOk[i]))
                                return "pathsOk: string[] expected";
                    }
                    if (message.pathsError != null && message.hasOwnProperty("pathsError")) {
                        if (!Array.isArray(message.pathsError))
                            return "pathsError: array expected";
                        for (let i = 0; i < message.pathsError.length; ++i)
                            if (!$util.isString(message.pathsError[i]))
                                return "pathsError: string[] expected";
                    }
                    if (message.errors != null && message.hasOwnProperty("errors")) {
                        if (!$util.isObject(message.errors))
                            return "errors: object expected";
                        let key = Object.keys(message.errors);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.errors[key[i]]))
                                return "errors: string{k:string} expected";
                    }
                    return null;
                };

                /**
                 * Creates a TagResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.TagResponse} TagResponse
                 */
                TagResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.TagResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.TagResponse();
                    if (object.pathsOk) {
                        if (!Array.isArray(object.pathsOk))
                            throw TypeError(".tilbo.ipc.v1.TagResponse.pathsOk: array expected");
                        message.pathsOk = [];
                        for (let i = 0; i < object.pathsOk.length; ++i)
                            message.pathsOk[i] = String(object.pathsOk[i]);
                    }
                    if (object.pathsError) {
                        if (!Array.isArray(object.pathsError))
                            throw TypeError(".tilbo.ipc.v1.TagResponse.pathsError: array expected");
                        message.pathsError = [];
                        for (let i = 0; i < object.pathsError.length; ++i)
                            message.pathsError[i] = String(object.pathsError[i]);
                    }
                    if (object.errors) {
                        if (typeof object.errors !== "object")
                            throw TypeError(".tilbo.ipc.v1.TagResponse.errors: object expected");
                        message.errors = {};
                        for (let keys = Object.keys(object.errors), i = 0; i < keys.length; ++i)
                            message.errors[keys[i]] = String(object.errors[keys[i]]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a TagResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {tilbo.ipc.v1.TagResponse} message TagResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                TagResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.pathsOk = [];
                        object.pathsError = [];
                    }
                    if (options.objects || options.defaults)
                        object.errors = {};
                    if (message.pathsOk && message.pathsOk.length) {
                        object.pathsOk = [];
                        for (let j = 0; j < message.pathsOk.length; ++j)
                            object.pathsOk[j] = message.pathsOk[j];
                    }
                    if (message.pathsError && message.pathsError.length) {
                        object.pathsError = [];
                        for (let j = 0; j < message.pathsError.length; ++j)
                            object.pathsError[j] = message.pathsError[j];
                    }
                    let keys2;
                    if (message.errors && (keys2 = Object.keys(message.errors)).length) {
                        object.errors = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.errors[keys2[j]] = message.errors[keys2[j]];
                    }
                    return object;
                };

                /**
                 * Converts this TagResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                TagResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for TagResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.TagResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                TagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.TagResponse";
                };

                return TagResponse;
            })();

            v1.MetadataRequest = (function() {

                /**
                 * Properties of a MetadataRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IMetadataRequest
                 * @property {string|null} [path] MetadataRequest path
                 */

                /**
                 * Constructs a new MetadataRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a MetadataRequest.
                 * @implements IMetadataRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IMetadataRequest=} [properties] Properties to set
                 */
                function MetadataRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MetadataRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @instance
                 */
                MetadataRequest.prototype.path = "";

                /**
                 * Creates a new MetadataRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.MetadataRequest} MetadataRequest instance
                 */
                MetadataRequest.create = function create(properties) {
                    return new MetadataRequest(properties);
                };

                /**
                 * Encodes the specified MetadataRequest message. Does not implicitly {@link tilbo.ipc.v1.MetadataRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataRequest} message MetadataRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    return writer;
                };

                /**
                 * Encodes the specified MetadataRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataRequest} message MetadataRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MetadataRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.MetadataRequest} MetadataRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MetadataRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.MetadataRequest} MetadataRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MetadataRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MetadataRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    return null;
                };

                /**
                 * Creates a MetadataRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.MetadataRequest} MetadataRequest
                 */
                MetadataRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.MetadataRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.MetadataRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    return message;
                };

                /**
                 * Creates a plain object from a MetadataRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {tilbo.ipc.v1.MetadataRequest} message MetadataRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MetadataRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    return object;
                };

                /**
                 * Converts this MetadataRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MetadataRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MetadataRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.MetadataRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.MetadataRequest";
                };

                return MetadataRequest;
            })();

            v1.MetadataResponse = (function() {

                /**
                 * Properties of a MetadataResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IMetadataResponse
                 * @property {string|null} [path] MetadataResponse path
                 * @property {Object.<string,string>|null} [metadata] MetadataResponse metadata
                 * @property {Object.<string,string>|null} [sources] MetadataResponse sources
                 */

                /**
                 * Constructs a new MetadataResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a MetadataResponse.
                 * @implements IMetadataResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IMetadataResponse=} [properties] Properties to set
                 */
                function MetadataResponse(properties) {
                    this.metadata = {};
                    this.sources = {};
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MetadataResponse path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @instance
                 */
                MetadataResponse.prototype.path = "";

                /**
                 * MetadataResponse metadata.
                 * @member {Object.<string,string>} metadata
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @instance
                 */
                MetadataResponse.prototype.metadata = $util.emptyObject;

                /**
                 * MetadataResponse sources.
                 * @member {Object.<string,string>} sources
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @instance
                 */
                MetadataResponse.prototype.sources = $util.emptyObject;

                /**
                 * Creates a new MetadataResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.MetadataResponse} MetadataResponse instance
                 */
                MetadataResponse.create = function create(properties) {
                    return new MetadataResponse(properties);
                };

                /**
                 * Encodes the specified MetadataResponse message. Does not implicitly {@link tilbo.ipc.v1.MetadataResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataResponse} message MetadataResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                        for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
                    if (message.sources != null && Object.hasOwnProperty.call(message, "sources"))
                        for (let keys = Object.keys(message.sources), i = 0; i < keys.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.sources[keys[i]]).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified MetadataResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataResponse} message MetadataResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MetadataResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.MetadataResponse} MetadataResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataResponse(), key, value;
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                if (message.metadata === $util.emptyObject)
                                    message.metadata = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.metadata[key] = value;
                                break;
                            }
                        case 3: {
                                if (message.sources === $util.emptyObject)
                                    message.sources = {};
                                let end2 = reader.uint32() + reader.pos;
                                key = "";
                                value = "";
                                while (reader.pos < end2) {
                                    let tag2 = reader.uint32();
                                    switch (tag2 >>> 3) {
                                    case 1:
                                        key = reader.string();
                                        break;
                                    case 2:
                                        value = reader.string();
                                        break;
                                    default:
                                        reader.skipType(tag2 & 7);
                                        break;
                                    }
                                }
                                message.sources[key] = value;
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MetadataResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.MetadataResponse} MetadataResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MetadataResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MetadataResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.metadata != null && message.hasOwnProperty("metadata")) {
                        if (!$util.isObject(message.metadata))
                            return "metadata: object expected";
                        let key = Object.keys(message.metadata);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.metadata[key[i]]))
                                return "metadata: string{k:string} expected";
                    }
                    if (message.sources != null && message.hasOwnProperty("sources")) {
                        if (!$util.isObject(message.sources))
                            return "sources: object expected";
                        let key = Object.keys(message.sources);
                        for (let i = 0; i < key.length; ++i)
                            if (!$util.isString(message.sources[key[i]]))
                                return "sources: string{k:string} expected";
                    }
                    return null;
                };

                /**
                 * Creates a MetadataResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.MetadataResponse} MetadataResponse
                 */
                MetadataResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.MetadataResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.MetadataResponse();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.metadata) {
                        if (typeof object.metadata !== "object")
                            throw TypeError(".tilbo.ipc.v1.MetadataResponse.metadata: object expected");
                        message.metadata = {};
                        for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                            message.metadata[keys[i]] = String(object.metadata[keys[i]]);
                    }
                    if (object.sources) {
                        if (typeof object.sources !== "object")
                            throw TypeError(".tilbo.ipc.v1.MetadataResponse.sources: object expected");
                        message.sources = {};
                        for (let keys = Object.keys(object.sources), i = 0; i < keys.length; ++i)
                            message.sources[keys[i]] = String(object.sources[keys[i]]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a MetadataResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {tilbo.ipc.v1.MetadataResponse} message MetadataResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MetadataResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.objects || options.defaults) {
                        object.metadata = {};
                        object.sources = {};
                    }
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    let keys2;
                    if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                        object.metadata = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.metadata[keys2[j]] = message.metadata[keys2[j]];
                    }
                    if (message.sources && (keys2 = Object.keys(message.sources)).length) {
                        object.sources = {};
                        for (let j = 0; j < keys2.length; ++j)
                            object.sources[keys2[j]] = message.sources[keys2[j]];
                    }
                    return object;
                };

                /**
                 * Converts this MetadataResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MetadataResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MetadataResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.MetadataResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.MetadataResponse";
                };

                return MetadataResponse;
            })();

            v1.MetadataSetRequest = (function() {

                /**
                 * Properties of a MetadataSetRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IMetadataSetRequest
                 * @property {string|null} [path] MetadataSetRequest path
                 * @property {string|null} [key] MetadataSetRequest key
                 * @property {string|null} [value] MetadataSetRequest value
                 */

                /**
                 * Constructs a new MetadataSetRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a MetadataSetRequest.
                 * @implements IMetadataSetRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IMetadataSetRequest=} [properties] Properties to set
                 */
                function MetadataSetRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * MetadataSetRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @instance
                 */
                MetadataSetRequest.prototype.path = "";

                /**
                 * MetadataSetRequest key.
                 * @member {string} key
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @instance
                 */
                MetadataSetRequest.prototype.key = "";

                /**
                 * MetadataSetRequest value.
                 * @member {string} value
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @instance
                 */
                MetadataSetRequest.prototype.value = "";

                /**
                 * Creates a new MetadataSetRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataSetRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.MetadataSetRequest} MetadataSetRequest instance
                 */
                MetadataSetRequest.create = function create(properties) {
                    return new MetadataSetRequest(properties);
                };

                /**
                 * Encodes the specified MetadataSetRequest message. Does not implicitly {@link tilbo.ipc.v1.MetadataSetRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataSetRequest} message MetadataSetRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataSetRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.key);
                    if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.value);
                    return writer;
                };

                /**
                 * Encodes the specified MetadataSetRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.MetadataSetRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {tilbo.ipc.v1.IMetadataSetRequest} message MetadataSetRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                MetadataSetRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a MetadataSetRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.MetadataSetRequest} MetadataSetRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataSetRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.MetadataSetRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                message.key = reader.string();
                                break;
                            }
                        case 3: {
                                message.value = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a MetadataSetRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.MetadataSetRequest} MetadataSetRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                MetadataSetRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a MetadataSetRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                MetadataSetRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.key != null && message.hasOwnProperty("key"))
                        if (!$util.isString(message.key))
                            return "key: string expected";
                    if (message.value != null && message.hasOwnProperty("value"))
                        if (!$util.isString(message.value))
                            return "value: string expected";
                    return null;
                };

                /**
                 * Creates a MetadataSetRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.MetadataSetRequest} MetadataSetRequest
                 */
                MetadataSetRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.MetadataSetRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.MetadataSetRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.key != null)
                        message.key = String(object.key);
                    if (object.value != null)
                        message.value = String(object.value);
                    return message;
                };

                /**
                 * Creates a plain object from a MetadataSetRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {tilbo.ipc.v1.MetadataSetRequest} message MetadataSetRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                MetadataSetRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.path = "";
                        object.key = "";
                        object.value = "";
                    }
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.key != null && message.hasOwnProperty("key"))
                        object.key = message.key;
                    if (message.value != null && message.hasOwnProperty("value"))
                        object.value = message.value;
                    return object;
                };

                /**
                 * Converts this MetadataSetRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                MetadataSetRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for MetadataSetRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.MetadataSetRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                MetadataSetRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.MetadataSetRequest";
                };

                return MetadataSetRequest;
            })();

            v1.RelatedRequest = (function() {

                /**
                 * Properties of a RelatedRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IRelatedRequest
                 * @property {string|null} [seedPath] RelatedRequest seedPath
                 * @property {number|null} [limit] RelatedRequest limit
                 * @property {number|null} [maxHops] RelatedRequest maxHops
                 * @property {number|null} [hopWeight] RelatedRequest hopWeight
                 * @property {number|null} [vecWeight] RelatedRequest vecWeight
                 */

                /**
                 * Constructs a new RelatedRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a RelatedRequest.
                 * @implements IRelatedRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IRelatedRequest=} [properties] Properties to set
                 */
                function RelatedRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * RelatedRequest seedPath.
                 * @member {string} seedPath
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 */
                RelatedRequest.prototype.seedPath = "";

                /**
                 * RelatedRequest limit.
                 * @member {number} limit
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 */
                RelatedRequest.prototype.limit = 0;

                /**
                 * RelatedRequest maxHops.
                 * @member {number} maxHops
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 */
                RelatedRequest.prototype.maxHops = 0;

                /**
                 * RelatedRequest hopWeight.
                 * @member {number} hopWeight
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 */
                RelatedRequest.prototype.hopWeight = 0;

                /**
                 * RelatedRequest vecWeight.
                 * @member {number} vecWeight
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 */
                RelatedRequest.prototype.vecWeight = 0;

                /**
                 * Creates a new RelatedRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.RelatedRequest} RelatedRequest instance
                 */
                RelatedRequest.create = function create(properties) {
                    return new RelatedRequest(properties);
                };

                /**
                 * Encodes the specified RelatedRequest message. Does not implicitly {@link tilbo.ipc.v1.RelatedRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedRequest} message RelatedRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RelatedRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.seedPath != null && Object.hasOwnProperty.call(message, "seedPath"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.seedPath);
                    if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.limit);
                    if (message.maxHops != null && Object.hasOwnProperty.call(message, "maxHops"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.maxHops);
                    if (message.hopWeight != null && Object.hasOwnProperty.call(message, "hopWeight"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.hopWeight);
                    if (message.vecWeight != null && Object.hasOwnProperty.call(message, "vecWeight"))
                        writer.uint32(/* id 5, wireType 5 =*/45).float(message.vecWeight);
                    return writer;
                };

                /**
                 * Encodes the specified RelatedRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RelatedRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedRequest} message RelatedRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RelatedRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a RelatedRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.RelatedRequest} RelatedRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RelatedRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RelatedRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.seedPath = reader.string();
                                break;
                            }
                        case 2: {
                                message.limit = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.maxHops = reader.uint32();
                                break;
                            }
                        case 4: {
                                message.hopWeight = reader.float();
                                break;
                            }
                        case 5: {
                                message.vecWeight = reader.float();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a RelatedRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.RelatedRequest} RelatedRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RelatedRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a RelatedRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                RelatedRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.seedPath != null && message.hasOwnProperty("seedPath"))
                        if (!$util.isString(message.seedPath))
                            return "seedPath: string expected";
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        if (!$util.isInteger(message.limit))
                            return "limit: integer expected";
                    if (message.maxHops != null && message.hasOwnProperty("maxHops"))
                        if (!$util.isInteger(message.maxHops))
                            return "maxHops: integer expected";
                    if (message.hopWeight != null && message.hasOwnProperty("hopWeight"))
                        if (typeof message.hopWeight !== "number")
                            return "hopWeight: number expected";
                    if (message.vecWeight != null && message.hasOwnProperty("vecWeight"))
                        if (typeof message.vecWeight !== "number")
                            return "vecWeight: number expected";
                    return null;
                };

                /**
                 * Creates a RelatedRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.RelatedRequest} RelatedRequest
                 */
                RelatedRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.RelatedRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.RelatedRequest();
                    if (object.seedPath != null)
                        message.seedPath = String(object.seedPath);
                    if (object.limit != null)
                        message.limit = object.limit >>> 0;
                    if (object.maxHops != null)
                        message.maxHops = object.maxHops >>> 0;
                    if (object.hopWeight != null)
                        message.hopWeight = Number(object.hopWeight);
                    if (object.vecWeight != null)
                        message.vecWeight = Number(object.vecWeight);
                    return message;
                };

                /**
                 * Creates a plain object from a RelatedRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {tilbo.ipc.v1.RelatedRequest} message RelatedRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RelatedRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.seedPath = "";
                        object.limit = 0;
                        object.maxHops = 0;
                        object.hopWeight = 0;
                        object.vecWeight = 0;
                    }
                    if (message.seedPath != null && message.hasOwnProperty("seedPath"))
                        object.seedPath = message.seedPath;
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        object.limit = message.limit;
                    if (message.maxHops != null && message.hasOwnProperty("maxHops"))
                        object.maxHops = message.maxHops;
                    if (message.hopWeight != null && message.hasOwnProperty("hopWeight"))
                        object.hopWeight = options.json && !isFinite(message.hopWeight) ? String(message.hopWeight) : message.hopWeight;
                    if (message.vecWeight != null && message.hasOwnProperty("vecWeight"))
                        object.vecWeight = options.json && !isFinite(message.vecWeight) ? String(message.vecWeight) : message.vecWeight;
                    return object;
                };

                /**
                 * Converts this RelatedRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RelatedRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for RelatedRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.RelatedRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                RelatedRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.RelatedRequest";
                };

                return RelatedRequest;
            })();

            v1.ScoredFile = (function() {

                /**
                 * Properties of a ScoredFile.
                 * @memberof tilbo.ipc.v1
                 * @interface IScoredFile
                 * @property {tilbo.ipc.v1.IFileResult|null} [file] ScoredFile file
                 * @property {number|null} [score] ScoredFile score
                 * @property {number|null} [hopDistance] ScoredFile hopDistance
                 * @property {number|null} [cosineSim] ScoredFile cosineSim
                 */

                /**
                 * Constructs a new ScoredFile.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ScoredFile.
                 * @implements IScoredFile
                 * @constructor
                 * @param {tilbo.ipc.v1.IScoredFile=} [properties] Properties to set
                 */
                function ScoredFile(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ScoredFile file.
                 * @member {tilbo.ipc.v1.IFileResult|null|undefined} file
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @instance
                 */
                ScoredFile.prototype.file = null;

                /**
                 * ScoredFile score.
                 * @member {number} score
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @instance
                 */
                ScoredFile.prototype.score = 0;

                /**
                 * ScoredFile hopDistance.
                 * @member {number} hopDistance
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @instance
                 */
                ScoredFile.prototype.hopDistance = 0;

                /**
                 * ScoredFile cosineSim.
                 * @member {number} cosineSim
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @instance
                 */
                ScoredFile.prototype.cosineSim = 0;

                /**
                 * Creates a new ScoredFile instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {tilbo.ipc.v1.IScoredFile=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ScoredFile} ScoredFile instance
                 */
                ScoredFile.create = function create(properties) {
                    return new ScoredFile(properties);
                };

                /**
                 * Encodes the specified ScoredFile message. Does not implicitly {@link tilbo.ipc.v1.ScoredFile.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {tilbo.ipc.v1.IScoredFile} message ScoredFile message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ScoredFile.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.file != null && Object.hasOwnProperty.call(message, "file"))
                        $root.tilbo.ipc.v1.FileResult.encode(message.file, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                        writer.uint32(/* id 2, wireType 1 =*/17).double(message.score);
                    if (message.hopDistance != null && Object.hasOwnProperty.call(message, "hopDistance"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.hopDistance);
                    if (message.cosineSim != null && Object.hasOwnProperty.call(message, "cosineSim"))
                        writer.uint32(/* id 4, wireType 1 =*/33).double(message.cosineSim);
                    return writer;
                };

                /**
                 * Encodes the specified ScoredFile message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ScoredFile.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {tilbo.ipc.v1.IScoredFile} message ScoredFile message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ScoredFile.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ScoredFile message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ScoredFile} ScoredFile
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ScoredFile.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ScoredFile();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.file = $root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32());
                                break;
                            }
                        case 2: {
                                message.score = reader.double();
                                break;
                            }
                        case 3: {
                                message.hopDistance = reader.uint32();
                                break;
                            }
                        case 4: {
                                message.cosineSim = reader.double();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ScoredFile message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ScoredFile} ScoredFile
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ScoredFile.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ScoredFile message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ScoredFile.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.file != null && message.hasOwnProperty("file")) {
                        let error = $root.tilbo.ipc.v1.FileResult.verify(message.file);
                        if (error)
                            return "file." + error;
                    }
                    if (message.score != null && message.hasOwnProperty("score"))
                        if (typeof message.score !== "number")
                            return "score: number expected";
                    if (message.hopDistance != null && message.hasOwnProperty("hopDistance"))
                        if (!$util.isInteger(message.hopDistance))
                            return "hopDistance: integer expected";
                    if (message.cosineSim != null && message.hasOwnProperty("cosineSim"))
                        if (typeof message.cosineSim !== "number")
                            return "cosineSim: number expected";
                    return null;
                };

                /**
                 * Creates a ScoredFile message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ScoredFile} ScoredFile
                 */
                ScoredFile.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ScoredFile)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ScoredFile();
                    if (object.file != null) {
                        if (typeof object.file !== "object")
                            throw TypeError(".tilbo.ipc.v1.ScoredFile.file: object expected");
                        message.file = $root.tilbo.ipc.v1.FileResult.fromObject(object.file);
                    }
                    if (object.score != null)
                        message.score = Number(object.score);
                    if (object.hopDistance != null)
                        message.hopDistance = object.hopDistance >>> 0;
                    if (object.cosineSim != null)
                        message.cosineSim = Number(object.cosineSim);
                    return message;
                };

                /**
                 * Creates a plain object from a ScoredFile message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {tilbo.ipc.v1.ScoredFile} message ScoredFile
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ScoredFile.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.file = null;
                        object.score = 0;
                        object.hopDistance = 0;
                        object.cosineSim = 0;
                    }
                    if (message.file != null && message.hasOwnProperty("file"))
                        object.file = $root.tilbo.ipc.v1.FileResult.toObject(message.file, options);
                    if (message.score != null && message.hasOwnProperty("score"))
                        object.score = options.json && !isFinite(message.score) ? String(message.score) : message.score;
                    if (message.hopDistance != null && message.hasOwnProperty("hopDistance"))
                        object.hopDistance = message.hopDistance;
                    if (message.cosineSim != null && message.hasOwnProperty("cosineSim"))
                        object.cosineSim = options.json && !isFinite(message.cosineSim) ? String(message.cosineSim) : message.cosineSim;
                    return object;
                };

                /**
                 * Converts this ScoredFile to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ScoredFile.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ScoredFile
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ScoredFile
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ScoredFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ScoredFile";
                };

                return ScoredFile;
            })();

            v1.RelatedResponse = (function() {

                /**
                 * Properties of a RelatedResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IRelatedResponse
                 * @property {Array.<tilbo.ipc.v1.IScoredFile>|null} [files] RelatedResponse files
                 */

                /**
                 * Constructs a new RelatedResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a RelatedResponse.
                 * @implements IRelatedResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IRelatedResponse=} [properties] Properties to set
                 */
                function RelatedResponse(properties) {
                    this.files = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * RelatedResponse files.
                 * @member {Array.<tilbo.ipc.v1.IScoredFile>} files
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @instance
                 */
                RelatedResponse.prototype.files = $util.emptyArray;

                /**
                 * Creates a new RelatedResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.RelatedResponse} RelatedResponse instance
                 */
                RelatedResponse.create = function create(properties) {
                    return new RelatedResponse(properties);
                };

                /**
                 * Encodes the specified RelatedResponse message. Does not implicitly {@link tilbo.ipc.v1.RelatedResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedResponse} message RelatedResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RelatedResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.files != null && message.files.length)
                        for (let i = 0; i < message.files.length; ++i)
                            $root.tilbo.ipc.v1.ScoredFile.encode(message.files[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified RelatedResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RelatedResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRelatedResponse} message RelatedResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RelatedResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a RelatedResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.RelatedResponse} RelatedResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RelatedResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RelatedResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.files && message.files.length))
                                    message.files = [];
                                message.files.push($root.tilbo.ipc.v1.ScoredFile.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a RelatedResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.RelatedResponse} RelatedResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RelatedResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a RelatedResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                RelatedResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.files != null && message.hasOwnProperty("files")) {
                        if (!Array.isArray(message.files))
                            return "files: array expected";
                        for (let i = 0; i < message.files.length; ++i) {
                            let error = $root.tilbo.ipc.v1.ScoredFile.verify(message.files[i]);
                            if (error)
                                return "files." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a RelatedResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.RelatedResponse} RelatedResponse
                 */
                RelatedResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.RelatedResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.RelatedResponse();
                    if (object.files) {
                        if (!Array.isArray(object.files))
                            throw TypeError(".tilbo.ipc.v1.RelatedResponse.files: array expected");
                        message.files = [];
                        for (let i = 0; i < object.files.length; ++i) {
                            if (typeof object.files[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.RelatedResponse.files: object expected");
                            message.files[i] = $root.tilbo.ipc.v1.ScoredFile.fromObject(object.files[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a RelatedResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {tilbo.ipc.v1.RelatedResponse} message RelatedResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RelatedResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.files = [];
                    if (message.files && message.files.length) {
                        object.files = [];
                        for (let j = 0; j < message.files.length; ++j)
                            object.files[j] = $root.tilbo.ipc.v1.ScoredFile.toObject(message.files[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this RelatedResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RelatedResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for RelatedResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.RelatedResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                RelatedResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.RelatedResponse";
                };

                return RelatedResponse;
            })();

            /**
             * DaemonState enum.
             * @name tilbo.ipc.v1.DaemonState
             * @enum {number}
             * @property {number} DAEMON_STATE_UNSPECIFIED=0 DAEMON_STATE_UNSPECIFIED value
             * @property {number} DAEMON_STATE_IDLE=1 DAEMON_STATE_IDLE value
             * @property {number} DAEMON_STATE_SCANNING=2 DAEMON_STATE_SCANNING value
             * @property {number} DAEMON_STATE_READY=3 DAEMON_STATE_READY value
             * @property {number} DAEMON_STATE_DEGRADED=4 DAEMON_STATE_DEGRADED value
             */
            v1.DaemonState = (function() {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "DAEMON_STATE_UNSPECIFIED"] = 0;
                values[valuesById[1] = "DAEMON_STATE_IDLE"] = 1;
                values[valuesById[2] = "DAEMON_STATE_SCANNING"] = 2;
                values[valuesById[3] = "DAEMON_STATE_READY"] = 3;
                values[valuesById[4] = "DAEMON_STATE_DEGRADED"] = 4;
                return values;
            })();

            v1.StatusRequest = (function() {

                /**
                 * Properties of a StatusRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IStatusRequest
                 */

                /**
                 * Constructs a new StatusRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a StatusRequest.
                 * @implements IStatusRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IStatusRequest=} [properties] Properties to set
                 */
                function StatusRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new StatusRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatusRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.StatusRequest} StatusRequest instance
                 */
                StatusRequest.create = function create(properties) {
                    return new StatusRequest(properties);
                };

                /**
                 * Encodes the specified StatusRequest message. Does not implicitly {@link tilbo.ipc.v1.StatusRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatusRequest} message StatusRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatusRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified StatusRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatusRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatusRequest} message StatusRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatusRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a StatusRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.StatusRequest} StatusRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatusRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatusRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a StatusRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.StatusRequest} StatusRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatusRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a StatusRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                StatusRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a StatusRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.StatusRequest} StatusRequest
                 */
                StatusRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.StatusRequest)
                        return object;
                    return new $root.tilbo.ipc.v1.StatusRequest();
                };

                /**
                 * Creates a plain object from a StatusRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {tilbo.ipc.v1.StatusRequest} message StatusRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StatusRequest.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this StatusRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StatusRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for StatusRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.StatusRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                StatusRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.StatusRequest";
                };

                return StatusRequest;
            })();

            v1.StatusResponse = (function() {

                /**
                 * Properties of a StatusResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IStatusResponse
                 * @property {tilbo.ipc.v1.DaemonState|null} [state] StatusResponse state
                 * @property {number|Long|null} [filesIndexed] StatusResponse filesIndexed
                 * @property {number|Long|null} [tagsTotal] StatusResponse tagsTotal
                 * @property {number|null} [indexSizeMb] StatusResponse indexSizeMb
                 * @property {Array.<string>|null} [warnings] StatusResponse warnings
                 * @property {number|Long|null} [uptimeSeconds] StatusResponse uptimeSeconds
                 */

                /**
                 * Constructs a new StatusResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a StatusResponse.
                 * @implements IStatusResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IStatusResponse=} [properties] Properties to set
                 */
                function StatusResponse(properties) {
                    this.warnings = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * StatusResponse state.
                 * @member {tilbo.ipc.v1.DaemonState} state
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.state = 0;

                /**
                 * StatusResponse filesIndexed.
                 * @member {number|Long} filesIndexed
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.filesIndexed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * StatusResponse tagsTotal.
                 * @member {number|Long} tagsTotal
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.tagsTotal = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * StatusResponse indexSizeMb.
                 * @member {number} indexSizeMb
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.indexSizeMb = 0;

                /**
                 * StatusResponse warnings.
                 * @member {Array.<string>} warnings
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.warnings = $util.emptyArray;

                /**
                 * StatusResponse uptimeSeconds.
                 * @member {number|Long} uptimeSeconds
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 */
                StatusResponse.prototype.uptimeSeconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * Creates a new StatusResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatusResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.StatusResponse} StatusResponse instance
                 */
                StatusResponse.create = function create(properties) {
                    return new StatusResponse(properties);
                };

                /**
                 * Encodes the specified StatusResponse message. Does not implicitly {@link tilbo.ipc.v1.StatusResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatusResponse} message StatusResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatusResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.state);
                    if (message.filesIndexed != null && Object.hasOwnProperty.call(message, "filesIndexed"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.filesIndexed);
                    if (message.tagsTotal != null && Object.hasOwnProperty.call(message, "tagsTotal"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.tagsTotal);
                    if (message.indexSizeMb != null && Object.hasOwnProperty.call(message, "indexSizeMb"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.indexSizeMb);
                    if (message.warnings != null && message.warnings.length)
                        for (let i = 0; i < message.warnings.length; ++i)
                            writer.uint32(/* id 5, wireType 2 =*/42).string(message.warnings[i]);
                    if (message.uptimeSeconds != null && Object.hasOwnProperty.call(message, "uptimeSeconds"))
                        writer.uint32(/* id 6, wireType 0 =*/48).int64(message.uptimeSeconds);
                    return writer;
                };

                /**
                 * Encodes the specified StatusResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatusResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatusResponse} message StatusResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatusResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a StatusResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.StatusResponse} StatusResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatusResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatusResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.state = reader.int32();
                                break;
                            }
                        case 2: {
                                message.filesIndexed = reader.uint64();
                                break;
                            }
                        case 3: {
                                message.tagsTotal = reader.uint64();
                                break;
                            }
                        case 4: {
                                message.indexSizeMb = reader.float();
                                break;
                            }
                        case 5: {
                                if (!(message.warnings && message.warnings.length))
                                    message.warnings = [];
                                message.warnings.push(reader.string());
                                break;
                            }
                        case 6: {
                                message.uptimeSeconds = reader.int64();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a StatusResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.StatusResponse} StatusResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatusResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a StatusResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                StatusResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.state != null && message.hasOwnProperty("state"))
                        switch (message.state) {
                        default:
                            return "state: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                            break;
                        }
                    if (message.filesIndexed != null && message.hasOwnProperty("filesIndexed"))
                        if (!$util.isInteger(message.filesIndexed) && !(message.filesIndexed && $util.isInteger(message.filesIndexed.low) && $util.isInteger(message.filesIndexed.high)))
                            return "filesIndexed: integer|Long expected";
                    if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
                        if (!$util.isInteger(message.tagsTotal) && !(message.tagsTotal && $util.isInteger(message.tagsTotal.low) && $util.isInteger(message.tagsTotal.high)))
                            return "tagsTotal: integer|Long expected";
                    if (message.indexSizeMb != null && message.hasOwnProperty("indexSizeMb"))
                        if (typeof message.indexSizeMb !== "number")
                            return "indexSizeMb: number expected";
                    if (message.warnings != null && message.hasOwnProperty("warnings")) {
                        if (!Array.isArray(message.warnings))
                            return "warnings: array expected";
                        for (let i = 0; i < message.warnings.length; ++i)
                            if (!$util.isString(message.warnings[i]))
                                return "warnings: string[] expected";
                    }
                    if (message.uptimeSeconds != null && message.hasOwnProperty("uptimeSeconds"))
                        if (!$util.isInteger(message.uptimeSeconds) && !(message.uptimeSeconds && $util.isInteger(message.uptimeSeconds.low) && $util.isInteger(message.uptimeSeconds.high)))
                            return "uptimeSeconds: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a StatusResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.StatusResponse} StatusResponse
                 */
                StatusResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.StatusResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.StatusResponse();
                    switch (object.state) {
                    default:
                        if (typeof object.state === "number") {
                            message.state = object.state;
                            break;
                        }
                        break;
                    case "DAEMON_STATE_UNSPECIFIED":
                    case 0:
                        message.state = 0;
                        break;
                    case "DAEMON_STATE_IDLE":
                    case 1:
                        message.state = 1;
                        break;
                    case "DAEMON_STATE_SCANNING":
                    case 2:
                        message.state = 2;
                        break;
                    case "DAEMON_STATE_READY":
                    case 3:
                        message.state = 3;
                        break;
                    case "DAEMON_STATE_DEGRADED":
                    case 4:
                        message.state = 4;
                        break;
                    }
                    if (object.filesIndexed != null)
                        if ($util.Long)
                            (message.filesIndexed = $util.Long.fromValue(object.filesIndexed)).unsigned = true;
                        else if (typeof object.filesIndexed === "string")
                            message.filesIndexed = parseInt(object.filesIndexed, 10);
                        else if (typeof object.filesIndexed === "number")
                            message.filesIndexed = object.filesIndexed;
                        else if (typeof object.filesIndexed === "object")
                            message.filesIndexed = new $util.LongBits(object.filesIndexed.low >>> 0, object.filesIndexed.high >>> 0).toNumber(true);
                    if (object.tagsTotal != null)
                        if ($util.Long)
                            (message.tagsTotal = $util.Long.fromValue(object.tagsTotal)).unsigned = true;
                        else if (typeof object.tagsTotal === "string")
                            message.tagsTotal = parseInt(object.tagsTotal, 10);
                        else if (typeof object.tagsTotal === "number")
                            message.tagsTotal = object.tagsTotal;
                        else if (typeof object.tagsTotal === "object")
                            message.tagsTotal = new $util.LongBits(object.tagsTotal.low >>> 0, object.tagsTotal.high >>> 0).toNumber(true);
                    if (object.indexSizeMb != null)
                        message.indexSizeMb = Number(object.indexSizeMb);
                    if (object.warnings) {
                        if (!Array.isArray(object.warnings))
                            throw TypeError(".tilbo.ipc.v1.StatusResponse.warnings: array expected");
                        message.warnings = [];
                        for (let i = 0; i < object.warnings.length; ++i)
                            message.warnings[i] = String(object.warnings[i]);
                    }
                    if (object.uptimeSeconds != null)
                        if ($util.Long)
                            (message.uptimeSeconds = $util.Long.fromValue(object.uptimeSeconds)).unsigned = false;
                        else if (typeof object.uptimeSeconds === "string")
                            message.uptimeSeconds = parseInt(object.uptimeSeconds, 10);
                        else if (typeof object.uptimeSeconds === "number")
                            message.uptimeSeconds = object.uptimeSeconds;
                        else if (typeof object.uptimeSeconds === "object")
                            message.uptimeSeconds = new $util.LongBits(object.uptimeSeconds.low >>> 0, object.uptimeSeconds.high >>> 0).toNumber();
                    return message;
                };

                /**
                 * Creates a plain object from a StatusResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {tilbo.ipc.v1.StatusResponse} message StatusResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StatusResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.warnings = [];
                    if (options.defaults) {
                        object.state = options.enums === String ? "DAEMON_STATE_UNSPECIFIED" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.filesIndexed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.filesIndexed = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.tagsTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.tagsTotal = options.longs === String ? "0" : 0;
                        object.indexSizeMb = 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.uptimeSeconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.uptimeSeconds = options.longs === String ? "0" : 0;
                    }
                    if (message.state != null && message.hasOwnProperty("state"))
                        object.state = options.enums === String ? $root.tilbo.ipc.v1.DaemonState[message.state] === undefined ? message.state : $root.tilbo.ipc.v1.DaemonState[message.state] : message.state;
                    if (message.filesIndexed != null && message.hasOwnProperty("filesIndexed"))
                        if (typeof message.filesIndexed === "number")
                            object.filesIndexed = options.longs === String ? String(message.filesIndexed) : message.filesIndexed;
                        else
                            object.filesIndexed = options.longs === String ? $util.Long.prototype.toString.call(message.filesIndexed) : options.longs === Number ? new $util.LongBits(message.filesIndexed.low >>> 0, message.filesIndexed.high >>> 0).toNumber(true) : message.filesIndexed;
                    if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
                        if (typeof message.tagsTotal === "number")
                            object.tagsTotal = options.longs === String ? String(message.tagsTotal) : message.tagsTotal;
                        else
                            object.tagsTotal = options.longs === String ? $util.Long.prototype.toString.call(message.tagsTotal) : options.longs === Number ? new $util.LongBits(message.tagsTotal.low >>> 0, message.tagsTotal.high >>> 0).toNumber(true) : message.tagsTotal;
                    if (message.indexSizeMb != null && message.hasOwnProperty("indexSizeMb"))
                        object.indexSizeMb = options.json && !isFinite(message.indexSizeMb) ? String(message.indexSizeMb) : message.indexSizeMb;
                    if (message.warnings && message.warnings.length) {
                        object.warnings = [];
                        for (let j = 0; j < message.warnings.length; ++j)
                            object.warnings[j] = message.warnings[j];
                    }
                    if (message.uptimeSeconds != null && message.hasOwnProperty("uptimeSeconds"))
                        if (typeof message.uptimeSeconds === "number")
                            object.uptimeSeconds = options.longs === String ? String(message.uptimeSeconds) : message.uptimeSeconds;
                        else
                            object.uptimeSeconds = options.longs === String ? $util.Long.prototype.toString.call(message.uptimeSeconds) : options.longs === Number ? new $util.LongBits(message.uptimeSeconds.low >>> 0, message.uptimeSeconds.high >>> 0).toNumber() : message.uptimeSeconds;
                    return object;
                };

                /**
                 * Converts this StatusResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StatusResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for StatusResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.StatusResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                StatusResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.StatusResponse";
                };

                return StatusResponse;
            })();

            v1.ReloadRulesRequest = (function() {

                /**
                 * Properties of a ReloadRulesRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IReloadRulesRequest
                 */

                /**
                 * Constructs a new ReloadRulesRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ReloadRulesRequest.
                 * @implements IReloadRulesRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IReloadRulesRequest=} [properties] Properties to set
                 */
                function ReloadRulesRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new ReloadRulesRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ReloadRulesRequest} ReloadRulesRequest instance
                 */
                ReloadRulesRequest.create = function create(properties) {
                    return new ReloadRulesRequest(properties);
                };

                /**
                 * Encodes the specified ReloadRulesRequest message. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesRequest} message ReloadRulesRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReloadRulesRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified ReloadRulesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesRequest} message ReloadRulesRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReloadRulesRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ReloadRulesRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ReloadRulesRequest} ReloadRulesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReloadRulesRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ReloadRulesRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ReloadRulesRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ReloadRulesRequest} ReloadRulesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReloadRulesRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ReloadRulesRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ReloadRulesRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a ReloadRulesRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ReloadRulesRequest} ReloadRulesRequest
                 */
                ReloadRulesRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ReloadRulesRequest)
                        return object;
                    return new $root.tilbo.ipc.v1.ReloadRulesRequest();
                };

                /**
                 * Creates a plain object from a ReloadRulesRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {tilbo.ipc.v1.ReloadRulesRequest} message ReloadRulesRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ReloadRulesRequest.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this ReloadRulesRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ReloadRulesRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ReloadRulesRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ReloadRulesRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ReloadRulesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ReloadRulesRequest";
                };

                return ReloadRulesRequest;
            })();

            v1.ReloadRulesResponse = (function() {

                /**
                 * Properties of a ReloadRulesResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IReloadRulesResponse
                 * @property {number|null} [rulesLoaded] ReloadRulesResponse rulesLoaded
                 * @property {Array.<string>|null} [errors] ReloadRulesResponse errors
                 */

                /**
                 * Constructs a new ReloadRulesResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ReloadRulesResponse.
                 * @implements IReloadRulesResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IReloadRulesResponse=} [properties] Properties to set
                 */
                function ReloadRulesResponse(properties) {
                    this.errors = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ReloadRulesResponse rulesLoaded.
                 * @member {number} rulesLoaded
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @instance
                 */
                ReloadRulesResponse.prototype.rulesLoaded = 0;

                /**
                 * ReloadRulesResponse errors.
                 * @member {Array.<string>} errors
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @instance
                 */
                ReloadRulesResponse.prototype.errors = $util.emptyArray;

                /**
                 * Creates a new ReloadRulesResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ReloadRulesResponse} ReloadRulesResponse instance
                 */
                ReloadRulesResponse.create = function create(properties) {
                    return new ReloadRulesResponse(properties);
                };

                /**
                 * Encodes the specified ReloadRulesResponse message. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesResponse} message ReloadRulesResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReloadRulesResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.rulesLoaded != null && Object.hasOwnProperty.call(message, "rulesLoaded"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.rulesLoaded);
                    if (message.errors != null && message.errors.length)
                        for (let i = 0; i < message.errors.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.errors[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ReloadRulesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ReloadRulesResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IReloadRulesResponse} message ReloadRulesResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ReloadRulesResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ReloadRulesResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ReloadRulesResponse} ReloadRulesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReloadRulesResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ReloadRulesResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.rulesLoaded = reader.uint32();
                                break;
                            }
                        case 2: {
                                if (!(message.errors && message.errors.length))
                                    message.errors = [];
                                message.errors.push(reader.string());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ReloadRulesResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ReloadRulesResponse} ReloadRulesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ReloadRulesResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ReloadRulesResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ReloadRulesResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.rulesLoaded != null && message.hasOwnProperty("rulesLoaded"))
                        if (!$util.isInteger(message.rulesLoaded))
                            return "rulesLoaded: integer expected";
                    if (message.errors != null && message.hasOwnProperty("errors")) {
                        if (!Array.isArray(message.errors))
                            return "errors: array expected";
                        for (let i = 0; i < message.errors.length; ++i)
                            if (!$util.isString(message.errors[i]))
                                return "errors: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a ReloadRulesResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ReloadRulesResponse} ReloadRulesResponse
                 */
                ReloadRulesResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ReloadRulesResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ReloadRulesResponse();
                    if (object.rulesLoaded != null)
                        message.rulesLoaded = object.rulesLoaded >>> 0;
                    if (object.errors) {
                        if (!Array.isArray(object.errors))
                            throw TypeError(".tilbo.ipc.v1.ReloadRulesResponse.errors: array expected");
                        message.errors = [];
                        for (let i = 0; i < object.errors.length; ++i)
                            message.errors[i] = String(object.errors[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ReloadRulesResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {tilbo.ipc.v1.ReloadRulesResponse} message ReloadRulesResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ReloadRulesResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.errors = [];
                    if (options.defaults)
                        object.rulesLoaded = 0;
                    if (message.rulesLoaded != null && message.hasOwnProperty("rulesLoaded"))
                        object.rulesLoaded = message.rulesLoaded;
                    if (message.errors && message.errors.length) {
                        object.errors = [];
                        for (let j = 0; j < message.errors.length; ++j)
                            object.errors[j] = message.errors[j];
                    }
                    return object;
                };

                /**
                 * Converts this ReloadRulesResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ReloadRulesResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ReloadRulesResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ReloadRulesResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ReloadRulesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ReloadRulesResponse";
                };

                return ReloadRulesResponse;
            })();

            v1.ListTagsRequest = (function() {

                /**
                 * Properties of a ListTagsRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IListTagsRequest
                 * @property {string|null} [prefix] ListTagsRequest prefix
                 */

                /**
                 * Constructs a new ListTagsRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListTagsRequest.
                 * @implements IListTagsRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IListTagsRequest=} [properties] Properties to set
                 */
                function ListTagsRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ListTagsRequest prefix.
                 * @member {string} prefix
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @instance
                 */
                ListTagsRequest.prototype.prefix = "";

                /**
                 * Creates a new ListTagsRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListTagsRequest} ListTagsRequest instance
                 */
                ListTagsRequest.create = function create(properties) {
                    return new ListTagsRequest(properties);
                };

                /**
                 * Encodes the specified ListTagsRequest message. Does not implicitly {@link tilbo.ipc.v1.ListTagsRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsRequest} message ListTagsRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListTagsRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.prefix != null && Object.hasOwnProperty.call(message, "prefix"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.prefix);
                    return writer;
                };

                /**
                 * Encodes the specified ListTagsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTagsRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsRequest} message ListTagsRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListTagsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListTagsRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListTagsRequest} ListTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListTagsRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTagsRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.prefix = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListTagsRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListTagsRequest} ListTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListTagsRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListTagsRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListTagsRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.prefix != null && message.hasOwnProperty("prefix"))
                        if (!$util.isString(message.prefix))
                            return "prefix: string expected";
                    return null;
                };

                /**
                 * Creates a ListTagsRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListTagsRequest} ListTagsRequest
                 */
                ListTagsRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListTagsRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ListTagsRequest();
                    if (object.prefix != null)
                        message.prefix = String(object.prefix);
                    return message;
                };

                /**
                 * Creates a plain object from a ListTagsRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.ListTagsRequest} message ListTagsRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListTagsRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.prefix = "";
                    if (message.prefix != null && message.hasOwnProperty("prefix"))
                        object.prefix = message.prefix;
                    return object;
                };

                /**
                 * Converts this ListTagsRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListTagsRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListTagsRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListTagsRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListTagsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListTagsRequest";
                };

                return ListTagsRequest;
            })();

            v1.ListTagsResponse = (function() {

                /**
                 * Properties of a ListTagsResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IListTagsResponse
                 * @property {Array.<string>|null} [tags] ListTagsResponse tags
                 */

                /**
                 * Constructs a new ListTagsResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListTagsResponse.
                 * @implements IListTagsResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IListTagsResponse=} [properties] Properties to set
                 */
                function ListTagsResponse(properties) {
                    this.tags = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ListTagsResponse tags.
                 * @member {Array.<string>} tags
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @instance
                 */
                ListTagsResponse.prototype.tags = $util.emptyArray;

                /**
                 * Creates a new ListTagsResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListTagsResponse} ListTagsResponse instance
                 */
                ListTagsResponse.create = function create(properties) {
                    return new ListTagsResponse(properties);
                };

                /**
                 * Encodes the specified ListTagsResponse message. Does not implicitly {@link tilbo.ipc.v1.ListTagsResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsResponse} message ListTagsResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListTagsResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.tags != null && message.tags.length)
                        for (let i = 0; i < message.tags.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.tags[i]);
                    return writer;
                };

                /**
                 * Encodes the specified ListTagsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListTagsResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListTagsResponse} message ListTagsResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListTagsResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListTagsResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListTagsResponse} ListTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListTagsResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListTagsResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.tags && message.tags.length))
                                    message.tags = [];
                                message.tags.push(reader.string());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListTagsResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListTagsResponse} ListTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListTagsResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListTagsResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListTagsResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.tags != null && message.hasOwnProperty("tags")) {
                        if (!Array.isArray(message.tags))
                            return "tags: array expected";
                        for (let i = 0; i < message.tags.length; ++i)
                            if (!$util.isString(message.tags[i]))
                                return "tags: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a ListTagsResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListTagsResponse} ListTagsResponse
                 */
                ListTagsResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListTagsResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ListTagsResponse();
                    if (object.tags) {
                        if (!Array.isArray(object.tags))
                            throw TypeError(".tilbo.ipc.v1.ListTagsResponse.tags: array expected");
                        message.tags = [];
                        for (let i = 0; i < object.tags.length; ++i)
                            message.tags[i] = String(object.tags[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ListTagsResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.ListTagsResponse} message ListTagsResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListTagsResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.tags = [];
                    if (message.tags && message.tags.length) {
                        object.tags = [];
                        for (let j = 0; j < message.tags.length; ++j)
                            object.tags[j] = message.tags[j];
                    }
                    return object;
                };

                /**
                 * Converts this ListTagsResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListTagsResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListTagsResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListTagsResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListTagsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListTagsResponse";
                };

                return ListTagsResponse;
            })();

            v1.HydrateTagsRequest = (function() {

                /**
                 * Properties of a HydrateTagsRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IHydrateTagsRequest
                 * @property {Array.<string>|null} [paths] HydrateTagsRequest paths
                 */

                /**
                 * Constructs a new HydrateTagsRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a HydrateTagsRequest.
                 * @implements IHydrateTagsRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IHydrateTagsRequest=} [properties] Properties to set
                 */
                function HydrateTagsRequest(properties) {
                    this.paths = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * HydrateTagsRequest paths.
                 * @member {Array.<string>} paths
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @instance
                 */
                HydrateTagsRequest.prototype.paths = $util.emptyArray;

                /**
                 * Creates a new HydrateTagsRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.HydrateTagsRequest} HydrateTagsRequest instance
                 */
                HydrateTagsRequest.create = function create(properties) {
                    return new HydrateTagsRequest(properties);
                };

                /**
                 * Encodes the specified HydrateTagsRequest message. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsRequest} message HydrateTagsRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydrateTagsRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.paths != null && message.paths.length)
                        for (let i = 0; i < message.paths.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.paths[i]);
                    return writer;
                };

                /**
                 * Encodes the specified HydrateTagsRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsRequest} message HydrateTagsRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydrateTagsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a HydrateTagsRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.HydrateTagsRequest} HydrateTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydrateTagsRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydrateTagsRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.paths && message.paths.length))
                                    message.paths = [];
                                message.paths.push(reader.string());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a HydrateTagsRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.HydrateTagsRequest} HydrateTagsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydrateTagsRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a HydrateTagsRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                HydrateTagsRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.paths != null && message.hasOwnProperty("paths")) {
                        if (!Array.isArray(message.paths))
                            return "paths: array expected";
                        for (let i = 0; i < message.paths.length; ++i)
                            if (!$util.isString(message.paths[i]))
                                return "paths: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a HydrateTagsRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.HydrateTagsRequest} HydrateTagsRequest
                 */
                HydrateTagsRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.HydrateTagsRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.HydrateTagsRequest();
                    if (object.paths) {
                        if (!Array.isArray(object.paths))
                            throw TypeError(".tilbo.ipc.v1.HydrateTagsRequest.paths: array expected");
                        message.paths = [];
                        for (let i = 0; i < object.paths.length; ++i)
                            message.paths[i] = String(object.paths[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a HydrateTagsRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {tilbo.ipc.v1.HydrateTagsRequest} message HydrateTagsRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                HydrateTagsRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.paths = [];
                    if (message.paths && message.paths.length) {
                        object.paths = [];
                        for (let j = 0; j < message.paths.length; ++j)
                            object.paths[j] = message.paths[j];
                    }
                    return object;
                };

                /**
                 * Converts this HydrateTagsRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                HydrateTagsRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for HydrateTagsRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.HydrateTagsRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                HydrateTagsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.HydrateTagsRequest";
                };

                return HydrateTagsRequest;
            })();

            v1.HydratedPathTags = (function() {

                /**
                 * Properties of a HydratedPathTags.
                 * @memberof tilbo.ipc.v1
                 * @interface IHydratedPathTags
                 * @property {string|null} [path] HydratedPathTags path
                 * @property {Array.<string>|null} [tags] HydratedPathTags tags
                 */

                /**
                 * Constructs a new HydratedPathTags.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a HydratedPathTags.
                 * @implements IHydratedPathTags
                 * @constructor
                 * @param {tilbo.ipc.v1.IHydratedPathTags=} [properties] Properties to set
                 */
                function HydratedPathTags(properties) {
                    this.tags = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * HydratedPathTags path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @instance
                 */
                HydratedPathTags.prototype.path = "";

                /**
                 * HydratedPathTags tags.
                 * @member {Array.<string>} tags
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @instance
                 */
                HydratedPathTags.prototype.tags = $util.emptyArray;

                /**
                 * Creates a new HydratedPathTags instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {tilbo.ipc.v1.IHydratedPathTags=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.HydratedPathTags} HydratedPathTags instance
                 */
                HydratedPathTags.create = function create(properties) {
                    return new HydratedPathTags(properties);
                };

                /**
                 * Encodes the specified HydratedPathTags message. Does not implicitly {@link tilbo.ipc.v1.HydratedPathTags.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {tilbo.ipc.v1.IHydratedPathTags} message HydratedPathTags message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydratedPathTags.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.tags != null && message.tags.length)
                        for (let i = 0; i < message.tags.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.tags[i]);
                    return writer;
                };

                /**
                 * Encodes the specified HydratedPathTags message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydratedPathTags.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {tilbo.ipc.v1.IHydratedPathTags} message HydratedPathTags message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydratedPathTags.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a HydratedPathTags message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.HydratedPathTags} HydratedPathTags
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydratedPathTags.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydratedPathTags();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                if (!(message.tags && message.tags.length))
                                    message.tags = [];
                                message.tags.push(reader.string());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a HydratedPathTags message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.HydratedPathTags} HydratedPathTags
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydratedPathTags.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a HydratedPathTags message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                HydratedPathTags.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.tags != null && message.hasOwnProperty("tags")) {
                        if (!Array.isArray(message.tags))
                            return "tags: array expected";
                        for (let i = 0; i < message.tags.length; ++i)
                            if (!$util.isString(message.tags[i]))
                                return "tags: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a HydratedPathTags message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.HydratedPathTags} HydratedPathTags
                 */
                HydratedPathTags.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.HydratedPathTags)
                        return object;
                    let message = new $root.tilbo.ipc.v1.HydratedPathTags();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.tags) {
                        if (!Array.isArray(object.tags))
                            throw TypeError(".tilbo.ipc.v1.HydratedPathTags.tags: array expected");
                        message.tags = [];
                        for (let i = 0; i < object.tags.length; ++i)
                            message.tags[i] = String(object.tags[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a HydratedPathTags message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {tilbo.ipc.v1.HydratedPathTags} message HydratedPathTags
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                HydratedPathTags.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.tags = [];
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.tags && message.tags.length) {
                        object.tags = [];
                        for (let j = 0; j < message.tags.length; ++j)
                            object.tags[j] = message.tags[j];
                    }
                    return object;
                };

                /**
                 * Converts this HydratedPathTags to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                HydratedPathTags.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for HydratedPathTags
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.HydratedPathTags
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                HydratedPathTags.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.HydratedPathTags";
                };

                return HydratedPathTags;
            })();

            v1.HydrateTagsResponse = (function() {

                /**
                 * Properties of a HydrateTagsResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IHydrateTagsResponse
                 * @property {Array.<tilbo.ipc.v1.IHydratedPathTags>|null} [entries] HydrateTagsResponse entries
                 */

                /**
                 * Constructs a new HydrateTagsResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a HydrateTagsResponse.
                 * @implements IHydrateTagsResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IHydrateTagsResponse=} [properties] Properties to set
                 */
                function HydrateTagsResponse(properties) {
                    this.entries = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * HydrateTagsResponse entries.
                 * @member {Array.<tilbo.ipc.v1.IHydratedPathTags>} entries
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @instance
                 */
                HydrateTagsResponse.prototype.entries = $util.emptyArray;

                /**
                 * Creates a new HydrateTagsResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.HydrateTagsResponse} HydrateTagsResponse instance
                 */
                HydrateTagsResponse.create = function create(properties) {
                    return new HydrateTagsResponse(properties);
                };

                /**
                 * Encodes the specified HydrateTagsResponse message. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsResponse} message HydrateTagsResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydrateTagsResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.entries != null && message.entries.length)
                        for (let i = 0; i < message.entries.length; ++i)
                            $root.tilbo.ipc.v1.HydratedPathTags.encode(message.entries[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified HydrateTagsResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.HydrateTagsResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.IHydrateTagsResponse} message HydrateTagsResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                HydrateTagsResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a HydrateTagsResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.HydrateTagsResponse} HydrateTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydrateTagsResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.HydrateTagsResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.entries && message.entries.length))
                                    message.entries = [];
                                message.entries.push($root.tilbo.ipc.v1.HydratedPathTags.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a HydrateTagsResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.HydrateTagsResponse} HydrateTagsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                HydrateTagsResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a HydrateTagsResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                HydrateTagsResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.entries != null && message.hasOwnProperty("entries")) {
                        if (!Array.isArray(message.entries))
                            return "entries: array expected";
                        for (let i = 0; i < message.entries.length; ++i) {
                            let error = $root.tilbo.ipc.v1.HydratedPathTags.verify(message.entries[i]);
                            if (error)
                                return "entries." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a HydrateTagsResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.HydrateTagsResponse} HydrateTagsResponse
                 */
                HydrateTagsResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.HydrateTagsResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.HydrateTagsResponse();
                    if (object.entries) {
                        if (!Array.isArray(object.entries))
                            throw TypeError(".tilbo.ipc.v1.HydrateTagsResponse.entries: array expected");
                        message.entries = [];
                        for (let i = 0; i < object.entries.length; ++i) {
                            if (typeof object.entries[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.HydrateTagsResponse.entries: object expected");
                            message.entries[i] = $root.tilbo.ipc.v1.HydratedPathTags.fromObject(object.entries[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a HydrateTagsResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {tilbo.ipc.v1.HydrateTagsResponse} message HydrateTagsResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                HydrateTagsResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.entries = [];
                    if (message.entries && message.entries.length) {
                        object.entries = [];
                        for (let j = 0; j < message.entries.length; ++j)
                            object.entries[j] = $root.tilbo.ipc.v1.HydratedPathTags.toObject(message.entries[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this HydrateTagsResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                HydrateTagsResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for HydrateTagsResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.HydrateTagsResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                HydrateTagsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.HydrateTagsResponse";
                };

                return HydrateTagsResponse;
            })();

            v1.ListDirectoryRequest = (function() {

                /**
                 * Properties of a ListDirectoryRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IListDirectoryRequest
                 * @property {string|null} [path] ListDirectoryRequest path
                 * @property {boolean|null} [hidden] ListDirectoryRequest hidden
                 */

                /**
                 * Constructs a new ListDirectoryRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListDirectoryRequest.
                 * @implements IListDirectoryRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IListDirectoryRequest=} [properties] Properties to set
                 */
                function ListDirectoryRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ListDirectoryRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @instance
                 */
                ListDirectoryRequest.prototype.path = "";

                /**
                 * ListDirectoryRequest hidden.
                 * @member {boolean} hidden
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @instance
                 */
                ListDirectoryRequest.prototype.hidden = false;

                /**
                 * Creates a new ListDirectoryRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListDirectoryRequest} ListDirectoryRequest instance
                 */
                ListDirectoryRequest.create = function create(properties) {
                    return new ListDirectoryRequest(properties);
                };

                /**
                 * Encodes the specified ListDirectoryRequest message. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryRequest} message ListDirectoryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListDirectoryRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.hidden != null && Object.hasOwnProperty.call(message, "hidden"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.hidden);
                    return writer;
                };

                /**
                 * Encodes the specified ListDirectoryRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryRequest} message ListDirectoryRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListDirectoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListDirectoryRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListDirectoryRequest} ListDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListDirectoryRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListDirectoryRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                message.hidden = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListDirectoryRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListDirectoryRequest} ListDirectoryRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListDirectoryRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListDirectoryRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListDirectoryRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.hidden != null && message.hasOwnProperty("hidden"))
                        if (typeof message.hidden !== "boolean")
                            return "hidden: boolean expected";
                    return null;
                };

                /**
                 * Creates a ListDirectoryRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListDirectoryRequest} ListDirectoryRequest
                 */
                ListDirectoryRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListDirectoryRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ListDirectoryRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.hidden != null)
                        message.hidden = Boolean(object.hidden);
                    return message;
                };

                /**
                 * Creates a plain object from a ListDirectoryRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {tilbo.ipc.v1.ListDirectoryRequest} message ListDirectoryRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListDirectoryRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.path = "";
                        object.hidden = false;
                    }
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.hidden != null && message.hasOwnProperty("hidden"))
                        object.hidden = message.hidden;
                    return object;
                };

                /**
                 * Converts this ListDirectoryRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListDirectoryRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListDirectoryRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListDirectoryRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListDirectoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListDirectoryRequest";
                };

                return ListDirectoryRequest;
            })();

            v1.DirEntry = (function() {

                /**
                 * Properties of a DirEntry.
                 * @memberof tilbo.ipc.v1
                 * @interface IDirEntry
                 * @property {string|null} [name] DirEntry name
                 * @property {string|null} [path] DirEntry path
                 * @property {boolean|null} [isDir] DirEntry isDir
                 * @property {number|Long|null} [sizeBytes] DirEntry sizeBytes
                 * @property {number|Long|null} [mtime] DirEntry mtime
                 * @property {number|null} [mode] DirEntry mode
                 * @property {boolean|null} [hidden] DirEntry hidden
                 */

                /**
                 * Constructs a new DirEntry.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a DirEntry.
                 * @implements IDirEntry
                 * @constructor
                 * @param {tilbo.ipc.v1.IDirEntry=} [properties] Properties to set
                 */
                function DirEntry(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DirEntry name.
                 * @member {string} name
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.name = "";

                /**
                 * DirEntry path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.path = "";

                /**
                 * DirEntry isDir.
                 * @member {boolean} isDir
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.isDir = false;

                /**
                 * DirEntry sizeBytes.
                 * @member {number|Long} sizeBytes
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * DirEntry mtime.
                 * @member {number|Long} mtime
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.mtime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * DirEntry mode.
                 * @member {number} mode
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.mode = 0;

                /**
                 * DirEntry hidden.
                 * @member {boolean} hidden
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 */
                DirEntry.prototype.hidden = false;

                /**
                 * Creates a new DirEntry instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {tilbo.ipc.v1.IDirEntry=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.DirEntry} DirEntry instance
                 */
                DirEntry.create = function create(properties) {
                    return new DirEntry(properties);
                };

                /**
                 * Encodes the specified DirEntry message. Does not implicitly {@link tilbo.ipc.v1.DirEntry.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {tilbo.ipc.v1.IDirEntry} message DirEntry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DirEntry.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
                    if (message.isDir != null && Object.hasOwnProperty.call(message, "isDir"))
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.isDir);
                    if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int64(message.sizeBytes);
                    if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int64(message.mtime);
                    if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
                        writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.mode);
                    if (message.hidden != null && Object.hasOwnProperty.call(message, "hidden"))
                        writer.uint32(/* id 7, wireType 0 =*/56).bool(message.hidden);
                    return writer;
                };

                /**
                 * Encodes the specified DirEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DirEntry.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {tilbo.ipc.v1.IDirEntry} message DirEntry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DirEntry.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DirEntry message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.DirEntry} DirEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DirEntry.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DirEntry();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.name = reader.string();
                                break;
                            }
                        case 2: {
                                message.path = reader.string();
                                break;
                            }
                        case 3: {
                                message.isDir = reader.bool();
                                break;
                            }
                        case 4: {
                                message.sizeBytes = reader.int64();
                                break;
                            }
                        case 5: {
                                message.mtime = reader.int64();
                                break;
                            }
                        case 6: {
                                message.mode = reader.uint32();
                                break;
                            }
                        case 7: {
                                message.hidden = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DirEntry message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.DirEntry} DirEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DirEntry.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DirEntry message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DirEntry.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.name != null && message.hasOwnProperty("name"))
                        if (!$util.isString(message.name))
                            return "name: string expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.isDir != null && message.hasOwnProperty("isDir"))
                        if (typeof message.isDir !== "boolean")
                            return "isDir: boolean expected";
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
                            return "sizeBytes: integer|Long expected";
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
                            return "mtime: integer|Long expected";
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        if (!$util.isInteger(message.mode))
                            return "mode: integer expected";
                    if (message.hidden != null && message.hasOwnProperty("hidden"))
                        if (typeof message.hidden !== "boolean")
                            return "hidden: boolean expected";
                    return null;
                };

                /**
                 * Creates a DirEntry message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.DirEntry} DirEntry
                 */
                DirEntry.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.DirEntry)
                        return object;
                    let message = new $root.tilbo.ipc.v1.DirEntry();
                    if (object.name != null)
                        message.name = String(object.name);
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.isDir != null)
                        message.isDir = Boolean(object.isDir);
                    if (object.sizeBytes != null)
                        if ($util.Long)
                            (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
                        else if (typeof object.sizeBytes === "string")
                            message.sizeBytes = parseInt(object.sizeBytes, 10);
                        else if (typeof object.sizeBytes === "number")
                            message.sizeBytes = object.sizeBytes;
                        else if (typeof object.sizeBytes === "object")
                            message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
                    if (object.mtime != null)
                        if ($util.Long)
                            (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
                        else if (typeof object.mtime === "string")
                            message.mtime = parseInt(object.mtime, 10);
                        else if (typeof object.mtime === "number")
                            message.mtime = object.mtime;
                        else if (typeof object.mtime === "object")
                            message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
                    if (object.mode != null)
                        message.mode = object.mode >>> 0;
                    if (object.hidden != null)
                        message.hidden = Boolean(object.hidden);
                    return message;
                };

                /**
                 * Creates a plain object from a DirEntry message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {tilbo.ipc.v1.DirEntry} message DirEntry
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DirEntry.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.name = "";
                        object.path = "";
                        object.isDir = false;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.sizeBytes = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.mtime = options.longs === String ? "0" : 0;
                        object.mode = 0;
                        object.hidden = false;
                    }
                    if (message.name != null && message.hasOwnProperty("name"))
                        object.name = message.name;
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.isDir != null && message.hasOwnProperty("isDir"))
                        object.isDir = message.isDir;
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (typeof message.sizeBytes === "number")
                            object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
                        else
                            object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (typeof message.mtime === "number")
                            object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
                        else
                            object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        object.mode = message.mode;
                    if (message.hidden != null && message.hasOwnProperty("hidden"))
                        object.hidden = message.hidden;
                    return object;
                };

                /**
                 * Converts this DirEntry to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DirEntry.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DirEntry
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.DirEntry
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DirEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.DirEntry";
                };

                return DirEntry;
            })();

            v1.ListDirectoryResponse = (function() {

                /**
                 * Properties of a ListDirectoryResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IListDirectoryResponse
                 * @property {Array.<tilbo.ipc.v1.IDirEntry>|null} [entries] ListDirectoryResponse entries
                 */

                /**
                 * Constructs a new ListDirectoryResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListDirectoryResponse.
                 * @implements IListDirectoryResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IListDirectoryResponse=} [properties] Properties to set
                 */
                function ListDirectoryResponse(properties) {
                    this.entries = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ListDirectoryResponse entries.
                 * @member {Array.<tilbo.ipc.v1.IDirEntry>} entries
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @instance
                 */
                ListDirectoryResponse.prototype.entries = $util.emptyArray;

                /**
                 * Creates a new ListDirectoryResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListDirectoryResponse} ListDirectoryResponse instance
                 */
                ListDirectoryResponse.create = function create(properties) {
                    return new ListDirectoryResponse(properties);
                };

                /**
                 * Encodes the specified ListDirectoryResponse message. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryResponse} message ListDirectoryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListDirectoryResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.entries != null && message.entries.length)
                        for (let i = 0; i < message.entries.length; ++i)
                            $root.tilbo.ipc.v1.DirEntry.encode(message.entries[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ListDirectoryResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListDirectoryResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListDirectoryResponse} message ListDirectoryResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListDirectoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListDirectoryResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListDirectoryResponse} ListDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListDirectoryResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListDirectoryResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.entries && message.entries.length))
                                    message.entries = [];
                                message.entries.push($root.tilbo.ipc.v1.DirEntry.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListDirectoryResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListDirectoryResponse} ListDirectoryResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListDirectoryResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListDirectoryResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListDirectoryResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.entries != null && message.hasOwnProperty("entries")) {
                        if (!Array.isArray(message.entries))
                            return "entries: array expected";
                        for (let i = 0; i < message.entries.length; ++i) {
                            let error = $root.tilbo.ipc.v1.DirEntry.verify(message.entries[i]);
                            if (error)
                                return "entries." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ListDirectoryResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListDirectoryResponse} ListDirectoryResponse
                 */
                ListDirectoryResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListDirectoryResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ListDirectoryResponse();
                    if (object.entries) {
                        if (!Array.isArray(object.entries))
                            throw TypeError(".tilbo.ipc.v1.ListDirectoryResponse.entries: array expected");
                        message.entries = [];
                        for (let i = 0; i < object.entries.length; ++i) {
                            if (typeof object.entries[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.ListDirectoryResponse.entries: object expected");
                            message.entries[i] = $root.tilbo.ipc.v1.DirEntry.fromObject(object.entries[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ListDirectoryResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {tilbo.ipc.v1.ListDirectoryResponse} message ListDirectoryResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListDirectoryResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.entries = [];
                    if (message.entries && message.entries.length) {
                        object.entries = [];
                        for (let j = 0; j < message.entries.length; ++j)
                            object.entries[j] = $root.tilbo.ipc.v1.DirEntry.toObject(message.entries[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this ListDirectoryResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListDirectoryResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListDirectoryResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListDirectoryResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListDirectoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListDirectoryResponse";
                };

                return ListDirectoryResponse;
            })();

            v1.StatFileRequest = (function() {

                /**
                 * Properties of a StatFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IStatFileRequest
                 * @property {string|null} [path] StatFileRequest path
                 */

                /**
                 * Constructs a new StatFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a StatFileRequest.
                 * @implements IStatFileRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IStatFileRequest=} [properties] Properties to set
                 */
                function StatFileRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * StatFileRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @instance
                 */
                StatFileRequest.prototype.path = "";

                /**
                 * Creates a new StatFileRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.StatFileRequest} StatFileRequest instance
                 */
                StatFileRequest.create = function create(properties) {
                    return new StatFileRequest(properties);
                };

                /**
                 * Encodes the specified StatFileRequest message. Does not implicitly {@link tilbo.ipc.v1.StatFileRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileRequest} message StatFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatFileRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    return writer;
                };

                /**
                 * Encodes the specified StatFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatFileRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileRequest} message StatFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a StatFileRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.StatFileRequest} StatFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatFileRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatFileRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a StatFileRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.StatFileRequest} StatFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatFileRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a StatFileRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                StatFileRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    return null;
                };

                /**
                 * Creates a StatFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.StatFileRequest} StatFileRequest
                 */
                StatFileRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.StatFileRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.StatFileRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    return message;
                };

                /**
                 * Creates a plain object from a StatFileRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.StatFileRequest} message StatFileRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StatFileRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    return object;
                };

                /**
                 * Converts this StatFileRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StatFileRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for StatFileRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.StatFileRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                StatFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.StatFileRequest";
                };

                return StatFileRequest;
            })();

            v1.FileStat = (function() {

                /**
                 * Properties of a FileStat.
                 * @memberof tilbo.ipc.v1
                 * @interface IFileStat
                 * @property {number|Long|null} [sizeBytes] FileStat sizeBytes
                 * @property {number|Long|null} [mtime] FileStat mtime
                 * @property {number|null} [mode] FileStat mode
                 */

                /**
                 * Constructs a new FileStat.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a FileStat.
                 * @implements IFileStat
                 * @constructor
                 * @param {tilbo.ipc.v1.IFileStat=} [properties] Properties to set
                 */
                function FileStat(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FileStat sizeBytes.
                 * @member {number|Long} sizeBytes
                 * @memberof tilbo.ipc.v1.FileStat
                 * @instance
                 */
                FileStat.prototype.sizeBytes = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * FileStat mtime.
                 * @member {number|Long} mtime
                 * @memberof tilbo.ipc.v1.FileStat
                 * @instance
                 */
                FileStat.prototype.mtime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

                /**
                 * FileStat mode.
                 * @member {number} mode
                 * @memberof tilbo.ipc.v1.FileStat
                 * @instance
                 */
                FileStat.prototype.mode = 0;

                /**
                 * Creates a new FileStat instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {tilbo.ipc.v1.IFileStat=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.FileStat} FileStat instance
                 */
                FileStat.create = function create(properties) {
                    return new FileStat(properties);
                };

                /**
                 * Encodes the specified FileStat message. Does not implicitly {@link tilbo.ipc.v1.FileStat.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {tilbo.ipc.v1.IFileStat} message FileStat message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileStat.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.sizeBytes != null && Object.hasOwnProperty.call(message, "sizeBytes"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int64(message.sizeBytes);
                    if (message.mtime != null && Object.hasOwnProperty.call(message, "mtime"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int64(message.mtime);
                    if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.mode);
                    return writer;
                };

                /**
                 * Encodes the specified FileStat message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileStat.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {tilbo.ipc.v1.IFileStat} message FileStat message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileStat.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FileStat message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.FileStat} FileStat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileStat.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileStat();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.sizeBytes = reader.int64();
                                break;
                            }
                        case 2: {
                                message.mtime = reader.int64();
                                break;
                            }
                        case 3: {
                                message.mode = reader.uint32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FileStat message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.FileStat} FileStat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileStat.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FileStat message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FileStat.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (!$util.isInteger(message.sizeBytes) && !(message.sizeBytes && $util.isInteger(message.sizeBytes.low) && $util.isInteger(message.sizeBytes.high)))
                            return "sizeBytes: integer|Long expected";
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (!$util.isInteger(message.mtime) && !(message.mtime && $util.isInteger(message.mtime.low) && $util.isInteger(message.mtime.high)))
                            return "mtime: integer|Long expected";
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        if (!$util.isInteger(message.mode))
                            return "mode: integer expected";
                    return null;
                };

                /**
                 * Creates a FileStat message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.FileStat} FileStat
                 */
                FileStat.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.FileStat)
                        return object;
                    let message = new $root.tilbo.ipc.v1.FileStat();
                    if (object.sizeBytes != null)
                        if ($util.Long)
                            (message.sizeBytes = $util.Long.fromValue(object.sizeBytes)).unsigned = false;
                        else if (typeof object.sizeBytes === "string")
                            message.sizeBytes = parseInt(object.sizeBytes, 10);
                        else if (typeof object.sizeBytes === "number")
                            message.sizeBytes = object.sizeBytes;
                        else if (typeof object.sizeBytes === "object")
                            message.sizeBytes = new $util.LongBits(object.sizeBytes.low >>> 0, object.sizeBytes.high >>> 0).toNumber();
                    if (object.mtime != null)
                        if ($util.Long)
                            (message.mtime = $util.Long.fromValue(object.mtime)).unsigned = false;
                        else if (typeof object.mtime === "string")
                            message.mtime = parseInt(object.mtime, 10);
                        else if (typeof object.mtime === "number")
                            message.mtime = object.mtime;
                        else if (typeof object.mtime === "object")
                            message.mtime = new $util.LongBits(object.mtime.low >>> 0, object.mtime.high >>> 0).toNumber();
                    if (object.mode != null)
                        message.mode = object.mode >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a FileStat message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {tilbo.ipc.v1.FileStat} message FileStat
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FileStat.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.sizeBytes = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.sizeBytes = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, false);
                            object.mtime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.mtime = options.longs === String ? "0" : 0;
                        object.mode = 0;
                    }
                    if (message.sizeBytes != null && message.hasOwnProperty("sizeBytes"))
                        if (typeof message.sizeBytes === "number")
                            object.sizeBytes = options.longs === String ? String(message.sizeBytes) : message.sizeBytes;
                        else
                            object.sizeBytes = options.longs === String ? $util.Long.prototype.toString.call(message.sizeBytes) : options.longs === Number ? new $util.LongBits(message.sizeBytes.low >>> 0, message.sizeBytes.high >>> 0).toNumber() : message.sizeBytes;
                    if (message.mtime != null && message.hasOwnProperty("mtime"))
                        if (typeof message.mtime === "number")
                            object.mtime = options.longs === String ? String(message.mtime) : message.mtime;
                        else
                            object.mtime = options.longs === String ? $util.Long.prototype.toString.call(message.mtime) : options.longs === Number ? new $util.LongBits(message.mtime.low >>> 0, message.mtime.high >>> 0).toNumber() : message.mtime;
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        object.mode = message.mode;
                    return object;
                };

                /**
                 * Converts this FileStat to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.FileStat
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FileStat.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FileStat
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.FileStat
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FileStat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.FileStat";
                };

                return FileStat;
            })();

            v1.StatFileResponse = (function() {

                /**
                 * Properties of a StatFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IStatFileResponse
                 * @property {tilbo.ipc.v1.IFileStat|null} [stat] StatFileResponse stat
                 */

                /**
                 * Constructs a new StatFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a StatFileResponse.
                 * @implements IStatFileResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IStatFileResponse=} [properties] Properties to set
                 */
                function StatFileResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * StatFileResponse stat.
                 * @member {tilbo.ipc.v1.IFileStat|null|undefined} stat
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @instance
                 */
                StatFileResponse.prototype.stat = null;

                /**
                 * Creates a new StatFileResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.StatFileResponse} StatFileResponse instance
                 */
                StatFileResponse.create = function create(properties) {
                    return new StatFileResponse(properties);
                };

                /**
                 * Encodes the specified StatFileResponse message. Does not implicitly {@link tilbo.ipc.v1.StatFileResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileResponse} message StatFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatFileResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.stat != null && Object.hasOwnProperty.call(message, "stat"))
                        $root.tilbo.ipc.v1.FileStat.encode(message.stat, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified StatFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.StatFileResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IStatFileResponse} message StatFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                StatFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a StatFileResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.StatFileResponse} StatFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatFileResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.StatFileResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.stat = $root.tilbo.ipc.v1.FileStat.decode(reader, reader.uint32());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a StatFileResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.StatFileResponse} StatFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                StatFileResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a StatFileResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                StatFileResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.stat != null && message.hasOwnProperty("stat")) {
                        let error = $root.tilbo.ipc.v1.FileStat.verify(message.stat);
                        if (error)
                            return "stat." + error;
                    }
                    return null;
                };

                /**
                 * Creates a StatFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.StatFileResponse} StatFileResponse
                 */
                StatFileResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.StatFileResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.StatFileResponse();
                    if (object.stat != null) {
                        if (typeof object.stat !== "object")
                            throw TypeError(".tilbo.ipc.v1.StatFileResponse.stat: object expected");
                        message.stat = $root.tilbo.ipc.v1.FileStat.fromObject(object.stat);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a StatFileResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.StatFileResponse} message StatFileResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                StatFileResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.stat = null;
                    if (message.stat != null && message.hasOwnProperty("stat"))
                        object.stat = $root.tilbo.ipc.v1.FileStat.toObject(message.stat, options);
                    return object;
                };

                /**
                 * Converts this StatFileResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                StatFileResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for StatFileResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.StatFileResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                StatFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.StatFileResponse";
                };

                return StatFileResponse;
            })();

            v1.GlobSearchRequest = (function() {

                /**
                 * Properties of a GlobSearchRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IGlobSearchRequest
                 * @property {Array.<string>|null} [patterns] GlobSearchRequest patterns
                 * @property {number|null} [limit] GlobSearchRequest limit
                 * @property {boolean|null} [allowHidden] GlobSearchRequest allowHidden
                 */

                /**
                 * Constructs a new GlobSearchRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a GlobSearchRequest.
                 * @implements IGlobSearchRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IGlobSearchRequest=} [properties] Properties to set
                 */
                function GlobSearchRequest(properties) {
                    this.patterns = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GlobSearchRequest patterns.
                 * @member {Array.<string>} patterns
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @instance
                 */
                GlobSearchRequest.prototype.patterns = $util.emptyArray;

                /**
                 * GlobSearchRequest limit.
                 * @member {number} limit
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @instance
                 */
                GlobSearchRequest.prototype.limit = 0;

                /**
                 * GlobSearchRequest allowHidden.
                 * @member {boolean} allowHidden
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @instance
                 */
                GlobSearchRequest.prototype.allowHidden = false;

                /**
                 * Creates a new GlobSearchRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.GlobSearchRequest} GlobSearchRequest instance
                 */
                GlobSearchRequest.create = function create(properties) {
                    return new GlobSearchRequest(properties);
                };

                /**
                 * Encodes the specified GlobSearchRequest message. Does not implicitly {@link tilbo.ipc.v1.GlobSearchRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchRequest} message GlobSearchRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GlobSearchRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.patterns != null && message.patterns.length)
                        for (let i = 0; i < message.patterns.length; ++i)
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.patterns[i]);
                    if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.limit);
                    if (message.allowHidden != null && Object.hasOwnProperty.call(message, "allowHidden"))
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.allowHidden);
                    return writer;
                };

                /**
                 * Encodes the specified GlobSearchRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GlobSearchRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchRequest} message GlobSearchRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GlobSearchRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GlobSearchRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.GlobSearchRequest} GlobSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GlobSearchRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GlobSearchRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.patterns && message.patterns.length))
                                    message.patterns = [];
                                message.patterns.push(reader.string());
                                break;
                            }
                        case 2: {
                                message.limit = reader.uint32();
                                break;
                            }
                        case 3: {
                                message.allowHidden = reader.bool();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GlobSearchRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.GlobSearchRequest} GlobSearchRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GlobSearchRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GlobSearchRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                GlobSearchRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.patterns != null && message.hasOwnProperty("patterns")) {
                        if (!Array.isArray(message.patterns))
                            return "patterns: array expected";
                        for (let i = 0; i < message.patterns.length; ++i)
                            if (!$util.isString(message.patterns[i]))
                                return "patterns: string[] expected";
                    }
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        if (!$util.isInteger(message.limit))
                            return "limit: integer expected";
                    if (message.allowHidden != null && message.hasOwnProperty("allowHidden"))
                        if (typeof message.allowHidden !== "boolean")
                            return "allowHidden: boolean expected";
                    return null;
                };

                /**
                 * Creates a GlobSearchRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.GlobSearchRequest} GlobSearchRequest
                 */
                GlobSearchRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.GlobSearchRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.GlobSearchRequest();
                    if (object.patterns) {
                        if (!Array.isArray(object.patterns))
                            throw TypeError(".tilbo.ipc.v1.GlobSearchRequest.patterns: array expected");
                        message.patterns = [];
                        for (let i = 0; i < object.patterns.length; ++i)
                            message.patterns[i] = String(object.patterns[i]);
                    }
                    if (object.limit != null)
                        message.limit = object.limit >>> 0;
                    if (object.allowHidden != null)
                        message.allowHidden = Boolean(object.allowHidden);
                    return message;
                };

                /**
                 * Creates a plain object from a GlobSearchRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {tilbo.ipc.v1.GlobSearchRequest} message GlobSearchRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GlobSearchRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.patterns = [];
                    if (options.defaults) {
                        object.limit = 0;
                        object.allowHidden = false;
                    }
                    if (message.patterns && message.patterns.length) {
                        object.patterns = [];
                        for (let j = 0; j < message.patterns.length; ++j)
                            object.patterns[j] = message.patterns[j];
                    }
                    if (message.limit != null && message.hasOwnProperty("limit"))
                        object.limit = message.limit;
                    if (message.allowHidden != null && message.hasOwnProperty("allowHidden"))
                        object.allowHidden = message.allowHidden;
                    return object;
                };

                /**
                 * Converts this GlobSearchRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GlobSearchRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for GlobSearchRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.GlobSearchRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                GlobSearchRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.GlobSearchRequest";
                };

                return GlobSearchRequest;
            })();

            v1.GlobSearchResponse = (function() {

                /**
                 * Properties of a GlobSearchResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IGlobSearchResponse
                 * @property {Array.<tilbo.ipc.v1.IFileResult>|null} [files] GlobSearchResponse files
                 */

                /**
                 * Constructs a new GlobSearchResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a GlobSearchResponse.
                 * @implements IGlobSearchResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IGlobSearchResponse=} [properties] Properties to set
                 */
                function GlobSearchResponse(properties) {
                    this.files = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GlobSearchResponse files.
                 * @member {Array.<tilbo.ipc.v1.IFileResult>} files
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @instance
                 */
                GlobSearchResponse.prototype.files = $util.emptyArray;

                /**
                 * Creates a new GlobSearchResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.GlobSearchResponse} GlobSearchResponse instance
                 */
                GlobSearchResponse.create = function create(properties) {
                    return new GlobSearchResponse(properties);
                };

                /**
                 * Encodes the specified GlobSearchResponse message. Does not implicitly {@link tilbo.ipc.v1.GlobSearchResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchResponse} message GlobSearchResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GlobSearchResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.files != null && message.files.length)
                        for (let i = 0; i < message.files.length; ++i)
                            $root.tilbo.ipc.v1.FileResult.encode(message.files[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified GlobSearchResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.GlobSearchResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.IGlobSearchResponse} message GlobSearchResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GlobSearchResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GlobSearchResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.GlobSearchResponse} GlobSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GlobSearchResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.GlobSearchResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.files && message.files.length))
                                    message.files = [];
                                message.files.push($root.tilbo.ipc.v1.FileResult.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GlobSearchResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.GlobSearchResponse} GlobSearchResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GlobSearchResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GlobSearchResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                GlobSearchResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.files != null && message.hasOwnProperty("files")) {
                        if (!Array.isArray(message.files))
                            return "files: array expected";
                        for (let i = 0; i < message.files.length; ++i) {
                            let error = $root.tilbo.ipc.v1.FileResult.verify(message.files[i]);
                            if (error)
                                return "files." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a GlobSearchResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.GlobSearchResponse} GlobSearchResponse
                 */
                GlobSearchResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.GlobSearchResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.GlobSearchResponse();
                    if (object.files) {
                        if (!Array.isArray(object.files))
                            throw TypeError(".tilbo.ipc.v1.GlobSearchResponse.files: array expected");
                        message.files = [];
                        for (let i = 0; i < object.files.length; ++i) {
                            if (typeof object.files[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.GlobSearchResponse.files: object expected");
                            message.files[i] = $root.tilbo.ipc.v1.FileResult.fromObject(object.files[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a GlobSearchResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {tilbo.ipc.v1.GlobSearchResponse} message GlobSearchResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GlobSearchResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.files = [];
                    if (message.files && message.files.length) {
                        object.files = [];
                        for (let j = 0; j < message.files.length; ++j)
                            object.files[j] = $root.tilbo.ipc.v1.FileResult.toObject(message.files[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this GlobSearchResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GlobSearchResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for GlobSearchResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.GlobSearchResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                GlobSearchResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.GlobSearchResponse";
                };

                return GlobSearchResponse;
            })();

            v1.RenameFileRequest = (function() {

                /**
                 * Properties of a RenameFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IRenameFileRequest
                 * @property {string|null} [path] RenameFileRequest path
                 * @property {string|null} [newName] RenameFileRequest newName
                 */

                /**
                 * Constructs a new RenameFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a RenameFileRequest.
                 * @implements IRenameFileRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IRenameFileRequest=} [properties] Properties to set
                 */
                function RenameFileRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * RenameFileRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @instance
                 */
                RenameFileRequest.prototype.path = "";

                /**
                 * RenameFileRequest newName.
                 * @member {string} newName
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @instance
                 */
                RenameFileRequest.prototype.newName = "";

                /**
                 * Creates a new RenameFileRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.RenameFileRequest} RenameFileRequest instance
                 */
                RenameFileRequest.create = function create(properties) {
                    return new RenameFileRequest(properties);
                };

                /**
                 * Encodes the specified RenameFileRequest message. Does not implicitly {@link tilbo.ipc.v1.RenameFileRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileRequest} message RenameFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RenameFileRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.newName != null && Object.hasOwnProperty.call(message, "newName"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.newName);
                    return writer;
                };

                /**
                 * Encodes the specified RenameFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RenameFileRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileRequest} message RenameFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RenameFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a RenameFileRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.RenameFileRequest} RenameFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RenameFileRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RenameFileRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                message.newName = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a RenameFileRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.RenameFileRequest} RenameFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RenameFileRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a RenameFileRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                RenameFileRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.newName != null && message.hasOwnProperty("newName"))
                        if (!$util.isString(message.newName))
                            return "newName: string expected";
                    return null;
                };

                /**
                 * Creates a RenameFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.RenameFileRequest} RenameFileRequest
                 */
                RenameFileRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.RenameFileRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.RenameFileRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.newName != null)
                        message.newName = String(object.newName);
                    return message;
                };

                /**
                 * Creates a plain object from a RenameFileRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.RenameFileRequest} message RenameFileRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RenameFileRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.path = "";
                        object.newName = "";
                    }
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.newName != null && message.hasOwnProperty("newName"))
                        object.newName = message.newName;
                    return object;
                };

                /**
                 * Converts this RenameFileRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RenameFileRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for RenameFileRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.RenameFileRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                RenameFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.RenameFileRequest";
                };

                return RenameFileRequest;
            })();

            v1.RenameFileResponse = (function() {

                /**
                 * Properties of a RenameFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IRenameFileResponse
                 * @property {string|null} [newPath] RenameFileResponse newPath
                 */

                /**
                 * Constructs a new RenameFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a RenameFileResponse.
                 * @implements IRenameFileResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IRenameFileResponse=} [properties] Properties to set
                 */
                function RenameFileResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * RenameFileResponse newPath.
                 * @member {string} newPath
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @instance
                 */
                RenameFileResponse.prototype.newPath = "";

                /**
                 * Creates a new RenameFileResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.RenameFileResponse} RenameFileResponse instance
                 */
                RenameFileResponse.create = function create(properties) {
                    return new RenameFileResponse(properties);
                };

                /**
                 * Encodes the specified RenameFileResponse message. Does not implicitly {@link tilbo.ipc.v1.RenameFileResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileResponse} message RenameFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RenameFileResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.newPath != null && Object.hasOwnProperty.call(message, "newPath"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.newPath);
                    return writer;
                };

                /**
                 * Encodes the specified RenameFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.RenameFileResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IRenameFileResponse} message RenameFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                RenameFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a RenameFileResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.RenameFileResponse} RenameFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RenameFileResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.RenameFileResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.newPath = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a RenameFileResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.RenameFileResponse} RenameFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                RenameFileResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a RenameFileResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                RenameFileResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.newPath != null && message.hasOwnProperty("newPath"))
                        if (!$util.isString(message.newPath))
                            return "newPath: string expected";
                    return null;
                };

                /**
                 * Creates a RenameFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.RenameFileResponse} RenameFileResponse
                 */
                RenameFileResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.RenameFileResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.RenameFileResponse();
                    if (object.newPath != null)
                        message.newPath = String(object.newPath);
                    return message;
                };

                /**
                 * Creates a plain object from a RenameFileResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.RenameFileResponse} message RenameFileResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                RenameFileResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.newPath = "";
                    if (message.newPath != null && message.hasOwnProperty("newPath"))
                        object.newPath = message.newPath;
                    return object;
                };

                /**
                 * Converts this RenameFileResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                RenameFileResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for RenameFileResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.RenameFileResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                RenameFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.RenameFileResponse";
                };

                return RenameFileResponse;
            })();

            v1.DeleteFileRequest = (function() {

                /**
                 * Properties of a DeleteFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IDeleteFileRequest
                 * @property {string|null} [path] DeleteFileRequest path
                 */

                /**
                 * Constructs a new DeleteFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a DeleteFileRequest.
                 * @implements IDeleteFileRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IDeleteFileRequest=} [properties] Properties to set
                 */
                function DeleteFileRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DeleteFileRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @instance
                 */
                DeleteFileRequest.prototype.path = "";

                /**
                 * Creates a new DeleteFileRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.DeleteFileRequest} DeleteFileRequest instance
                 */
                DeleteFileRequest.create = function create(properties) {
                    return new DeleteFileRequest(properties);
                };

                /**
                 * Encodes the specified DeleteFileRequest message. Does not implicitly {@link tilbo.ipc.v1.DeleteFileRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileRequest} message DeleteFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DeleteFileRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    return writer;
                };

                /**
                 * Encodes the specified DeleteFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DeleteFileRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileRequest} message DeleteFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DeleteFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DeleteFileRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.DeleteFileRequest} DeleteFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DeleteFileRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DeleteFileRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DeleteFileRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.DeleteFileRequest} DeleteFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DeleteFileRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DeleteFileRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DeleteFileRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    return null;
                };

                /**
                 * Creates a DeleteFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.DeleteFileRequest} DeleteFileRequest
                 */
                DeleteFileRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.DeleteFileRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.DeleteFileRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    return message;
                };

                /**
                 * Creates a plain object from a DeleteFileRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.DeleteFileRequest} message DeleteFileRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DeleteFileRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    return object;
                };

                /**
                 * Converts this DeleteFileRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DeleteFileRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DeleteFileRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.DeleteFileRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DeleteFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.DeleteFileRequest";
                };

                return DeleteFileRequest;
            })();

            v1.DeleteFileResponse = (function() {

                /**
                 * Properties of a DeleteFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IDeleteFileResponse
                 */

                /**
                 * Constructs a new DeleteFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a DeleteFileResponse.
                 * @implements IDeleteFileResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IDeleteFileResponse=} [properties] Properties to set
                 */
                function DeleteFileResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new DeleteFileResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.DeleteFileResponse} DeleteFileResponse instance
                 */
                DeleteFileResponse.create = function create(properties) {
                    return new DeleteFileResponse(properties);
                };

                /**
                 * Encodes the specified DeleteFileResponse message. Does not implicitly {@link tilbo.ipc.v1.DeleteFileResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileResponse} message DeleteFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DeleteFileResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified DeleteFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DeleteFileResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IDeleteFileResponse} message DeleteFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DeleteFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DeleteFileResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.DeleteFileResponse} DeleteFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DeleteFileResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DeleteFileResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DeleteFileResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.DeleteFileResponse} DeleteFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DeleteFileResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DeleteFileResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DeleteFileResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a DeleteFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.DeleteFileResponse} DeleteFileResponse
                 */
                DeleteFileResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.DeleteFileResponse)
                        return object;
                    return new $root.tilbo.ipc.v1.DeleteFileResponse();
                };

                /**
                 * Creates a plain object from a DeleteFileResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.DeleteFileResponse} message DeleteFileResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DeleteFileResponse.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this DeleteFileResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DeleteFileResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DeleteFileResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.DeleteFileResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DeleteFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.DeleteFileResponse";
                };

                return DeleteFileResponse;
            })();

            v1.ChmodFileRequest = (function() {

                /**
                 * Properties of a ChmodFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IChmodFileRequest
                 * @property {string|null} [path] ChmodFileRequest path
                 * @property {number|null} [mode] ChmodFileRequest mode
                 */

                /**
                 * Constructs a new ChmodFileRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ChmodFileRequest.
                 * @implements IChmodFileRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IChmodFileRequest=} [properties] Properties to set
                 */
                function ChmodFileRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ChmodFileRequest path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @instance
                 */
                ChmodFileRequest.prototype.path = "";

                /**
                 * ChmodFileRequest mode.
                 * @member {number} mode
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @instance
                 */
                ChmodFileRequest.prototype.mode = 0;

                /**
                 * Creates a new ChmodFileRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ChmodFileRequest} ChmodFileRequest instance
                 */
                ChmodFileRequest.create = function create(properties) {
                    return new ChmodFileRequest(properties);
                };

                /**
                 * Encodes the specified ChmodFileRequest message. Does not implicitly {@link tilbo.ipc.v1.ChmodFileRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileRequest} message ChmodFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChmodFileRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.mode != null && Object.hasOwnProperty.call(message, "mode"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.mode);
                    return writer;
                };

                /**
                 * Encodes the specified ChmodFileRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ChmodFileRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileRequest} message ChmodFileRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChmodFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ChmodFileRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ChmodFileRequest} ChmodFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChmodFileRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ChmodFileRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                message.mode = reader.uint32();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ChmodFileRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ChmodFileRequest} ChmodFileRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChmodFileRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ChmodFileRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ChmodFileRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        if (!$util.isInteger(message.mode))
                            return "mode: integer expected";
                    return null;
                };

                /**
                 * Creates a ChmodFileRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ChmodFileRequest} ChmodFileRequest
                 */
                ChmodFileRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ChmodFileRequest)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ChmodFileRequest();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.mode != null)
                        message.mode = object.mode >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a ChmodFileRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {tilbo.ipc.v1.ChmodFileRequest} message ChmodFileRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ChmodFileRequest.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.path = "";
                        object.mode = 0;
                    }
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.mode != null && message.hasOwnProperty("mode"))
                        object.mode = message.mode;
                    return object;
                };

                /**
                 * Converts this ChmodFileRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ChmodFileRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ChmodFileRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ChmodFileRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ChmodFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ChmodFileRequest";
                };

                return ChmodFileRequest;
            })();

            v1.ChmodFileResponse = (function() {

                /**
                 * Properties of a ChmodFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IChmodFileResponse
                 */

                /**
                 * Constructs a new ChmodFileResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ChmodFileResponse.
                 * @implements IChmodFileResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IChmodFileResponse=} [properties] Properties to set
                 */
                function ChmodFileResponse(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new ChmodFileResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ChmodFileResponse} ChmodFileResponse instance
                 */
                ChmodFileResponse.create = function create(properties) {
                    return new ChmodFileResponse(properties);
                };

                /**
                 * Encodes the specified ChmodFileResponse message. Does not implicitly {@link tilbo.ipc.v1.ChmodFileResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileResponse} message ChmodFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChmodFileResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified ChmodFileResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ChmodFileResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.IChmodFileResponse} message ChmodFileResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ChmodFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ChmodFileResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ChmodFileResponse} ChmodFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChmodFileResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ChmodFileResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ChmodFileResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ChmodFileResponse} ChmodFileResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ChmodFileResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ChmodFileResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ChmodFileResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a ChmodFileResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ChmodFileResponse} ChmodFileResponse
                 */
                ChmodFileResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ChmodFileResponse)
                        return object;
                    return new $root.tilbo.ipc.v1.ChmodFileResponse();
                };

                /**
                 * Creates a plain object from a ChmodFileResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {tilbo.ipc.v1.ChmodFileResponse} message ChmodFileResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ChmodFileResponse.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this ChmodFileResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ChmodFileResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ChmodFileResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ChmodFileResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ChmodFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ChmodFileResponse";
                };

                return ChmodFileResponse;
            })();

            v1.ListPlacesRequest = (function() {

                /**
                 * Properties of a ListPlacesRequest.
                 * @memberof tilbo.ipc.v1
                 * @interface IListPlacesRequest
                 */

                /**
                 * Constructs a new ListPlacesRequest.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListPlacesRequest.
                 * @implements IListPlacesRequest
                 * @constructor
                 * @param {tilbo.ipc.v1.IListPlacesRequest=} [properties] Properties to set
                 */
                function ListPlacesRequest(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Creates a new ListPlacesRequest instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesRequest=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListPlacesRequest} ListPlacesRequest instance
                 */
                ListPlacesRequest.create = function create(properties) {
                    return new ListPlacesRequest(properties);
                };

                /**
                 * Encodes the specified ListPlacesRequest message. Does not implicitly {@link tilbo.ipc.v1.ListPlacesRequest.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesRequest} message ListPlacesRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListPlacesRequest.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    return writer;
                };

                /**
                 * Encodes the specified ListPlacesRequest message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListPlacesRequest.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesRequest} message ListPlacesRequest message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListPlacesRequest.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListPlacesRequest message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListPlacesRequest} ListPlacesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListPlacesRequest.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListPlacesRequest();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListPlacesRequest message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListPlacesRequest} ListPlacesRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListPlacesRequest.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListPlacesRequest message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListPlacesRequest.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    return null;
                };

                /**
                 * Creates a ListPlacesRequest message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListPlacesRequest} ListPlacesRequest
                 */
                ListPlacesRequest.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListPlacesRequest)
                        return object;
                    return new $root.tilbo.ipc.v1.ListPlacesRequest();
                };

                /**
                 * Creates a plain object from a ListPlacesRequest message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {tilbo.ipc.v1.ListPlacesRequest} message ListPlacesRequest
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListPlacesRequest.toObject = function toObject() {
                    return {};
                };

                /**
                 * Converts this ListPlacesRequest to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListPlacesRequest.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListPlacesRequest
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListPlacesRequest
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListPlacesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListPlacesRequest";
                };

                return ListPlacesRequest;
            })();

            v1.PlaceEntry = (function() {

                /**
                 * Properties of a PlaceEntry.
                 * @memberof tilbo.ipc.v1
                 * @interface IPlaceEntry
                 * @property {string|null} [name] PlaceEntry name
                 * @property {string|null} [path] PlaceEntry path
                 */

                /**
                 * Constructs a new PlaceEntry.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a PlaceEntry.
                 * @implements IPlaceEntry
                 * @constructor
                 * @param {tilbo.ipc.v1.IPlaceEntry=} [properties] Properties to set
                 */
                function PlaceEntry(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * PlaceEntry name.
                 * @member {string} name
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @instance
                 */
                PlaceEntry.prototype.name = "";

                /**
                 * PlaceEntry path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @instance
                 */
                PlaceEntry.prototype.path = "";

                /**
                 * Creates a new PlaceEntry instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {tilbo.ipc.v1.IPlaceEntry=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.PlaceEntry} PlaceEntry instance
                 */
                PlaceEntry.create = function create(properties) {
                    return new PlaceEntry(properties);
                };

                /**
                 * Encodes the specified PlaceEntry message. Does not implicitly {@link tilbo.ipc.v1.PlaceEntry.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {tilbo.ipc.v1.IPlaceEntry} message PlaceEntry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PlaceEntry.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.path);
                    return writer;
                };

                /**
                 * Encodes the specified PlaceEntry message, length delimited. Does not implicitly {@link tilbo.ipc.v1.PlaceEntry.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {tilbo.ipc.v1.IPlaceEntry} message PlaceEntry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                PlaceEntry.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a PlaceEntry message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.PlaceEntry} PlaceEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PlaceEntry.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.PlaceEntry();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.name = reader.string();
                                break;
                            }
                        case 2: {
                                message.path = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a PlaceEntry message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.PlaceEntry} PlaceEntry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                PlaceEntry.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a PlaceEntry message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                PlaceEntry.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.name != null && message.hasOwnProperty("name"))
                        if (!$util.isString(message.name))
                            return "name: string expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    return null;
                };

                /**
                 * Creates a PlaceEntry message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.PlaceEntry} PlaceEntry
                 */
                PlaceEntry.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.PlaceEntry)
                        return object;
                    let message = new $root.tilbo.ipc.v1.PlaceEntry();
                    if (object.name != null)
                        message.name = String(object.name);
                    if (object.path != null)
                        message.path = String(object.path);
                    return message;
                };

                /**
                 * Creates a plain object from a PlaceEntry message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {tilbo.ipc.v1.PlaceEntry} message PlaceEntry
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                PlaceEntry.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.name = "";
                        object.path = "";
                    }
                    if (message.name != null && message.hasOwnProperty("name"))
                        object.name = message.name;
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    return object;
                };

                /**
                 * Converts this PlaceEntry to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                PlaceEntry.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for PlaceEntry
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.PlaceEntry
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                PlaceEntry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.PlaceEntry";
                };

                return PlaceEntry;
            })();

            v1.ListPlacesResponse = (function() {

                /**
                 * Properties of a ListPlacesResponse.
                 * @memberof tilbo.ipc.v1
                 * @interface IListPlacesResponse
                 * @property {Array.<tilbo.ipc.v1.IPlaceEntry>|null} [places] ListPlacesResponse places
                 */

                /**
                 * Constructs a new ListPlacesResponse.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a ListPlacesResponse.
                 * @implements IListPlacesResponse
                 * @constructor
                 * @param {tilbo.ipc.v1.IListPlacesResponse=} [properties] Properties to set
                 */
                function ListPlacesResponse(properties) {
                    this.places = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * ListPlacesResponse places.
                 * @member {Array.<tilbo.ipc.v1.IPlaceEntry>} places
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @instance
                 */
                ListPlacesResponse.prototype.places = $util.emptyArray;

                /**
                 * Creates a new ListPlacesResponse instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesResponse=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.ListPlacesResponse} ListPlacesResponse instance
                 */
                ListPlacesResponse.create = function create(properties) {
                    return new ListPlacesResponse(properties);
                };

                /**
                 * Encodes the specified ListPlacesResponse message. Does not implicitly {@link tilbo.ipc.v1.ListPlacesResponse.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesResponse} message ListPlacesResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListPlacesResponse.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.places != null && message.places.length)
                        for (let i = 0; i < message.places.length; ++i)
                            $root.tilbo.ipc.v1.PlaceEntry.encode(message.places[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    return writer;
                };

                /**
                 * Encodes the specified ListPlacesResponse message, length delimited. Does not implicitly {@link tilbo.ipc.v1.ListPlacesResponse.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {tilbo.ipc.v1.IListPlacesResponse} message ListPlacesResponse message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                ListPlacesResponse.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a ListPlacesResponse message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.ListPlacesResponse} ListPlacesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListPlacesResponse.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.ListPlacesResponse();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                if (!(message.places && message.places.length))
                                    message.places = [];
                                message.places.push($root.tilbo.ipc.v1.PlaceEntry.decode(reader, reader.uint32()));
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a ListPlacesResponse message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.ListPlacesResponse} ListPlacesResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                ListPlacesResponse.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a ListPlacesResponse message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                ListPlacesResponse.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.places != null && message.hasOwnProperty("places")) {
                        if (!Array.isArray(message.places))
                            return "places: array expected";
                        for (let i = 0; i < message.places.length; ++i) {
                            let error = $root.tilbo.ipc.v1.PlaceEntry.verify(message.places[i]);
                            if (error)
                                return "places." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates a ListPlacesResponse message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.ListPlacesResponse} ListPlacesResponse
                 */
                ListPlacesResponse.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.ListPlacesResponse)
                        return object;
                    let message = new $root.tilbo.ipc.v1.ListPlacesResponse();
                    if (object.places) {
                        if (!Array.isArray(object.places))
                            throw TypeError(".tilbo.ipc.v1.ListPlacesResponse.places: array expected");
                        message.places = [];
                        for (let i = 0; i < object.places.length; ++i) {
                            if (typeof object.places[i] !== "object")
                                throw TypeError(".tilbo.ipc.v1.ListPlacesResponse.places: object expected");
                            message.places[i] = $root.tilbo.ipc.v1.PlaceEntry.fromObject(object.places[i]);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a ListPlacesResponse message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {tilbo.ipc.v1.ListPlacesResponse} message ListPlacesResponse
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                ListPlacesResponse.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.places = [];
                    if (message.places && message.places.length) {
                        object.places = [];
                        for (let j = 0; j < message.places.length; ++j)
                            object.places[j] = $root.tilbo.ipc.v1.PlaceEntry.toObject(message.places[j], options);
                    }
                    return object;
                };

                /**
                 * Converts this ListPlacesResponse to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                ListPlacesResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for ListPlacesResponse
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.ListPlacesResponse
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                ListPlacesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.ListPlacesResponse";
                };

                return ListPlacesResponse;
            })();

            v1.FileTaggedEvent = (function() {

                /**
                 * Properties of a FileTaggedEvent.
                 * @memberof tilbo.ipc.v1
                 * @interface IFileTaggedEvent
                 * @property {string|null} [path] FileTaggedEvent path
                 * @property {Array.<string>|null} [added] FileTaggedEvent added
                 * @property {Array.<string>|null} [removed] FileTaggedEvent removed
                 */

                /**
                 * Constructs a new FileTaggedEvent.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a FileTaggedEvent.
                 * @implements IFileTaggedEvent
                 * @constructor
                 * @param {tilbo.ipc.v1.IFileTaggedEvent=} [properties] Properties to set
                 */
                function FileTaggedEvent(properties) {
                    this.added = [];
                    this.removed = [];
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * FileTaggedEvent path.
                 * @member {string} path
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @instance
                 */
                FileTaggedEvent.prototype.path = "";

                /**
                 * FileTaggedEvent added.
                 * @member {Array.<string>} added
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @instance
                 */
                FileTaggedEvent.prototype.added = $util.emptyArray;

                /**
                 * FileTaggedEvent removed.
                 * @member {Array.<string>} removed
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @instance
                 */
                FileTaggedEvent.prototype.removed = $util.emptyArray;

                /**
                 * Creates a new FileTaggedEvent instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IFileTaggedEvent=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.FileTaggedEvent} FileTaggedEvent instance
                 */
                FileTaggedEvent.create = function create(properties) {
                    return new FileTaggedEvent(properties);
                };

                /**
                 * Encodes the specified FileTaggedEvent message. Does not implicitly {@link tilbo.ipc.v1.FileTaggedEvent.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IFileTaggedEvent} message FileTaggedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileTaggedEvent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
                    if (message.added != null && message.added.length)
                        for (let i = 0; i < message.added.length; ++i)
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.added[i]);
                    if (message.removed != null && message.removed.length)
                        for (let i = 0; i < message.removed.length; ++i)
                            writer.uint32(/* id 3, wireType 2 =*/26).string(message.removed[i]);
                    return writer;
                };

                /**
                 * Encodes the specified FileTaggedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.FileTaggedEvent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IFileTaggedEvent} message FileTaggedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                FileTaggedEvent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a FileTaggedEvent message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.FileTaggedEvent} FileTaggedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileTaggedEvent.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.FileTaggedEvent();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.path = reader.string();
                                break;
                            }
                        case 2: {
                                if (!(message.added && message.added.length))
                                    message.added = [];
                                message.added.push(reader.string());
                                break;
                            }
                        case 3: {
                                if (!(message.removed && message.removed.length))
                                    message.removed = [];
                                message.removed.push(reader.string());
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a FileTaggedEvent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.FileTaggedEvent} FileTaggedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                FileTaggedEvent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a FileTaggedEvent message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                FileTaggedEvent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.path != null && message.hasOwnProperty("path"))
                        if (!$util.isString(message.path))
                            return "path: string expected";
                    if (message.added != null && message.hasOwnProperty("added")) {
                        if (!Array.isArray(message.added))
                            return "added: array expected";
                        for (let i = 0; i < message.added.length; ++i)
                            if (!$util.isString(message.added[i]))
                                return "added: string[] expected";
                    }
                    if (message.removed != null && message.hasOwnProperty("removed")) {
                        if (!Array.isArray(message.removed))
                            return "removed: array expected";
                        for (let i = 0; i < message.removed.length; ++i)
                            if (!$util.isString(message.removed[i]))
                                return "removed: string[] expected";
                    }
                    return null;
                };

                /**
                 * Creates a FileTaggedEvent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.FileTaggedEvent} FileTaggedEvent
                 */
                FileTaggedEvent.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.FileTaggedEvent)
                        return object;
                    let message = new $root.tilbo.ipc.v1.FileTaggedEvent();
                    if (object.path != null)
                        message.path = String(object.path);
                    if (object.added) {
                        if (!Array.isArray(object.added))
                            throw TypeError(".tilbo.ipc.v1.FileTaggedEvent.added: array expected");
                        message.added = [];
                        for (let i = 0; i < object.added.length; ++i)
                            message.added[i] = String(object.added[i]);
                    }
                    if (object.removed) {
                        if (!Array.isArray(object.removed))
                            throw TypeError(".tilbo.ipc.v1.FileTaggedEvent.removed: array expected");
                        message.removed = [];
                        for (let i = 0; i < object.removed.length; ++i)
                            message.removed[i] = String(object.removed[i]);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a FileTaggedEvent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {tilbo.ipc.v1.FileTaggedEvent} message FileTaggedEvent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                FileTaggedEvent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.added = [];
                        object.removed = [];
                    }
                    if (options.defaults)
                        object.path = "";
                    if (message.path != null && message.hasOwnProperty("path"))
                        object.path = message.path;
                    if (message.added && message.added.length) {
                        object.added = [];
                        for (let j = 0; j < message.added.length; ++j)
                            object.added[j] = message.added[j];
                    }
                    if (message.removed && message.removed.length) {
                        object.removed = [];
                        for (let j = 0; j < message.removed.length; ++j)
                            object.removed[j] = message.removed[j];
                    }
                    return object;
                };

                /**
                 * Converts this FileTaggedEvent to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                FileTaggedEvent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for FileTaggedEvent
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.FileTaggedEvent
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                FileTaggedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.FileTaggedEvent";
                };

                return FileTaggedEvent;
            })();

            v1.IndexUpdatedEvent = (function() {

                /**
                 * Properties of an IndexUpdatedEvent.
                 * @memberof tilbo.ipc.v1
                 * @interface IIndexUpdatedEvent
                 * @property {number|Long|null} [filesTotal] IndexUpdatedEvent filesTotal
                 * @property {number|Long|null} [tagsTotal] IndexUpdatedEvent tagsTotal
                 */

                /**
                 * Constructs a new IndexUpdatedEvent.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents an IndexUpdatedEvent.
                 * @implements IIndexUpdatedEvent
                 * @constructor
                 * @param {tilbo.ipc.v1.IIndexUpdatedEvent=} [properties] Properties to set
                 */
                function IndexUpdatedEvent(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * IndexUpdatedEvent filesTotal.
                 * @member {number|Long} filesTotal
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @instance
                 */
                IndexUpdatedEvent.prototype.filesTotal = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * IndexUpdatedEvent tagsTotal.
                 * @member {number|Long} tagsTotal
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @instance
                 */
                IndexUpdatedEvent.prototype.tagsTotal = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Creates a new IndexUpdatedEvent instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IIndexUpdatedEvent=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.IndexUpdatedEvent} IndexUpdatedEvent instance
                 */
                IndexUpdatedEvent.create = function create(properties) {
                    return new IndexUpdatedEvent(properties);
                };

                /**
                 * Encodes the specified IndexUpdatedEvent message. Does not implicitly {@link tilbo.ipc.v1.IndexUpdatedEvent.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IIndexUpdatedEvent} message IndexUpdatedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IndexUpdatedEvent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.filesTotal != null && Object.hasOwnProperty.call(message, "filesTotal"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.filesTotal);
                    if (message.tagsTotal != null && Object.hasOwnProperty.call(message, "tagsTotal"))
                        writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.tagsTotal);
                    return writer;
                };

                /**
                 * Encodes the specified IndexUpdatedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.IndexUpdatedEvent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IIndexUpdatedEvent} message IndexUpdatedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IndexUpdatedEvent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an IndexUpdatedEvent message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.IndexUpdatedEvent} IndexUpdatedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IndexUpdatedEvent.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.IndexUpdatedEvent();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.filesTotal = reader.uint64();
                                break;
                            }
                        case 2: {
                                message.tagsTotal = reader.uint64();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an IndexUpdatedEvent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.IndexUpdatedEvent} IndexUpdatedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IndexUpdatedEvent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an IndexUpdatedEvent message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                IndexUpdatedEvent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.filesTotal != null && message.hasOwnProperty("filesTotal"))
                        if (!$util.isInteger(message.filesTotal) && !(message.filesTotal && $util.isInteger(message.filesTotal.low) && $util.isInteger(message.filesTotal.high)))
                            return "filesTotal: integer|Long expected";
                    if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
                        if (!$util.isInteger(message.tagsTotal) && !(message.tagsTotal && $util.isInteger(message.tagsTotal.low) && $util.isInteger(message.tagsTotal.high)))
                            return "tagsTotal: integer|Long expected";
                    return null;
                };

                /**
                 * Creates an IndexUpdatedEvent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.IndexUpdatedEvent} IndexUpdatedEvent
                 */
                IndexUpdatedEvent.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.IndexUpdatedEvent)
                        return object;
                    let message = new $root.tilbo.ipc.v1.IndexUpdatedEvent();
                    if (object.filesTotal != null)
                        if ($util.Long)
                            (message.filesTotal = $util.Long.fromValue(object.filesTotal)).unsigned = true;
                        else if (typeof object.filesTotal === "string")
                            message.filesTotal = parseInt(object.filesTotal, 10);
                        else if (typeof object.filesTotal === "number")
                            message.filesTotal = object.filesTotal;
                        else if (typeof object.filesTotal === "object")
                            message.filesTotal = new $util.LongBits(object.filesTotal.low >>> 0, object.filesTotal.high >>> 0).toNumber(true);
                    if (object.tagsTotal != null)
                        if ($util.Long)
                            (message.tagsTotal = $util.Long.fromValue(object.tagsTotal)).unsigned = true;
                        else if (typeof object.tagsTotal === "string")
                            message.tagsTotal = parseInt(object.tagsTotal, 10);
                        else if (typeof object.tagsTotal === "number")
                            message.tagsTotal = object.tagsTotal;
                        else if (typeof object.tagsTotal === "object")
                            message.tagsTotal = new $util.LongBits(object.tagsTotal.low >>> 0, object.tagsTotal.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from an IndexUpdatedEvent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IndexUpdatedEvent} message IndexUpdatedEvent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                IndexUpdatedEvent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.filesTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.filesTotal = options.longs === String ? "0" : 0;
                        if ($util.Long) {
                            let long = new $util.Long(0, 0, true);
                            object.tagsTotal = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.tagsTotal = options.longs === String ? "0" : 0;
                    }
                    if (message.filesTotal != null && message.hasOwnProperty("filesTotal"))
                        if (typeof message.filesTotal === "number")
                            object.filesTotal = options.longs === String ? String(message.filesTotal) : message.filesTotal;
                        else
                            object.filesTotal = options.longs === String ? $util.Long.prototype.toString.call(message.filesTotal) : options.longs === Number ? new $util.LongBits(message.filesTotal.low >>> 0, message.filesTotal.high >>> 0).toNumber(true) : message.filesTotal;
                    if (message.tagsTotal != null && message.hasOwnProperty("tagsTotal"))
                        if (typeof message.tagsTotal === "number")
                            object.tagsTotal = options.longs === String ? String(message.tagsTotal) : message.tagsTotal;
                        else
                            object.tagsTotal = options.longs === String ? $util.Long.prototype.toString.call(message.tagsTotal) : options.longs === Number ? new $util.LongBits(message.tagsTotal.low >>> 0, message.tagsTotal.high >>> 0).toNumber(true) : message.tagsTotal;
                    return object;
                };

                /**
                 * Converts this IndexUpdatedEvent to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                IndexUpdatedEvent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for IndexUpdatedEvent
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.IndexUpdatedEvent
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                IndexUpdatedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.IndexUpdatedEvent";
                };

                return IndexUpdatedEvent;
            })();

            v1.DaemonStateChangedEvent = (function() {

                /**
                 * Properties of a DaemonStateChangedEvent.
                 * @memberof tilbo.ipc.v1
                 * @interface IDaemonStateChangedEvent
                 * @property {string|null} [state] DaemonStateChangedEvent state
                 */

                /**
                 * Constructs a new DaemonStateChangedEvent.
                 * @memberof tilbo.ipc.v1
                 * @classdesc Represents a DaemonStateChangedEvent.
                 * @implements IDaemonStateChangedEvent
                 * @constructor
                 * @param {tilbo.ipc.v1.IDaemonStateChangedEvent=} [properties] Properties to set
                 */
                function DaemonStateChangedEvent(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DaemonStateChangedEvent state.
                 * @member {string} state
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @instance
                 */
                DaemonStateChangedEvent.prototype.state = "";

                /**
                 * Creates a new DaemonStateChangedEvent instance using the specified properties.
                 * @function create
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IDaemonStateChangedEvent=} [properties] Properties to set
                 * @returns {tilbo.ipc.v1.DaemonStateChangedEvent} DaemonStateChangedEvent instance
                 */
                DaemonStateChangedEvent.create = function create(properties) {
                    return new DaemonStateChangedEvent(properties);
                };

                /**
                 * Encodes the specified DaemonStateChangedEvent message. Does not implicitly {@link tilbo.ipc.v1.DaemonStateChangedEvent.verify|verify} messages.
                 * @function encode
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IDaemonStateChangedEvent} message DaemonStateChangedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DaemonStateChangedEvent.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.state);
                    return writer;
                };

                /**
                 * Encodes the specified DaemonStateChangedEvent message, length delimited. Does not implicitly {@link tilbo.ipc.v1.DaemonStateChangedEvent.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {tilbo.ipc.v1.IDaemonStateChangedEvent} message DaemonStateChangedEvent message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DaemonStateChangedEvent.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DaemonStateChangedEvent message from the specified reader or buffer.
                 * @function decode
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {tilbo.ipc.v1.DaemonStateChangedEvent} DaemonStateChangedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DaemonStateChangedEvent.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.tilbo.ipc.v1.DaemonStateChangedEvent();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.state = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DaemonStateChangedEvent message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {tilbo.ipc.v1.DaemonStateChangedEvent} DaemonStateChangedEvent
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DaemonStateChangedEvent.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DaemonStateChangedEvent message.
                 * @function verify
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DaemonStateChangedEvent.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.state != null && message.hasOwnProperty("state"))
                        if (!$util.isString(message.state))
                            return "state: string expected";
                    return null;
                };

                /**
                 * Creates a DaemonStateChangedEvent message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {tilbo.ipc.v1.DaemonStateChangedEvent} DaemonStateChangedEvent
                 */
                DaemonStateChangedEvent.fromObject = function fromObject(object) {
                    if (object instanceof $root.tilbo.ipc.v1.DaemonStateChangedEvent)
                        return object;
                    let message = new $root.tilbo.ipc.v1.DaemonStateChangedEvent();
                    if (object.state != null)
                        message.state = String(object.state);
                    return message;
                };

                /**
                 * Creates a plain object from a DaemonStateChangedEvent message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {tilbo.ipc.v1.DaemonStateChangedEvent} message DaemonStateChangedEvent
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DaemonStateChangedEvent.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults)
                        object.state = "";
                    if (message.state != null && message.hasOwnProperty("state"))
                        object.state = message.state;
                    return object;
                };

                /**
                 * Converts this DaemonStateChangedEvent to JSON.
                 * @function toJSON
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DaemonStateChangedEvent.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for DaemonStateChangedEvent
                 * @function getTypeUrl
                 * @memberof tilbo.ipc.v1.DaemonStateChangedEvent
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                DaemonStateChangedEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/tilbo.ipc.v1.DaemonStateChangedEvent";
                };

                return DaemonStateChangedEvent;
            })();

            return v1;
        })();

        return ipc;
    })();

    return tilbo;
})();

export { $root as default };
