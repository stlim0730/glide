#!/usr/bin/env bash

# Note: make sure you've created a user with sudo privilege
#   adduser <username>
#   usermod -aG sudo <username>


# Variables
PG_VERSION=9.5
PROJECT_NAME=glide
ENV_USERNAME=glideadmin
# WS_PORT=8889


# 
# Keep package list information up to date
# 
sudo apt-get update


# 
# Utilities
# 
sudo apt-get install -y build-essential # Required for building ANYTHING on ubuntu
sudo apt-get install -y git


#
# Clone the project repository
#
cd / && sudo git clone https://github.com/stlim0730/glide.git


# 
# Setup Python
# 
sudo apt-get install -y python3-pip
sudo pip3 install --upgrade pip
# sudo apt-get install -y python-dev python-setuptools python-imaging libssl-dev libtiff5-dev libjpeg8-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.6-dev tk8.6-dev python-tk
# sudo export PYTHONPATH=/usr/local/lib/python3.4/dist-packages:$PYTHONPATH # Don't know why it doesn't work
# sudo cp /$PROJECT_NAME/deployment/aliases ~/.bash_aliases


# 
# Install Nginx
# 
sudo apt-get install -y nginx
sudo rm -rf /etc/nginx/sites-enabled/default
sudo cp /$PROJECT_NAME/deployment/nginx_conf_digitalocean /etc/nginx/sites-available/$PROJECT_NAME
sudo ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo pip3 install uwsgi


# 
# Setup Redis
# 
sudo apt-get install -y redis-server


# 
# Setup Database
# 
sudo apt-get install -y postgresql # Installs the supported version (9.5)
# sudo apt-get install -y postgresql-contrib # I think the previous command installs contrib-9.5
sudo apt-get install -y libpq-dev # required for psycopg2
sudo apt-get install -y python-psycopg2
sudo cp /$PROJECT_NAME/deployment/pg_hba.conf /etc/postgresql/$PG_VERSION/main/
sudo service postgresql restart
# sudo createuser -U postgres -d $ENV_USERNAME
sudo -u postgres createuser -s $ENV_USERNAME
sudo createdb -U $ENV_USERNAME $PROJECT_NAME


# 
# Install Python packages
# 
sudo pip3 install -r /$PROJECT_NAME/requirements.txt

# 
# TODO: Reconfigure Django local settings
# 


# 
# TODO: Create Django admin
# 


# 
# Migrate Django
# 
cd /$PROJECT_NAME && python3 manage.py makemigrations
cd /$PROJECT_NAME && python3 manage.py migrate


# 
# Populate local database
# 
# cd /$PROJECT_NAME && python3 manage.py loaddata deployment/initial_data.json
# sudo createuser -U postgres -d hjgblmqzztzppf
# sudo pg_restore -U hjgblmqzztzppf -d $PROJECT_NAME --clean /$PROJECT_NAME/deployment/initial_dataset_feb_8_2017
# sudo psql -d $PROJECT_NAME -U postgres -c "REASSIGN OWNED BY hjgblmqzztzppf TO vagrant"


# 
# Restart the server
# 
sudo service postgresql restart
sudo service nginx restart


# 
# Daemonize uWSGI module
# 
cd /$PROJECT_NAME && sudo uwsgi --daemonize /var/log/uwsgi-daemon.log --socket :8001 --module $PROJECT_NAME.wsgi --touch-reload=/$PROJECT_NAME/reload.ini


# 
# TODO: Deamonize Redis server
# 
# sudo redis-server


# 
# Install NodeJS
# 
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm
# sudo npm install npm --global # To update npm
# sudo npm install -g babel webpack webpack-dev-server


# 
# Create a swap file
#   to make sure npm runs without being killed during the process
# 
# if=/dev/zero : Read from /dev/zero file. /dev/zero is a special file in that provides as many null characters to build storage file called /swapfile1.
# of=/swapfile1 : Read from /dev/zero write storage file to /swapfile1.
# bs=1024 : Read and write 1024 bytes at a time.
# count=1024k : Copy 1024k blocks input blocks.
# (1024 bytes * 1024k = 1GB)
# 
sudo dd if=/dev/zero of=/swapfile bs=1024 count=1024k
sudo chown root:root /swapfile
sudo chmod 0600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# To check: sudo swapon -s


# 
# Install NodeJS Packages
# 
cd /$PROJECT_NAME && sudo npm install
# cd /$PROJECT_NAME && sudo npm install pm2 -g


# 
# Daemonize Daphne
# 
cd /$PROJECT_NAME && sudo ./daphne.sh


# 
# Daemonize Django worker
# 
cd /$PROJECT_NAME && sudo ./runworker.sh


# 
# Daemonize Node server
# 
# cd /$PROJECT_NAME && sudo pm2 start glide_node.js
