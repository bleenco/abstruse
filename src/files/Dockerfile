FROM jkuri/abstruse

RUN curl -o /home/abstruse/docker.tgz https://download.docker.com/linux/static/stable/x86_64/docker-17.06.2-ce.tgz
RUN tar xzf /home/abstruse/docker.tgz -C /home/abstruse
RUN sudo ln -s /home/abstruse/docker/docker /usr/bin/docker

COPY scripts/abstruse-exec.sh /usr/bin/abstruse

