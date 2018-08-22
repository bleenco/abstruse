FROM alpine:edge

ENV DISPLAY ":99"

RUN apk --no-cache add ca-certificates openrc su-exec sudo xvfb x11vnc fluxbox xterm openssh-server git \
    && adduser -h /home/abstruse -s /bin/sh -u 1000 -S abstruse \
    && echo 'abstruse ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && echo 'abstruse:abstrusePass' | chpasswd \
    && rm -rf /etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_dsa_key

RUN set -x \
    && sed -i 's/^\(tty\d\:\:\)/#\1/g' /etc/inittab \
    && sed -i \
        -e 's/#rc_sys=".*"/rc_sys="docker"/g' \
        -e 's/#rc_env_allow=".*"/rc_env_allow="\*"/g' \
        -e 's/#rc_crashed_stop=.*/rc_crashed_stop=NO/g' \
        -e 's/#rc_crashed_start=.*/rc_crashed_start=YES/g' \
        -e 's/#rc_provide=".*"/rc_provide="loopback net"/g' \
        /etc/rc.conf \
    && rm -f /etc/init.d/* \
    && sed -i 's/\tcgroup_add_service/\t#cgroup_add_service/g' /lib/rc/sh/openrc-run.sh \
    && sed -i 's/VSERVER/DOCKER/Ig' /lib/rc/sh/init.sh

COPY fluxbox x11vnc xvfb sshd /etc/init.d/
COPY abstruse-pty /usr/bin/
COPY entry.sh /entry.sh

RUN chmod +x /etc/init.d/* /usr/bin/abstruse-pty /entry.sh

USER abstruse
WORKDIR /home/abstruse/build

RUN mkdir -p /home/abstruse/.vnc \
    && x11vnc -storepasswd abstrusePass /home/abstruse/.vnc/passwd

EXPOSE 22 5900

ENTRYPOINT ["/entry.sh"]
