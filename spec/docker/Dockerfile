FROM node:16

# https://stackoverflow.com/a/44058196/771768
RUN apt-get update && \
    apt-get install -y openjdk-11-jre-headless && \
    apt-get clean

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

ENTRYPOINT ["npm"]
