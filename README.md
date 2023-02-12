# k8s-nodejs-app

Project is created during the Kubernetes learning time.

### Build image
---
```sh
$ docker build --no-cache . -t logansua/k8s-test-app
```
<small>Note: Image name is used in `./kustomization/server.yaml` as container image.</small>

### Apply K8s configuration
---
```sh
$ kubectl apply -k kustomization
```