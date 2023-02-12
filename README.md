# k8s-nodejs-app

This project is created during the Kubernetes learning time.

* [Redis configuration](kustomization/redis.yaml)
* [NodeJS server configuration](kustomization/server.yaml)

## Build image

```sh
$ docker build --no-cache . -t logansua/k8s-test-app
```
<sup>Note: Image name `logansua/k8s-test-app` is used in [`./kustomization/server.yaml`](kustomization/server.yaml) as container image.</sub>

## Apply K8s configuration

```sh
$ kubectl apply -k kustomization
```

## Usage

### Liveness
Used by K8s for [`livenessProbe`](kustomization/server.yaml#L24) configration

```sh
$ curl http://localhost/liveness
```

### Readiness
Used by K8s for [`startupProbe`](kustomization/server.yaml#L43) and [`readinessProbe`](kustomization/server.yaml#L34) configration

```sh
$ curl http://localhost/health
```

### Any other path is used for main action
* Writes all request headers to Redis
* Returns the output of container environment variables [`TEST_ENV_VARIABLE`](kustomization/server.yaml#L58), [`SECRET_USERNAME`](kustomization/server.yaml#L63) and [`SECRET_PASSWORD`](kustomization/server.yaml#L68)
* Returns value from Redis by given name in `redis-key`

```
$ curl http://localhost/test/path/12321 -H 'foo-header:bar-value' -H 'redis-key:foo-header'
```

Output
```json
{
  "path": "/test/path/1?redis-key=accept-encoding",
  "headers": {
    "redis-key": "accept-encoding",
    ...
    "accept-encoding": "gzip, deflate, br"
  },
  "env": {
    "TEST_ENV_VARIABLE": "foo",
    "SECRET_USERNAME": "bar",
    "SECRET_PASSWORD": "baz"
  },
  "redis": {
    "accept-encoding": "gzip, deflate, br"
  }
}
```
