# GitHub Integration
<br>![GitHub Integration](https://user-images.githubusercontent.com/15204169/103622752-6dde1a80-4f37-11eb-8eed-db295d9403c6.png)

### 1. Create GitHub token
**Abstruse** uses a personal access token to communicate with GitHub. We need to create one.<br>Login to GitHub and navigate to `Setting/Developer settings/Personal access tokens`
<br>![Generate Token](https://user-images.githubusercontent.com/15204169/103622748-6caced80-4f37-11eb-96a8-bc7bfd6adb91.png)
Click on `Generate new Token`. We only need access to `repo`
<br>![Repo Access](https://user-images.githubusercontent.com/15204169/103622796-79c9dc80-4f37-11eb-94f7-62c075046c4f.png)
Click on `Generate token` and save the token
<br>![New Token](https://user-images.githubusercontent.com/15204169/103622761-6fa7de00-4f37-11eb-9cb3-0adcc6cbf4c9.png)

### 2. On Abstruse add GitHub provider
On **Abstruse** navigate to the provider's page. Click on the profile picture and select `Providers`
<br>![Providers](https://user-images.githubusercontent.com/15204169/103622793-7898af80-4f37-11eb-87cf-528466924c40.png)
Click on `Add Provider`
<br>![Add provider](https://user-images.githubusercontent.com/15204169/103622718-60c12b80-4f37-11eb-9402-dd93d21656b1.png)
Select the GitHub provider and paste the access token to the field. Copy the generated secret that will be needed in the next step. Click `Save`.

### 3. Add GitHub webhook
To add a webhook, login to GitHub and navigate to repository and then `Settings/Webhooks` 
<br>![Webhook](https://user-images.githubusercontent.com/15204169/103622821-80585400-4f37-11eb-805a-0868c8017edb.png)
Click on `Add webhook`
<br>Under **Playload URL** add the URL to your **Abstruse** and attach the `/webhooks` path to it `https://demo.abstruse.io/webhooks`
<br>Under **Secret** paste the secret from the previous step
<br>Under **Which events would you like to trigger this webhook?** select `Let me select individual events.` and check **Branch or tag creation, Branch or tag deletion**, **Pull requests** and **Pushes**
<br>![Add Webhook](https://user-images.githubusercontent.com/15204169/103622732-64ed4900-4f37-11eb-90fa-eebfa17b6a4a.png) 
Click `Add webhook`

### 4. Protect master branch
In order to protect the master branch with **Abstruse**, login to GitHub and navigate to the repository and then `Settings/Branches`
<br>![Branches](https://user-images.githubusercontent.com/15204169/103622742-69196680-4f37-11eb-91dc-a659ace05a8f.png)
Click on `Add Role`. Type in `master` as the branch and check **Require status checks to pass before merging**, **Require branches to be up to date before merging** and **continuous-integration**
<br>![Protect Branche](https://user-images.githubusercontent.com/15204169/103622772-7171a180-4f37-11eb-8d20-94675436f0ef.png)

### 5. Enable repository in Abstruse
Go to **Abstruse** and navigate to the `Repositories` page and turn on the repository
<br>![Repositories](https://user-images.githubusercontent.com/15204169/103622811-7df5fa00-4f37-11eb-8694-718d48d45c8f.png)

### 6. Create PR
We are good to go. Here is a simple example on how to test everything. Create a PR with these two files in the root of the project:

`Makefile`:
```makefile
test:
	@echo "testing..."
	
.PHONY: test
```

`.abstruse.yml`:
```yaml
image: golang:1.15

matrix:
  - env: CMD=test

script:
  - if [[ "$CMD" ]]; then make $CMD; fi
```