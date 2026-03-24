# Writing Plugins (Harvesters and Rules)

Tilbo's functionality can be extended with custom plugins for metadata extraction (Harvesters) and automated file management (Rules). These plugins are written in any language that can be compiled to **WebAssembly (WASM)**, making the system incredibly flexible.

## Overview

*   **Harvesters**: A harvester is a plugin that extracts metadata from a file. For example, a built-in harvester extracts EXIF data from JPEG images. You could write a custom harvester to extract metadata from proprietary file formats specific to your workflow.
*   **Rules**: A rule is a plugin that applies actions to files based on their metadata. For example, you could write a rule that automatically adds the tag `invoice` to any PDF file whose content contains the words "Invoice Number".

## Plugin Location

Tilbo looks for WASM plugins in specific directories. By default, these are:

*   **Harvesters**:
    *   `~/.config/tilbo/harvesters`
    *   `/etc/tilbo/harvesters`
*   **Rules**:
    *   `~/.config/tilbo/rules`
    *   `/etc/tilbo/rules`

You can also define "inline" rules directly in the `tilbo daemon` configuration file.

## How it Works

1.  **Plugin Discovery**: On startup, `tilbo daemon` scans the plugin directories for `.wasm` files.
2.  **WASM Runtime**: The daemon uses the [wazero](https://wazero.io/) runtime to load and execute the WASM plugins in a secure sandbox.
3.  **Execution**:
    *   When a new or modified file is detected, it is passed through the **Harvester pipeline**. Each harvester that matches the file type is executed, and any metadata it returns is added to the index.
    *   After the harvesters have run, the file's metadata is passed to the **Rule Engine**. Any rules whose conditions are met are executed, performing actions like adding or removing tags.

## Creating a Plugin

*To be documented: This section will provide a detailed tutorial on creating a simple plugin, including:*

*   *The expected WASM function exports (e.g., `harvest`, `apply_rule`).*
*   *The data structures (e.g., in JSON or another format) passed into and out of the WASM module.*
*   *An example in a language like Rust or Go.*

For now, please refer to the internal Go implementations of built-in harvesters and rules for an idea of the logic involved.
