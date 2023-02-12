#!/bin/bash

kubectl create configmap server-env-vars --from-env-file=./server-config-map.env
kubectl create secret generic server-env-secret --from-file=./server-secret.env
kubectl apply -f ./redis.yaml
kubectl apply -f ./server.yaml