# Abstruse CI Deploying

Abstruse CI can automatically deploy to Amazon Elastic Beanstalk after a successful build.

In order to get deployment with AWS CodeDeploy working, the [`AWS Command Line Interface`](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) need to be installed in the container. That can be done in two ways:
- using extra step in `.abstruse.yml` in `before_deployment` section (e.g. `sudo apt-get install awscli -y`)
- include installation step in [docker image](./IMAGES.md)

For a minimal configuration, you can add the following to your config file `.abstruse.yml`.

```
deploy:
  - provider: elastic
  - application: "test-application"
  - accessKeyId: "your_aws_access_key"
  - secretAccessKey: "your_aws_secret_access_key"
  - region: "aws_region"
  - s3Bucket: "s3_bucket_location"
  - environmentName: "my_environment"
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
see in an above example, if you need would like to save `access key` and `secret access key`, the names should be `accessKeyId` and `secretAccessKey`, otherwise it won't work. In the second field enter your key (you can get it on your Amazon Console). In the last field, you can choose if you want to encrypt (hide) that data from other users (recommended) or not. If you choose to encrypt your value, this value cannot be seen again, while if you don't encrypt it, the value will be normally seen al the time in the system.
5. Click on button `Add Variable`.

### Optional parameters

As we see, there are seven required attributes for a deploy to AWS Elastic Beanstalk, but there are more for advanced options.

For a successful deploy, Elastic requires application and environment. You need to specify names of an application and of an environment. If application or environment doesn't exist yet, Abstruse will create one for you (in that case attribute `environmentTemplate` or `solutionStackName` is required).

Parameters:
- `application` - The name of an application (required).
- `applicationType` - Default is `zip`, you can specify `zip` or `git`.
- `description` - Application's description. If the description is not selected, Abstruse will set the parameter for you with a predefined string `Deployed with Abstruse.`.
- `s3Bucket` - The Amazon S3 bucket that identifies the location of the source bundle for this version (the Amazon S3 bucket must be in the same region as the environment).
- `codeCommit` - Specify a commit in an AWS CodeCommit Git repository to use as the source code for the application version. (Specify a source bundle in S3 or a commit in an AWS CodeCommit repository, but not both. If neither SourceBundle nor source-build-information are provided, Elastic Beanstalk uses a sample application.)
- `environmentName` - The name of an Environment (required).
- `environmentTemplate` - The name of the configuration template to use in deployment.
- `solutionStackName` - This is an alternative to specifying a template name. If specified, AWS Elastic Beanstalk sets the configuration values to the default values associated with the specified solution stack.
