sudo cp /etc/letsencrypt/live/equinos.agrooriental.uy/chain.pem /etc/ssl/equinos_chain.pem
sudo cp /etc/letsencrypt/live/equinos.agrooriental.uy/privkey.pem /etc/ssl/equinos_privkey.pem
sudo cp /etc/letsencrypt/live/equinos.agrooriental.uy/cert.pem /etc/ssl/equinos_cert.pem

sudo chown ubuntu /etc/ssl/equinos_chain.pem
sudo chown ubuntu /etc/ssl/equinos_cert.pem 
sudo chown ubuntu /etc/ssl/equinos_privkey.pem
sudo chgrp ubuntu /etc/ssl/equinos_chain.pem
sudo chgrp ubuntu /etc/ssl/equinos_cert.pem
sudo chgrp ubuntu /etc/ssl/equinos_privkey.pem

runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
