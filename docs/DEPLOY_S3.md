# Abstruse CI Deploying

Abstruse CI can automatically upload your build to Amazon S3 storage after a successful build.

In order to get deployment with AWS CodeDeploy working, the [`AWS Command Line Interface`](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) need to be installed in the container. That can be done in two ways:
- using extra step in `.abstruse.yml` in `before_deployment` section (e.g. `sudo apt-get install awscli -y`)
- include installation step in [docker image](./IMAGES.md)

For a minimal configuration, you can add the following to your config file `.abstruse.yml`.

```
deploy:
  - provider: s3
  - bucket: "test-bucket"
  - accessKeyId: "your_aws_access_key"
  - secretAccessKey: "your_aws_secret_access_key"
  - region: "aws_region"
```

While this is a working example, we don't recommend to store your sensitive data (`accessKeyId` and `secretAccessKey`) to your repository.
The best way to do that is through Environment Variables.

### Environment Variables

You can add system Environment Variables in the Abstruse user interface, once the repository exists in the system.
Once you're logged into the system you need to follow next steps:
1. Click on button `Repositories` from the head menu.
2. In the list of `repositories` click on your repository.
3. In the right top corner click on button `Settings`.
4. In the box `Environment Variables` you'll see three fields. In the first field `Name` you'll need to put a name of a variables, like we
see in an above example, if you need would like to save `access key` and `secret access key`, the names should be `accessKeyId` and `secretAccessKey`, otherwise it won't work. In the second field enter your key (you can get it on your Amazon Console). In the last field, you can choose if you want to encrypt (hide) that data from other users (recommended) or not. If you choose to encrypt your value, this value cannot be seen again, while if you don't encrypt, the value will be normally seen al the time in the system.
5. Click on button `Add Variable`.

### Optional parameters

As we see, there are five required attributes for a deploy to AWS S3, but there are more for advanced options.

If you want to upload from your build to S3, S3 requires having a config file `appspec.yml` in your repository.

Abstruse CI provides you with two options:
- `appspec.yml` can be saved in your repository and Abstruse will take that one.
- `appspec.yml` doesn't exist, the Abstruse will create one for you.


Optional parameters:
- `applicationType` - default is `zip`, you can specify `zip` or `tar`.
- `application` - defines Application name. If the application is not provided, the parameter `bucket` will use instead.
