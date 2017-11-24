# Abstruse CI Deploying

With Abstruse CI it's possible to deploy to any service by adding commands to Abstruse config file in your repository (`.abstruse.yml`).

When the build finish with all of the jobs successfully, the deployment can start. Deployment is a separate job and is executed last only if all jobs were executed successfully.

## Deployment

Deployment can be defined in three steps:
- before_deploy (optional, preparation for deployment)
- deploy (required)
- after_deploy (optional, steps after successful deploy)

`before_deploy` and `after_deploy` steps are basically the same as all of the others, you need to specify commands in correct order and they execute sequentially.

## Deploy step

The `deploy` step can be defined in two ways.

### Commands

In a first way, the `deploy` step can be defined in a traditional `Abstruse` way, where you specify commands in lines and they execute sequentially.

### Supported providers

The second option is a deploy with a help of Abstruse supported providers.
To deploy on that way in `.abstruse.yml` in `deploy` section should look like that (example for aws S3):
```
deploy:
-provider: s3
...
```

Currently we support next providers:
- [aws s3](./DEPLOY_S3.md)
- [aws CodeDeployment](./DEPLOY_CODEDEPLOY.md)
