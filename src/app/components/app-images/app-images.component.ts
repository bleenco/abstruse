import { Component, OnInit, OnDestroy, NgZone, Inject, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import * as ansiUp from 'ansi_up';
import { SlimScrollEvent, ISlimScrollOptions } from 'ngx-slimscroll';
import { Subscription } from 'rxjs/Subscription';

export interface IImage {
  name: string;
  dockerfile: string;
  initsh: string;
}

export interface ImageBuildType {
  name: string;
  layers: { id: string, status: string, progress: string, progressDetail: any }[];
}

@Component({
  selector: 'app-images',
  templateUrl: 'app-images.component.html'
})
export class AppImagesComponent implements OnInit, OnDestroy {
  loading: boolean;
  editorOptions: any;
  initEditorOptions: any;
  form: IImage;
  imageBuilds: ImageBuildType[];
  imageBuildsText: string;
  imageBuildLog: string;
  au: any;
  building: boolean;
  success: boolean;
  images: any[];
  tab: string;
  scrollOptions: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  sub: Subscription;

  constructor(
    private socketService: SocketService,
    private zone: NgZone,
    private api: ApiService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.loading = true;
    this.imageBuilds = [];
    this.imageBuildLog = '';

    this.editorOptions = {
      lineNumbers: true,
      theme: 'abstruseTheme',
      language: 'dockerfile',
      minimap: {
        enabled: false
      },
      contextMenu: false,
      fontFamily: 'monaco, menlo, monospace',
      fontSize: 12,
      scrollBeyondLastLine: false,
      roundedSelection: false,
      scrollbar: {
        useShadows: false,
        vertical: 'hidden',
        horizontal: 'hidden',
        horizontalScrollbarSize: 0,
        horizontalSliderSize: 0,
        verticalScrollbarSize: 0,
        verticalSliderSize: 0
      }
    };

    this.initEditorOptions = Object.assign({}, this.editorOptions, { language: 'plaintext' });

    this.au = new ansiUp.default();
    this.building = false;
    this.tab = 'images';

    this.resetForm();

    this.scrollOptions = {
      barBackground: '#666',
      gridBackground: '#000',
      barBorderRadius: '10',
      barWidth: '7',
      gridWidth: '7',
      barMargin: '2px 5px',
      gridMargin: '2px 5px',
      gridBorderRadius: '10',
      alwaysVisible: false
    };

    this.scrollEvents = new EventEmitter<SlimScrollEvent>();
    this.images = [];
  }

  ngOnInit() {
    this.loading = false;

    this.sub = this.socketService.outputEvents
      .filter(event => event.type === 'imageBuildProgress')
      .subscribe(event => {
        let output;
        try {
          output = JSON.parse(event.data.output.replace('\r\n', ''));
        } catch (e) {
          output = null;
        }

        if (output) {
          this.building = true;
        }

        if (output && output.id && output.progressDetail) {
          const buildIndex = this.findImageBuild(event.data.name);
          const layerIndex = this.findImageLayer(buildIndex, output.id);

          this.zone.run(() => {
            this.imageBuilds[buildIndex].layers[layerIndex] = output;
            const length = this.imageBuilds[buildIndex].layers.length;
            const done = this.imageBuilds[buildIndex].layers.filter(l => {
              return l.status === 'Download complete' || l.status === 'Pull complete';
            }).length;

            this.imageBuildsText = done + '/' + length;
          });
        } else if (output && output.stream) {
          if (output.stream.startsWith('Successfully built') || output.stream.startsWith('Successfully tagged')) {
            this.building = false;
            this.fetchImages();
            this.tab = 'images';
          } else {
            this.imageBuildLog += this.au.ansi_to_html(output.stream);
            this.scrollToBottom();
          }
        } else if (output && output.errorDetail) {
          this.imageBuildLog += `<span style="color:rgb(255,85,85);">${output.errorDetail.message}</span>`;
          this.scrollToBottom();
        }
      });

    this.socketService.emit({ type: 'subscribeToImageBuilder' });
    this.fetchImages();
  }

  resetForm(): void {
    this.form = {
      name: 'nameless_image',
      dockerfile: [
        'FROM ubuntu:17.10',
        '',
        'ENV DEBIAN_FRONTEND=noninteractive',
        '',
        '# please do not edit between lines or image on abstruse will not work properly',
        '',
        '# -------------------------------------------------------------------------------------------------------------------------------',
        '',
        'RUN set -xe \\',
        '    && apt-get update \\',
        '    && apt-get install -y --no-install-recommends ca-certificates curl build-essential \\',
        '    && apt-get install -y --no-install-recommends libssl-dev git python \\',
        '    && apt-get install -y --no-install-recommends sudo \\',
        '    && apt-get install -y --no-install-recommends xvfb x11vnc fluxbox xterm openssh-server',
        '',
        'RUN useradd -u 1000 -g 100 -G sudo --shell /bin/bash -m --home-dir /home/abstruse abstruse \\',
        '    && echo \'abstruse ALL=(ALL) NOPASSWD:ALL\' >> /etc/sudoers \\',
        '    && echo \'abstruse:abstrusePass\' | chpasswd',
        '',
        'COPY fluxbox /etc/init.d/',
        'COPY x11vnc /etc/init.d/',
        'COPY xvfb /etc/init.d/',
        'COPY entry.sh /',
        '',
        'COPY init.sh /home/abstruse/init.sh',
        'COPY abstruse-pty /usr/bin/abstruse-pty',
        'COPY abstruse-exec.sh /usr/bin/abstruse',
        '',
        'USER abstruse',
        'WORKDIR /home/abstruse/build',
        '',
        'RUN cd /home/abstruse && sudo chown -Rv 1000:100 /home/abstruse',
        '',
        'RUN sudo chmod +x /entry.sh /etc/init.d/* /usr/bin/abstruse*',
        'ENTRYPOINT ["/bin/bash"]',
        'CMD ["/entry.sh"]',
        '',
        'EXPOSE 22 5900',
        '',
        '# --------------------------------------------------------------------------------------------------------------------------------',
        '',
        '# your commands go below: ',
        '# example; install Chromium',
        'RUN sudo apt-get install chromium-browser libgconf2-dev -y',
        '',
        '# example; install nvm (Node Version Manager)',
        'RUN cd /home/abstruse \\',
        '    && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash \\',
        '    && export NVM_DIR="$HOME/.nvm" \\',
        '    && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',
        '',
        '# example; install sqlite3',
        'RUN sudo apt-get install sqlite3 -y',
        '',
        '# example; install docker',
        'RUN curl -o /tmp/docker.tgz https://download.docker.com/linux/static/stable/x86_64/docker-17.09.0-ce.tgz \\',
        '    && mkdir /tmp/docker && tar xzf /tmp/docker.tgz -C /tmp \\',
        '    && sudo ln -s /tmp/docker/docker /usr/bin/docker && sudo chmod 755 /usr/bin/docker && rm -rf /tmp/docker.tgz'
      ].join('\n'),
      initsh: [
        '# export CHROME_BIN',
        'export CHROME_BIN=/usr/bin/chromium-browser',
        '# here you define scripts that should be loaded or static env variables',
        '# example for `nvm` or Node Version Manager',
        'if [ -d /home/abstruse/.nvm ]; then',
        '  source /home/abstruse/.nvm/nvm.sh',
        'fi',
        '',
        '# example for giving docker access to abstruse user',
        'if [ -e /var/run/docker.sock ]; then',
        '  sudo chown -R 1000:100 /var/run/docker.sock > /dev/null 2>&1',
        'fi'
      ].join('\n')
    };
  }

  editImage(index: number): void {
    this.form.name = this.images[index].name;
    this.form.dockerfile = this.images[index].dockerfile;
    this.form.initsh = this.images[index].initsh;
    this.tab = 'build';
  }

  fetchImages(): void {
    this.loading = true;
    this.api.imagesList().subscribe(data => {
      this.resetForm();
      this.images = data.map(image => {
        if (!image.dockerfile) {
          image.dockerfile = this.form.dockerfile;
        }

        if (!image.initsh) {
          image.initsh = this.form.initsh;
        }

        return image;
      });

      this.loading = false;
    });
  }

  findImageBuild(imageName: string): number {
    const index = this.imageBuilds.findIndex(ibuild => ibuild.name === imageName);
    if (index !== -1) {
      return index;
    } else {
      this.imageBuilds.push({
        name: imageName,
        layers: []
      });

      return this.imageBuilds.length - 1;
    }
  }

  findImageLayer(imageBuildIndex: number, id: string): number {
    const index = this.imageBuilds[imageBuildIndex].layers.findIndex(layer => {
      return layer.id === id;
    });

    if (index !== -1) {
      return index;
    } else {
      this.imageBuilds[imageBuildIndex].layers.push({
        id: id,
        status: null,
        progress: null,
        progressDetail: null
      });
      return this.imageBuilds[imageBuildIndex].layers.length - 1;
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const ev: SlimScrollEvent = {
        type: 'scrollToBottom',
        easing: 'linear',
        duration: 50
      };
      this.scrollEvents.emit(ev);
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.socketService.emit({ type: 'unsubscribeFromImageBuilder' });
  }

  buildImage(): void {
    this.building = true;
    this.socketService.emit({ type: 'buildImage', data: this.form });
  }
}
