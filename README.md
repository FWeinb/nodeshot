<img src="http://nodeshot.it/assets/logo/nodeshot-big.png">

A simple screenshot web service powered by [Kue](https://github.com/LearnBoost/kue), [Express](http://expressjs.com) and [node-webkit](https://github.com/rogerwang/node-webkit).
Inspired by [fzaninotto/screenshot-as-a-service](https://github.com/fzaninotto/screenshot-as-a-service)

This screenshot-service is using node-webkit which comes with a recent version of Chromium. In contrast to phantomjs node-webkit supports 3D CSS and WebGL and therefore can produce better screenshots.

## Example

~~See this [DEMO](http://nodeshot.it) (Be aware that it is running on a $5 digitalocean machine. Be patient!)~~

## Requirements

  1. [node-webkit](https://github.com/rogerwang/node-webkit) in `PATH`
  2. [node](http://nodejs.org)
  3. [redis](http://redis.io)

## Things you should know
On OS X the node-webkit executable is called `node-webkit` and on linux and Windows it's called `nw`. Keep that in mind.

## Running

  1. `git clone https://github.com/FWeinb/noteshot.git && cd noteshot`
  2. Bootstrap the project `./bootstrap.sh`
  3. Start/Install [redis](http://redis.io)
  4. Run `./start.sh server` once
  5. Run `./start.sh renderer X` where `X` is is the number/name of the renderer. (You can start more than one)
  6. Open `http://localhost:8080/?url=http://s.codepen.io/FWeinb/fullpage/oyACz`
  7. See `http://localhost:8080/kue` for queued jobs. (See the password in `nodeshot-server/config/default.yaml`.)

## API Usage

### Simple API

The result of each request will be the requested image.

```
# Take a screenshot
GET /?url=www.google.com
# Return a 1024x600 PNG screenshot of the www.google.com homepage

# Take a screenshot as jpeg
GET /?url=www.google.com&format=jpeg
# Return a 1024x600 JPEG screenshot of the www.google.com homepage

# Take a screenshot of the whole page
GET /?url=www.google.com&fullpage=true
# Return a screenshot of the whole www.google.com homepage

# Custom viewport size
GET /?url=www.google.com&width=800&height=600
# Return a 800x600 PNG screenshot of the www.google.com homepage

# Screenshot delay
GET /?url=www.google.com&delay=1000
# Return a 1024x600 PNG screenshot of the www.google.com homepage
# 1 second after it's loaded
```


### Ajax API

The result of each request will be an JSON object.

Same options as in the Simple API. Just prefix the request with `/ajax/`

Example:
```
# Take a screenshot
GET /ajax/?url=www.google.com
# Success: 200 {"request" : "success", "url" : "[URL to resulting image]"}
# Error: 500 {"request" : "failed", "reason" : "[Message]"}
```

## Configuration

This project is using [node-config](https://github.com/lorenwest/node-config).

### Extended configuration

[node-webkit](https://github.com/rogerwang/node-webkit) can pass startup flags to chromium via the `chromium-args` value
in the `package.json`. See node-webkit [manifest-format](https://github.com/rogerwang/node-webkit/wiki/Manifest-format) for more information.


## CAUTION
Please change the default password in `nodeshot-server/config/default.yaml`

## Using a headless node-webkit via xvfb

DISCLAIMER: For WebGL/3D CSS support you need hardware acceleration. Keep that in mind!

### Get a VM (optional)

  1. Go to `https://www.digitalocean.com/`
  2. Create a $5 droplet with Ubuntu
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
  2. Start/Install [redis](http://redis.io)
  3. Get this repo `git clone https://github.com/fweinb/nodeshot && cd nodeshot`
  4. Bootstrap the project `./bootstrap.sh`
  5. Run `./start.sh server` once
  6. Run `./start.sh renderer X` where `X` is is the number/name of the renderer. (You can start more than one)
  7. Open `http://[IP]:8080/?url=http://s.codepen.io/FWeinb/fullpage/oyACz`

## Thanks to
[Joshua Hibbert](https://twitter.com/_joshnh) for creating the logo.

