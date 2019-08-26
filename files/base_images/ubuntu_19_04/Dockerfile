FROM ubuntu:19.04

ENV DEBIAN_FRONTEND "noninteractive"
ENV DISPLAY ":99"

RUN set -xe \
    && apt update && apt install -y ca-certificates sudo git \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -u 1000 -g 100 -G sudo --shell /bin/bash -m --home-dir /home/abstruse abstruse \
    && echo 'abstruse ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && echo 'abstruse:abstruse' | chpasswd

COPY abstruse-pty /usr/bin/

RUN chmod +x /usr/bin/abstruse-pty

USER abstruse
WORKDIR /home/abstruse/build

RUN sudo chown -Rv abstruse:users /home/abstruse > /dev/null 2>&1

RUN rm /home/abstruse/.bashrc && touch /home/abstruse/.bashrc

ENTRYPOINT [ "/bin/bash" ]
