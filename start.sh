mkdir -p logs

case "$1" in
  server)
    echo "Starting Server"
    nohup node nodeshot-server/app.js --NODE_CONFIG_DIR="./nodeshot-server/config" &> logs/server.log &
    ;;
  renderer)
    echo "Start Renderer"
    nohup node nodeshot-renderer --NODE_CONFIG_DIR="./nodeshot-renderer/config"  &> logs/renderer-$2.log &
    ;;
  *)
    echo "Usage: start.sh {server|renderer name}"
    exit 1
esac