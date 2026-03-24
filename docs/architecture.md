# Tilbo Architecture

This document provides a high-level overview of the `tilbo` project's architecture.

## Components

The `tilbo` system is composed of three main user-facing components:

1.  **`tilbo daemon`**: The core service, launched from the unified `tilbo` binary.
2.  **`tilbo`**: The command-line interface for interacting with the daemon.
3.  **`tilbo-quickshell`**: The QML-based GUI for interacting with the daemon.

And several key internal components that live within the daemon runtime:

*   **Watcher**: An `fanotify`-based filesystem watcher that detects file changes in real-time.
*   **Index**: A SQLite database that stores all metadata, tags, and file information.
*   **IPC Server**: A Protobuf-based IPC server for the `tilbo` CLI.
*   **UI Socket Server**: A JSON-RPC-based IPC server for the `tilbo-quickshell` GUI.
*   **FUSE Server**: A FUSE filesystem that exposes a virtual, tag-based view of your files.
*   **Harvester**: An extensible pipeline for extracting metadata from files. Supports custom WASM-based harvesters.
*   **Rule Engine**: An engine for applying automated tagging and management rules. Supports custom WASM-based rules.
*   **Graph**: An in-memory graph database representing the relationships between files and tags, used for finding related items.
*   **Embedder**: An optional service that generates vector embeddings from files for semantic similarity searches.

## Communication

![Architecture Diagram](https://i.imgur.com/example.png)  <!-- Placeholder for a real diagram -->

*   **`tilbo` -> `tilbo daemon`**: The CLI communicates with the daemon over a Unix socket using a **Protobuf**-based RPC protocol. This provides a fast and strongly-typed interface suitable for command-line operations.

*   **`tilbo-quickshell` -> `tilbo daemon`**: The Quickshell GUI communicates with the daemon over a separate Unix socket using a **JSON-RPC** protocol. This protocol was chosen for its ease of use within the QML/Javascript environment provided by Quickshell.

## Data Flow

1.  A user creates or modifies a file on the watched filesystem.
2.  The **Watcher** detects the change and notifies the daemon.
3.  The file is added to a processing queue.
4.  The **Syncer** updates the file's basic information in the **Index**.
5.  The **Harvester** pipeline runs, extracting metadata from the file.
6.  The **Rule Engine** applies any matching rules to the file, potentially adding tags.
7.  If enabled, the **Embedder** generates vector embeddings for the file content.
8.  The in-memory **Graph** is updated with the new file and tag information.
9.  A notification is sent via the **UI Socket Server** to the GUI, which updates in real-time.
