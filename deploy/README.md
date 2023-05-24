## Prerequisites
* Install `ansible` from your distro's package manager
* Ensure your ssh key has been added to the .ssh/authorized_keys file on the host you want to deploy to
* Copy `deploy/secret-vars.example.yaml` to `deploy/secret-vars.yaml` and fill in the fields
* CD to the `deploy/` directory


## Full deploy from scratch
```
ansible-playbook -e @secret-vars.yaml -i production deploy.yaml
```

### Partial deployments (for quicker iteration during testing)

#### Deploy just the web changes (when only application code has changed)
```
ansible-playbook -e @secret-vars.yaml -i production deploy.yaml --tags web
```

#### Deploy just the nginx changes (when only nginx config has changed)
```
ansible-playbook -e @secret-vars.yaml -i production deploy.yaml --tags nginx
```

#### Deploy just the db changes (when only database/container config has changed)
```
ansible-playbook -e @secret-vars.yaml -i production deploy.yaml --tags db
```

#### Deploy just the os changes (when only operating system config outside the application has changed)
```
ansible-playbook -e @secret-vars.yaml -i production deploy.yaml --tags db
```


## First time setup:
Run `certbot` to have let's encrypt automatically set up a cert and register a systemd timer to automatically renew it


## Handling non-static ip addresses
Using gandi as a domain registrar, you can use the `deploy/dns/` files to monitor and update the dns record for your domain when your public ip changes.
* Copy the `domain-ddns-update.sh` file to `/bin` and edit its contents to add an API key from your gandi account
* Copy the `.service` and `.timer` files to `/usr/lib/systemd/system/`
* Run `systemctl enable --now domain-ddns-update.timer` to enable the background service that will ensure your domain's dns records are updated every hour







