# Containerization Overview

The app runs as `node` instead of `root`, improving security.

## Caching

The following command reduces build time by caching npm dependencies:
```
--mount=type=cache,target=/root/.npm
```

## Key Steps in Containerization

### Define the Environment
Used `NODE_ENV=production` to ensure the app runs with production settings.

### Bundling the Frontend
The `dist` folder contains built frontend assets, served using `npx serve`.

### Expose Application Port
`EXPOSE 3000` ensures the app is reachable on the expected port.

### Optimize the Build
Used multi-stage builds to keep the final image lightweight.

## Challenges Faced

### Dockerfile Syntax
Understanding advanced Docker features like `--mount` and multi-stage builds.

### Dependency Management
Ensuring the right dependencies (e.g., `devDependencies` vs. `dependencies`) were installed in the correct stage.

### Frontend Deployment
Adjusting the Dockerfile to serve the built frontend assets using `npx serve`.

## Lessons Learned

- **Efficiency**: Docker caching can save build time.
- **Security**: Running as a non-root user is essential for production-grade applications.
- **Best Practices**: Multi-stage builds and Alpine-based images lead to smaller, secure containers.

---

## About the `--mount` Feature in Docker

The `--mount` feature in Docker is used to attach file systems (volumes, bind mounts, or tmpfs) to a container. It provides a more flexible and powerful way to manage mounts compared to the older `-v` or `--volume` option.

### Why Use `--mount`?

- **Clarity**: The `--mount` syntax is more explicit and easier to read than the `-v` shorthand.
- **Flexibility**: It supports advanced configuration options for volumes, bind mounts, and tmpfs.
- **Compatibility**: It works with newer features in Docker, like volume drivers.

### Basic Syntax

The `--mount` option uses key-value pairs to define the type and configuration of the mount:
```bash
docker run --mount type=<type>,source=<source>,target=<target>,[options] <image>
```

- **type**: Specifies the type of mount. It can be `volume`, `bind`, or `tmpfs`.
- **source**: The source of the data (e.g., volume name or host path).
- **target**: The container's mount point (where the data appears inside the container).
- **options**: Additional settings (optional), such as read-only or volume-specific options.

---

### Types of Mounts

#### 1. Volume Mounts (`type=volume`)
- Managed by Docker.
- Stores data in Docker's storage backend.
- Ideal for persistent data across containers.

**Example**:
```bash
docker run --mount type=volume,source=myvolume,target=/data myimage
```

#### 2. Bind Mounts (`type=bind`)
- Maps a specific file or directory on the host to the container.
- Directly accesses host files.
- Useful for development, where you want to share source code or configuration files.

**Example**:
```bash
docker run --mount type=bind,source=/path/to/host/dir,target=/app myimage
```
**Note**: Use absolute paths for `source`.

#### 3. Tmpfs Mounts (`type=tmpfs`)
- Creates a temporary in-memory filesystem.
- Data is stored in RAM and is not persisted.
- Useful for sensitive data or temporary storage needs.

**Example**:
```bash
docker run --mount type=tmpfs,target=/tmp myimage
```

