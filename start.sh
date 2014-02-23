nw="nw"
if [ "$(uname)" == "Darwin" ]; then
  nw="node-webkit"
fi

mkdir -p logs

case "$1" in
  server)
    echo "Starting Server"
    nohup node nodeshot-server/app.js --NODE_CONFIG_DIR="./nodeshot-server/config" &> logs/server.log &
    ;;
  renderer)
    echo "Start Renderer"
    export NODE_CONFIG_DIR='config'
    nohup $nw nodeshot-renderer &> logs/renderer-$2.log &
    ;;
  *)
    echo "Usage: start.sh {server|renderer name}"
    exit 1
esac