# Screenshot as a Service

A simple screenshot web service powered by [Express](http://expressjs.com) and [node-webkit](https://github.com/rogerwang/node-webkit).
Inspired by [fzaninotto/screenshot-as-a-service](https://github.com/fzaninotto/screenshot-as-a-service)

This screenshot-service is using node-webkit which comes with a recent version of [CEF](https://code.google.com/p/chromiumembedded/)
, an up to date wrapper of Chromium. In contrast to phantomjs node-webkit supports 3D CSS and WebGL and thus can produce
better screenshots.

## Example

See this [DEMO](http://s.codepen.io/FWeinb/fullpage/mELoj) (Be aware that it is running on a $5 digitalocean machine. Be patient!)

## Requirements

  1. [node-webkit](https://github.com/rogerwang/node-webkit) in `PATH`
  2. [node-js](http://nodejs.org)

## Running

  1. `git clone https://github.com/FWeinb/screenshot-service.git && cd screenshot-service`
  2. `npm install`
  3. Run `nodewebkit .` in the `screenshot-service` folder
  4. Open `http://localhost:8080/?url=http://s.codepen.io/FWeinb/fullpage/oyACz`

## API Usage

```
# Take a screenshot
GET /?url=www.google.com
# Return a 1024x600 PNG screenshot of the www.google.com homepage

# Custom viewport size
GET /?url=www.google.com&width=800&height=600
# Return a 800x600 PNG screenshot of the www.google.com homepage

# Asynchronous call
GET /?url=www.google.com&callback=http://www.myservice.com/screenshot/google
# Return an empty response immediately (HTTP 200 OK),
# then send a POST request to the callback URL when the screenshot is ready
# with the PNG image in the body.

# Screenshot delay
GET /?url=www.google.com&delay=1000
# Return a 1024x600 PNG screenshot of the www.google.com homepage
# 1 second after it's loaded
```
## Configuration

This project is using [node-config](https://github.com/lorenwest/node-config) so you can find the config [here](/config/default.yaml)

### Extended configuration

[node-webkit](https://github.com/rogerwang/node-webkit) can pass startup flags to chromium via the `chromium-args` value
in the `package.json`.
See node-webkit [manifest-format](https://github.com/rogerwang/node-webkit/wiki/Manifest-format) for more information.


## Using a headless node-webkit via xvfb

DISCLAIMER: For WebGL/3D CSS support you need hardware acceleration. Keep that in mind!

### Get a VM (optional)

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


