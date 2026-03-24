# The Tilbo FUSE Filesystem

`tilbo daemon` includes an optional FUSE (Filesystem in Userspace) server that provides a powerful, dynamic view of your tagged files. When enabled, it creates a virtual filesystem (by default at `~/.local/share/tilbo/tags` or `/run/user/$UID/tilbo/tags`) where directories are tags and files are symlinks to their real counterparts.

This allows you to browse and manage your files using standard shell commands (`ls`, `cd`, `mv`) in a tag-based structure.

## Basic Usage

At the root of the FUSE mount, you will find a directory for every tag in your system.

```sh
$ ls /run/user/1000/tilbo/tags
invoices/  personal/  photos/  project-x/  work/  @browse/  @recent/  @untagged/
```

To see all files tagged with `work`, simply `ls` that directory:

```sh
$ ls /run/user/1000/tilbo/tags/work
report.pdf -> /home/darkliquid/Documents/work/report.pdf
tasks.md -> /home/darkliquid/notes/work/tasks.md
```

## Tag Expressions

The real power of the FUSE filesystem comes from using tag expressions directly in the path. You can combine tags with operators to create complex, on-the-fly views of your files.

### AND (`+`)

To view files that have **all** of the specified tags, use the `+` operator.

```sh
# List files tagged with both 'work' AND 'project-x'
$ ls 'work+project-x'
design-spec.odg -> /home/darkliquid/Documents/work/project-x/design-spec.odg
```

### OR (`,`)

To view files that have **any** of the specified tags, use the `,` operator.

```sh
# List files tagged with either 'personal' OR 'photos'
$ ls 'personal,photos'
cat.jpg -> /home/darkliquid/Pictures/cat.jpg
holiday.jpg -> /home/darkliquid/Pictures/vacation/holiday.jpg
resume.pdf -> /home/darkliquid/Documents/personal/resume.pdf
```

### NOT (`!`)

To exclude files with a certain tag, use the `!` operator. This is most useful in combination with other tags.

```sh
# List files tagged 'work' but NOT 'archived'
$ ls 'work+!archived'
current-task.md -> /home/darkliquid/notes/work/current-task.md
```

## Retagging with `mv`

You can manage tags directly from your shell by moving files between tag directories. This is an intuitive way to retag files.

```sh
# This command:
$ mv 'work+!project-x/file.txt' 'work+project-x/'

# Is equivalent to this CLI command:
$ tilbo tag add project-x /path/to/real/file.txt
```

When you move a file into a tag expression directory, `tilbo` will add and remove tags to ensure the file matches the destination expression.

## Special Directories

The FUSE filesystem includes several special, read-only directories prefixed with `@`.

*   **`@browse`**: An interactive way to explore your files. Each subdirectory you enter adds a filter to the current view, and the listings show other tags that co-occur with your current selection. This is great for discovering relationships between tags.
*   **`@recent`**: Shows a flat list of the most recently modified files.
*   **`@untagged`**: Shows all files in your library that have no tags. This is useful for finding files that need to be organized.
*   **`@similar`**: When inside a directory for a single file (e.g., `cd @browse/report.pdf; cd @similar`), this directory shows files that are semantically similar, based on their content embeddings. This requires the embedder to be enabled.
