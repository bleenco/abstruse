import { Component, OnInit, OnDestroy, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs/Subscription';

export interface IImage {
  name: string;
  dockerfile: string;
  initsh: string;
  base: boolean;
}

export interface ImageBuildType {
  name: string;
  layers: { id: string, status: string, progress: string, progressDetail: any }[];
}

export const allowedCommands: string[] = ['FROM', 'ENV', 'RUN', 'COPY'];

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
  building: boolean;
  editingImage: boolean;
  success: boolean;
  removeingImage: boolean;
  baseImages: any[];
  baseImage: string;
  customImages: any[];
  tab: string;
  sub: Subscription;
  approve: boolean;
  terminalOptions:  { size: 'small' | 'large', newline: boolean };
  terminalInput: any;
  baseImageOptions: { key: any, value: string }[];
  imageTypeOptions: { key: any, value: string }[];
  dangerousCommands: string[];

  constructor(
    private socketService: SocketService,
    private zone: NgZone,
    private api: ApiService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.baseImages = [];
    this.baseImage = '';
    this.customImages = [];
    this.baseImageOptions = [];
    this.dangerousCommands = [];
    this.loading = true;
    this.approve = false;
    this.imageBuilds = [];
    this.imageTypeOptions = [{ key: false, value: 'Custom Image' }, { key: true, value: 'Base Image' }];
    this.terminalOptions = { size: 'large', newline: true };

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
    this.building = false;
    this.editingImage = false;
    this.removeingImage = false;
    this.tab = 'images';

    this.resetForm(!!this.baseImages.length);
  }

  ngOnInit() {
    this.loading = false;

    this.sub = this.socketService.outputEvents
      .filter(event => event.type === 'imageBuildProgress')
      .subscribe(event => {
        this.form.name = event.data.name;
        let output;
        try {
          output = JSON.parse(event.data.output);
        } catch (e) {
          output = null;
        }

        if (output) {
          this.building = true;
          this.tab = 'build';
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
            this.zone.run(() => this.terminalInput = output.stream);
          }
        } else if (output && output.errorDetail) {
          this.zone.run(() => this.terminalInput = `<span style="color:rgb(255,85,85);">${output.errorDetail.message}</span>`);
        }
      });

    this.socketService.emit({ type: 'subscribeToImageBuilder' });
    this.fetchImages();
  }

  resetForm(imageType: boolean): void {
    this.editingImage = false;

    if (imageType) {
      this.form = {
        name: 'nameless_image',
        dockerfile: [
          'FROM ' + this.baseImage,
          '',
          'COPY init.sh /home/abstruse/init.sh',
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
          '# giving docker access to abstruse user',
          'if [ -e /var/run/docker.sock ]; then',
          '  sudo chown -R 1000:100 /var/run/docker.sock > /dev/null 2>&1',
          'fi'
        ].join('\n'),
        base: !imageType
      };
    } else {
      this.form = {
        name: 'abstruse_builder',
        dockerfile: [
          'FROM ubuntu:17.10',
          '',
          'ENV DEBIAN_FRONTEND=noninteractive',
          '',
          '# please do not edit between lines or image on abstruse will not work properly',
          '',
          '# -------------------------------------------------------------------------------------------',
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
          'COPY abstruse-pty /usr/bin/abstruse-pty',
          'COPY abstruse-exec.sh /usr/bin/abstruse',
          '',
          'USER abstruse',
          'WORKDIR /home/abstruse/build',
          '',
          'RUN cd /home/abstruse && sudo chown -Rv 1000:100 /home/abstruse',
          '',
          'RUN sudo chmod +x /entry.sh /etc/init.d/* /usr/bin/abstruse*',
          'CMD ["/entry.sh"]',
          '',
          'EXPOSE 22 5900'
        ].join('\n'),
        initsh: '',
        base: !imageType
      };
    }
  }

  editImage(index: number, base: boolean): void {
    this.editingImage = true;
    this.updateForm(index, base);
    this.tab = 'build';
  }

  removeImage(index: number, base: boolean): void {
    this.removeingImage = true;
    window.scrollTo(0, 0);
    this.updateForm(index, base);
  }

  updateForm(index: number, base: boolean): void {
    if (base) {
      this.form.name = this.baseImages[index].name;
      this.form.dockerfile = this.baseImages[index].dockerfile;
      this.form.initsh = this.baseImages[index].initsh;
    } else {
      this.form.name = this.customImages[index].name;
      this.form.dockerfile = this.customImages[index].dockerfile;
      this.form.initsh = this.customImages[index].initsh;
    }
    this.form.base = base;
  }

  fetchImages(): void {
    this.loading = true;
    this.api.imagesList().subscribe(data => {
      this.customImages = [];
      this.baseImages = [];
      data.forEach(image => {
        if (image.base) {
          this.baseImages.push(image);
        } else {
          this.customImages.push(image);
        }
      });

      this.baseImageOptions = [];
      if (this.baseImages.length) {
        this.baseImages.forEach(i => this.baseImageOptions.push({ key: i.name, value: i.name}));
        this.baseImage = this.baseImages[0].name;
      }

      this.resetForm(!!this.baseImages.length);
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

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.socketService.emit({ type: 'unsubscribeFromImageBuilder' });
  }

  buildImage(): void {
    if (this.checkImage()) {
      this.approve = true;
      window.scrollTo(0, 0);
    } else {
      this.startBuild();
    }
  }

  checkImage(): boolean {
    this.dangerousCommands = [];
    if (!this.form.base) {
      let image = this.form.dockerfile.split('\n').filter(i => {
        return i[0] !== '#' && i.length && i[0] !== ' ';
      });
      image.forEach(c => {
        let command = c.split(' ');
        if (command) {
          if (allowedCommands.indexOf(command[0]) === -1
            && this.dangerousCommands.indexOf(command[0]) === -1) {
              this.dangerousCommands.push(command[0]);
          }
        }
      });
    }

    return !!this.dangerousCommands.length;
  }

  startBuild(): void {
    this.building = true;
    this.approve = false;
    this.socketService.emit({ type: 'buildImage', data: this.form });
  }

  startDelete(): void {
    this.removeingImage = false;
    if (this.form.base) {
      let index = this.baseImages.findIndex(i => i.name === this.form.name);
      this.baseImages.splice(index, 1);
    } else {
      let index = this.customImages.findIndex(i => i.name === this.form.name);
      this.customImages.splice(index, 1);
    }
    this.socketService.emit({ type: 'deleteImage', data: this.form });
  }

  changeBaseImageSelect(e: Event): void {
    let tmp = this.form.dockerfile.split('\n');
    if (tmp) {
      tmp[0] = `FROM ${e}`;
    }

    this.form.dockerfile = tmp.join('\n');
  }

  changeImageTypeSelect(e: Event): void {
    this.resetForm(!e);
  }
}
