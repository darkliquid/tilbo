FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        # filesystem creation tools
        e2fsprogs \
        btrfs-progs \
        dosfstools \
        # loop device + mount management
        util-linux \
        # FUSE support
        fuse3 \
        # xattr inspection (getfattr/setfattr)
        attr \
        # shell utilities used by test helpers
        procps \
    && rm -rf /var/lib/apt/lists/*

# Allow non-root FUSE mounts and user_allow_other inside the container.
RUN echo "user_allow_other" >> /etc/fuse.conf

# Ensure /dev/fuse is present when starting (privileged containers provide it,
# but we document the requirement here explicitly).
RUN mkdir -p /mnt/ext4 /mnt/btrfs /mnt/vfat /mnt/tmpfs /tilbo/socks /tilbo/dbs /tilbo/fuse /tilbo/images

CMD ["sleep", "infinity"]
