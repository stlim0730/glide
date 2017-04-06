#!/usr/bin/env bash

# Variables
PG_VERSION=9.3
PROJECT_NAME=glide
VAGRANT_USERNAME=vagrant
# WS_PORT=8889


# Script-based provision
export DEBIAN_FRONTEND=noninteractive


# 
# Create a symbolic link to the working directory
# 
ln -s /vagrant /$PROJECT_NAME


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
# Setup Python
# 
sudo apt-get install -y python3-pip
sudo apt-get install -y python-dev python-setuptools python-imaging libssl-dev libtiff5-dev libjpeg8-dev zlib1g-dev libfreetype6-dev liblcms2-dev libwebp-dev tcl8.6-dev tk8.6-dev python-tk
sudo export PYTHONPATH=/usr/local/lib/python3.4/dist-packages:$PYTHONPATH # Don't know why it doesn't work
sudo pip3 install --upgrade pip
# sudo cp /$PROJECT_NAME/deployment/aliases ~/.bash_aliases
# sudo easy_install pip

# Setup newer version of Python: Currently, this project uses the native version of Python on the OS
# cd /usr/src
# sudo wget https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tgz
# sudo tar xzf Python-$PYTHON_VERSION.tgz
# cd Python-$PYTHON_VERSION
# sudo ./configure
# sudo make install

# sudo pip install --upgrade pip
# sudo apt-get install -y python-virtualenv # Currently, not using virtualenv


# 
# Install Nginx
# 
sudo apt-get install -y nginx
sudo cp /$PROJECT_NAME/deployment/nginx_conf /etc/nginx/sites-available/$PROJECT_NAME
sudo ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo pip3 install uwsgi


# 
# Setup Redis
# 
sudo apt-get install -y redis-server


# 
# Setup Database
# 
sudo apt-get install -y postgresql-$PG_VERSION
sudo apt-get install -y postgresql-contrib
sudo apt-get install -y libpq-dev # required for psycopg2
sudo apt-get install -y python-psycopg2
sudo cp /$PROJECT_NAME/deployment/pg_hba.conf /etc/postgresql/$PG_VERSION/main/
sudo service postgresql restart
sudo createuser -U postgres -d $VAGRANT_USERNAME
sudo createdb -U $VAGRANT_USERNAME $PROJECT_NAME


# 
# Install Python packages
# 
sudo pip3 install -r /$PROJECT_NAME/requirements.txt


# 
# TODO: Create Django admin
# 


# 
# Migrate Django
# 
cd /$PROJECT_NAME && python3 manage.py migrate


# 
# Populate local database
# 
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
# Daemonize Daphne
# 
cd /$PROJECT_NAME && ./daphne.sh


# 
# Daemonize Django worker
# 
cd /$PROJECT_NAME && ./runworker.sh
