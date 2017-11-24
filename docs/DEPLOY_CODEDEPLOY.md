# Abstruse CI Deploying

Abstruse CI can automatically upload to Amazon CodeDeploy.

For a minimal configuration, you can add the following to your config file `.abstruse.yml`.

```
deploy:
  - provider: codeDeploy
  - application: "test-application"
  - accessKeyId: "your_aws_access_key"
  - secretAccessKey: "your_aws_secret_access_key"
  - region: "aws_region"
  - deployGroup: "test-group"
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
see in an above example, if you need would like to save `access key` and `secret access key`, the names should be `accessKeyId` and `secretAccessKey`, otherwise it won't work. In the second field enter your key (you can get it on your Amazon Console). In the last field, you can choose if you want to encrypt (hide) that data from other users (recommended) or not. If you choose to encrypt your value, this value cannot be seen again, will if you don't encrypt, the value will be normally seen al the time in the system.
5. Click on button `Add Variable`.

### Optional parameters

As we see, there are five required attributes for a deploy with CodeDeploy, but there are more for advanced options.

For a successful deploy, CodeDeploy requires deployment group. You need to specify name of a deployment group and if that group doesn't exist
already, the Abstruse will create one for you, in that case, the parameter.

Optional parameters:
- `applicationStore` - default is `s3`, you can specify `s3` or `github`.
- `applicationType` - default is `zip`, you can specify `zip` or `tar`.
- `applicationFileName` - defines Application name. If the application is not provided, the parameter `application` will use instead.
- `applicationRevision` - if you want to deploy specific revision, you can define it with that attribute.
- `arn` - requested for creating deployment group (can be saved in environment variables). [Amazon Resource Names.](http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html)
