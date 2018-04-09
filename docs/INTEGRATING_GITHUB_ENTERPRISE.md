## GitHub Enterprise Integration

<p align="left">
  <img src="https://user-images.githubusercontent.com/12008400/38330225-ff6272a0-381d-11e8-8674-ea51a01f9bb9.png" width="700">
</p>

#### 1. Configuring the GitHub App

Abstruse can take advantage of GitHub apps to make enterprise integration much simpler. The process is similar to the GitHub integration, with a few other changes.

The integration of GitHub webhooks and Abstruse is done using `secret` token. The default `secret` is set to **thisIsSecret**.

**It is recommended to change the default `secret` token and restart abstruse to apply changes.**

#### 2. Registering your GitHub App

In your organization `Settings` navigate to `Developer Settings` section in the menu. Click `GitHubApps` then click `New GitHub App` in the top right and fill in the required information.

It is recommended that you use `Abstruse` as the `GitHub App name`. You can use the following text for the description:
```Abstruse is a continuous integration platform requiring zero or minimal configuration to get started, providing safe testing and deployment environment using Docker containers. It integrates seamlessly with all git hosted services as GitHub, BitBucket, GitLab and gogs.```

The `User authorization callback URL` and `Setup URL (optional)` are not required for Abstruse to work correctly.

Set the `Webhook URL` to point towards your Abstruse integration. For me, example `https://abstruse.ebici.com/webhooks/github`. You must also set the `Webhook secret`, use the value that you chose in step 1.

Below are the settings for the permissions

<p align="left">
  <img src="https://user-images.githubusercontent.com/12008400/38372499-f9edd52c-38bc-11e8-918c-0988e9807b40.png" width="700">
</p>

And the event subscriptions

<p align="left">
  <img src="https://user-images.githubusercontent.com/12008400/38372571-2903a486-38bd-11e8-8fa7-5df63f1e30a3.png" width="700">
</p>

Your app can now be created.

#### 3. Installing the GitHub App

Locate the app you just created and install it to your organization.


#### 4. Initiating Abstruse repositories

Your new code repositories will automatically appear in Abstruse
after the first commit or pull request. 

You must configure Abstruse to use the public key assigned to your GitHub app. To do this, you will need to download the public key:

<p align="left">
  <img src="https://user-images.githubusercontent.com/12008400/38450169-64a603aa-39e7-11e8-8084-0f7bb08509f4.png" width="700">
</p>

Take note of the `ID` specified, you will need this later. Note that the `ID` shown here is not the same as the `Installation ID` - though they are frequently the same.

Switch the `GitHub App` button on, and fill in the `App ID` field using the `ID` shown when you downloaded the private key. The `Installation ID` is the index of the app in the list of installed apps. That is, if Abstruse is the first app listed in your organization, the `Installation ID` is 1. If it is the second app, it is 2, and so on.

Finally, paste the contents from the private key file into the `App Key` input and save the token.
<p align="left">
  <img src="https://user-images.githubusercontent.com/12008400/38450144-f7a8d2a0-39e6-11e8-8e0e-3684f3e6d243.png" width="700">
</p>

Now that you have saved the token, you can go ahead and configure your repository to use it.


**Note: Please make sure your local repository includes .abstruse.yml file.**

#### 5. Setting up protected branches

In repository `Settings` navigate to `Branches` section in the menu. Click `Edit` next to the branch you want to protect and select the checkbox `continuous-integration/abstruse` as required.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29859098-d90d5682-8d60-11e7-92ff-b089daf4f7a8.png" width="700">
</p>
