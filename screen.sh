git fetch --all
git reset --hard origin/master
docker build -t scanner:latest .
docker run -it scanner:latest
