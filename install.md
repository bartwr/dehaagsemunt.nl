# Install Notes
## De Haagse Munt app

Server: Ubuntu 15.05  
Webserver: Apache


Installatie:

    mkdir -p /var/git/dehaagsemunt/app
    mkdir -p /var/www/dehaagsemunt/app

    cd /var/git/dehaagsemunt/app
    git init
    git config receive.denyCurrentBranch ignore

    cp ./post-receive ./.git/hooks/post-receive
    chmod +x ./.git/hooks/post-receive
