#!/bin/sh

export DISPLAY=:99

sudo /sbin/openrc --quiet sysinit > /dev/null 2>&1

if [ ! -f "/etc/ssh/ssh_host_rsa_key" ]; then
	sudo ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa > /dev/null 2>&1
fi

if [ ! -f "/etc/ssh/ssh_host_dsa_key" ]; then
	sudo ssh-keygen -f /etc/ssh/ssh_host_dsa_key -N '' -t dsa > /dev/null 2>&1
fi

{
  sudo /etc/init.d/fluxbox start
  sudo /etc/init.d/x11vnc start
  sudo /etc/init.d/sshd start
} > /dev/null 2>&1

/bin/sh
