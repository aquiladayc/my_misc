#!/bin/bash
  
#Integration name
integ="XXX"
mkdir -p ~/workspace/$integ

#copy XXX.py and create a softlink
sudo mv /opt/datadog-agent/embedded/lib/python3.8/site-packages/datadog_checks/${integ}/${integ}.py  ~/workspace/$integ
cd /opt/datadog-agent/embedded/lib/python3.8/site-packages/datadog_checks/${integ}/
sudo ln -sf ~/workspace/${integ}/${integ}.py ${integ}.py

cd -
