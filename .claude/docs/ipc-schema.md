# IPC Schema

## Transport

Unix domain socket at `/run/user/$UID/tilbo.sock`.

**Frame format:**
```
[4 bytes: little-endian uint32 message length][N bytes: protobuf-encoded message]
```

Each request and response is wrapped in an envelope with a request ID for multiplexing:

```protobuf
message Envelope {
  uint64 request_id = 1;
  oneof payload {
    Request  request  = 2;
    Response response = 3;
  }
}
```

## RPC Methods

### Search
```protobuf
message SearchRequest {
  repeated string tags        = 1;  // AND semantics by default
  bool            tags_any    = 2;  // set true for OR
  repeated string tag_exclude = 3;
  map<string,string> meta_filters = 4;  // key=op:value e.g. "width"="gte:1280"
  string          fts_query   = 5;
  uint32          limit       = 6;  // default 100
  uint32          offset      = 7;
  repeated string sort_by     = 8;  // e.g. ["mtime:desc", "name:asc"]
}

message FileResult {
  string          path        = 1;
  repeated string tags        = 2;
  map<string,string> metadata = 3;
  double          score       = 4;  // relevance score if fts or vector query
  int64           mtime       = 5;  // unix timestamp
  int64           size_bytes  = 6;
}

message SearchResponse {
  repeated FileResult files = 1;
  uint32              total = 2;  // total matching (before limit/offset)
}
```

### Tag Operations
```protobuf
enum TagOperation {
  TAG_ADD     = 0;
  TAG_REMOVE  = 1;
  TAG_SET     = 2;  // replace all tags
}

message TagRequest {
  repeated string paths     = 1;
  repeated string tags      = 2;
  TagOperation    operation = 3;
}

message TagResponse {
  repeated string paths_ok    = 1;
  repeated string paths_error = 2;
  map<string,string> errors   = 3;
}
```

### Metadata
```protobuf
message MetadataRequest {
  string path = 1;
}

message MetadataResponse {
  string             path     = 1;
  map<string,string> metadata = 2;
  map<string,string> sources  = 3;  // key → harvester name that produced it
}

message MetadataSetRequest {
  string path  = 1;
  string key   = 2;
  string value = 3;  // empty string to delete
}
```

### Related Files
```protobuf
message RelatedRequest {
  string seed_path   = 1;
  uint32 limit       = 2;  // default 20
  uint32 max_hops    = 3;  // default 3
  float  hop_weight  = 4;  // default 0.6
  float  vec_weight  = 5;  // default 0.4
}

message ScoredFile {
  FileResult file       = 1;
  double     score      = 2;
  uint32     hop_distance = 3;
  double     cosine_sim = 4;
}

message RelatedResponse {
  repeated ScoredFile files = 1;
}
```

### Daemon Control
```protobuf
enum DaemonState {
  STATE_IDLE     = 0;
  STATE_SCANNING = 1;
  STATE_READY    = 2;
  STATE_DEGRADED = 3;
}

message StatusResponse {
  DaemonState state           = 1;
  uint64      files_indexed   = 2;
  uint64      tags_total      = 3;
  float       index_size_mb   = 4;
  repeated string warnings    = 5;  // e.g. "FAN_RENAME unavailable, using fallback"
  int64       uptime_seconds  = 6;
}

message ReloadRulesResponse {
  uint32 rules_loaded  = 1;
  repeated string errors = 2;
}
```

## D-Bus Signals (daemon → broadcast)

Service: `com.example.tilbo.Daemon`
Object:  `/com/example/tilbo`
Interface: `com.example.tilbo.Daemon`

```
FileTagged(path: string, tags_added: []string, tags_removed: []string)
IndexUpdated(files_total: uint64, tags_total: uint64)
DaemonStateChanged(state: string)  -- "idle" | "scanning" | "ready" | "degraded"
```

## Browser D-Bus Interface

Service: `com.example.tilbo.Browser`
Object:  `/com/example/tilbo/Browser`
Interface: `com.example.tilbo.Browser`

```
Method Open(mode: string, args: string)
  mode: "browser" | "portal"
  args: JSON-encoded portal OpenFile args (when mode="portal")

Signal Closed()
```

## Error Handling

All response types include an implicit error envelope at the outer `Envelope` level:

```protobuf
message ErrorResponse {
  uint32 code    = 1;  // 1=not_found, 2=permission, 3=invalid, 4=daemon_unavailable
  string message = 2;
}
```

Clients should handle `daemon_unavailable` (code 4) by attempting to start the daemon
via systemd socket activation and retrying once after a 500ms wait.
