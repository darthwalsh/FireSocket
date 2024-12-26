For more context, see [parent README](../README.md).

Build and test installed versions

```bash
docker build -t npm-with-java .
docker run --rm npm-with-java --version
docker run --rm --entrypoint node npm-with-java --version
docker run --rm --entrypoint java npm-with-java --version
```
