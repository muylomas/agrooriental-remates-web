sudo cp /etc/letsencrypt/live/mercado-agro.com/chain.pem /etc/ssl
sudo cp /etc/letsencrypt/live/mercado-agro.com/privkey.pem /etc/ssl
sudo cp /etc/letsencrypt/live/mercado-agro.com/cert.pem /etc/ssl

sudo chown ubuntu /etc/ssl/chain.pem
sudo chown ubuntu /etc/ssl/cert.pem 
sudo chown ubuntu /etc/ssl/privkey.pem
sudo chgrp ubuntu /etc/ssl/chain.pem
sudo chgrp ubuntu /etc/ssl/cert.pem
sudo chgrp ubuntu /etc/ssl/privkey.pem

runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
