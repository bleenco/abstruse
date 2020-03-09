## GitHub Integration

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858646-a6ba0772-8d5e-11e7-9280-ef5a9d4ca0f4.png" width="700">
</p>

#### 1. Configuring secret token

Abstruse configuration file is located in **~/abstruse-config/config.json**.

The integration of GitHub webhooks and Abstruse is done using `secret` token. The default `secret` is set to **thisIsSecret**.

**It is recommended to change the default `secret` token and restart abstruse to apply changes.**

#### 2. Setting up Github Webhooks

In repository `Settings` navigate to `Webhooks` section in the menu. Click `Add Webhooks` and fill in the required information.

An example of a successful webhook entry can be seen in a screenshot below. Instead of `https://abstruse.bleenco.io` the URL of your choice has to be entered.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858741-220462f6-8d5f-11e7-8b3b-b6418b46684c.png" width="700">
</p>

#### 3. Initiating Abstruse repositories

Your new code repositories will automatically appear in Abstruse
after the first commit or pull request.

**Note: Please make sure your local repository includes .abstruse.yml file.**

#### 4. Setting up protected branches

In repository `Settings` navigate to `Branches` section in the menu. Click `Edit` next to the branch you want to protect and select the checkbox `continuous-integration/abstruse` as required.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29859098-d90d5682-8d60-11e7-92ff-b089daf4f7a8.png" width="700">
</p>
