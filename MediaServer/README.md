# Media Server

The Media Server is a intermediary application that sits between streamers and other peers. It handles the initial connection negotiations and some other small ongoing control messages between peers as well as acting as a simple web server for serving the [Frontend](/Frontend/README.md) web application.

## Building
Building is handled by `npm` and `tsc`. However, the easiest method to install and build everything is to invoke:

## Building manually

However, if you would like to manually build them yourself (or build other configs), you will need to:

```bash
npm install
npm run build
# Or npm run build-dev
```