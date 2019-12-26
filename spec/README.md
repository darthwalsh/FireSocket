# Testing

## Dependencies

Other than npm dependencies, the local version of firebase installed with `@firebase/testing` also requires that java is installed locally.

To test in Cloud Build, the docker image needs both npm and java installed. [docker/Dockerfile](docker/cloudbuild.yaml) specifices how to create such an image, and you can use Cloud Build to publish the image by running `gcloud builds submit --config cloudbuild.yaml .`
