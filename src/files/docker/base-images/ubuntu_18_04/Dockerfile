FROM ubuntu:18.04

ENV DEBIAN_FRONTEND "noninteractive"
ENV DISPLAY ":99"

RUN set -xe \
    && apt update && apt install -y ca-certificates sudo xvfb x11vnc fluxbox xterm openssh-server git \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -u 1000 -g 100 -G sudo --shell /bin/bash -m --home-dir /home/abstruse abstruse \
    && echo 'abstruse ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && echo 'abstruse:abstrusePass' | chpasswd

COPY fluxbox x11vnc xvfb /etc/init.d/
COPY entry.sh /
COPY abstruse-pty /usr/bin/

RUN chmod +x /etc/init.d/* /entry.sh /usr/bin/abstruse-pty

USER abstruse
WORKDIR /home/abstruse/build

RUN sudo chown -Rv abstruse:users /home/abstruse > /dev/null 2>&1

EXPOSE 22 5900

ENTRYPOINT [ "/entry.sh" ]
