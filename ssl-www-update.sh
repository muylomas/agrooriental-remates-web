sudo cp /etc/letsencrypt/live/www.mercado-agro.com/chain.pem /etc/ssl/www_chain.pem
sudo cp /etc/letsencrypt/live/www.mercado-agro.com/privkey.pem /etc/ssl/www_privkey.pem
sudo cp /etc/letsencrypt/live/www.mercado-agro.com/cert.pem /etc/ssl/www_cert.pem

sudo chown ubuntu /etc/ssl/www_chain.pem
sudo chown ubuntu /etc/ssl/www_cert.pem 
sudo chown ubuntu /etc/ssl/www_privkey.pem
sudo chgrp ubuntu /etc/ssl/www_chain.pem
sudo chgrp ubuntu /etc/ssl/www_cert.pem
sudo chgrp ubuntu /etc/ssl/www_privkey.pem

runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
