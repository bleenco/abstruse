import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import * as ansiUp from 'ansi_up';

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
  imageBuildLog: string;
  au: any;

  constructor(private socketService: SocketService, private zone: NgZone) {
    this.loading = true;
    this.imageBuilds = [];
    this.imageBuildLog = '';

    this.editorOptions = {
      lineNumbers: false,
      theme: 'vs',
      language: 'dockerfile',
      minimap: {
        enabled: false
      },
      contextMenu: false,
      fontFamily: 'RobotoMono',
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

    this.form = {
      name: 'unnamed_image',
      dockerfile: [
        'FROM ubuntu:17.04',
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
        '    && apt-get install -y --no-install-recommends xvfb x11vnc fluxbox xterm',
        '',
        'RUN useradd -u 1000 -g 100 -G sudo --shell /bin/bash -m --home-dir /home/abstruse abstruse \\',
        '    && echo \'abstruse ALL=(ALL) NOPASSWD:ALL\' >> /etc/sudoers',
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
        '# --------------------------------------------------------------------------------------------------------------------------------',
        '',
        '# your commands go below: ',
        '# example; install Google Chrome',
        'RUN curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - \\',
        '    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee --append /etc/apt/sources.list.d/google-chrome.list \\',
        '    && sudo apt-get update \\',
        '    && sudo apt-get install --no-install-recommends -y google-chrome-stable',
        '',
        '# example; install nvm (Node Version Manager)',
        'RUN cd /home/abstruse \\',
        '    && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash \\',
        '    && export NVM_DIR="$HOME/.nvm" \\',
        '    && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"',
        '',
        '# commands below should be there for builds to work properly',
        '',
        'RUN sudo chmod +x /entry.sh /etc/init.d/* /usr/bin/abstruse*',
        'CMD ["/entry.sh"]',
        '',
        'EXPOSE 5900'
      ].join('\n'),
      initsh: [
        '# here you define scripts that should be loaded or static env variables',
        '# example for `nvm` or Node Version Manager',
        'if [ -d /home/abstruse/.nvm ]; then',
        '  source /home/abstruse/.nvm/nvm.sh',
        'fi'
      ].join('\n')
    };

    this.au = new ansiUp.default();
  }

  ngOnInit() {
    this.loading = false;

    this.socketService.outputEvents
      .filter(event => event.type === 'imageBuildProgress')
      .subscribe(event => {
        let output;
        try {
          output = JSON.parse(event.data.output.replace('\r\n', ''));
        } catch (e) {
          output = null;
        }

        if (output && output.id && output.progressDetail) {
          const buildIndex = this.findImageBuild(event.data.name);
          const layerIndex = this.findImageLayer(buildIndex, output.id);

          this.zone.run(() => {
            this.imageBuilds[buildIndex].layers[layerIndex] = output;
          });
        } else if (output && output.stream) {
          this.imageBuildLog += this.au.ansi_to_html(output.stream);
        } else if (output && output.errorDetail) {
          this.imageBuildLog += `<span style="color:rgb(255,85,85);">${output.errorDetail.message}</span>`;
        }
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

  ngOnDestroy() {

  }

  buildImage(): void {
    this.socketService.emit({ type: 'buildImage', data: this.form });
  }
}
