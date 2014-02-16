# Screenshot as a Service

A simple screenshot web service powered by [Express](http://expressjs.com) and [node-webkit](https://github.com/rogerwang/node-webkit).
Inspired by [fzaninotto/screenshot-as-a-service](https://github.com/fzaninotto/screenshot-as-a-service)

This screenshot-service is using node-webkit which comes with a recent version of [CEF](https://code.google.com/p/chromiumembedded/)
an up to date wrapper of Chromium. In contrast to phantomjs node-webkit supports for 3D CSS and WebGL and thus can produce
better screenshots.

## Requirements

  1. Download [node-webkit](https://github.com/rogerwang/node-webkit)
  2. Put it in `PATH`

## Running

  1. `git clone https://github.com/fweinb/screenshot-service && cd screenshot-service`
  2. Run `nodewebkit .` in the `screenshot-service` folder


## Configurate

This project is using [node-config](https://github.com/lorenwest/node-config) so you can find the config [here](/config/default.yaml)


## Using headless node-webkit via xvfb

DISCLAIMER: For WebGL/3D CSS support you need hardware acceleration. Keep that in mind!

[Optional]
  1. Go to `https://www.digitalocean.com/`
  2. Create a $5 droplet
  3. Login via `ssh`

### Installing xvfb

  1. Install minmal xorg `sudo apt-get install xorg`
  2. Install xvfb `sudo apt-get install xvfb`
  3. Install fonts `sudo apt-get install xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic`
  4. Install ttf fonts `sudo apt-get install -y x-ttcidfont-conf cabextract ttf-mscorefonts-installer` (Accept the EULA)
  5. Reconfigure fonts `sudo dpkg-reconfigure --default-priority x-ttcidfont-conf` (This fixed an issue for me)
  6. Start xvfb on display :99  `xvfb :99 &`
  7. Make :99 the default display `export DISPLAY=:99`

### Installing node-webkit and screenshot-service

  1. Download [node-webkit](https://github.com/rogerwang/node-webkit) and put it on `PATH`
  2. Get this repo `git clone https://github.com/fweinb/screenshot-service && cd screenshot-service`
  3. Start `nodewebkit .`


