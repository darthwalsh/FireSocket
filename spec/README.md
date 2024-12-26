# Testing

To run individual tests, run `npm run local` to start the firebase emulator. Otherwise, `npm test` will start the emulator then run the tests.

While tests are running, http://localhost:9000/.json?ns=testDb will show the state of the local database.

## Dependencies

Other than npm dependencies, the local version of firebase installed with `@firebase/testing` also requires that java is installed locally.

To test in Cloud Build, the docker image needs both npm and java installed. [docker/Dockerfile](docker/Dockerfile) specifies how to create such an image, and you can use Cloud Build to publish the image by running

```
export CLOUDSDK_CORE_PROJECT=firesocket-test
gcloud builds submit --config cloudbuild.yaml .
```
