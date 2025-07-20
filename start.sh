sudo docker rmi bonk
sudo docker build -t bonk .
sudo docker run -d --restart always bonk
