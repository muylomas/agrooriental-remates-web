sudo cp /etc/letsencrypt/live/seguimiento.agrooriental.uy/chain.pem /etc/ssl/seguimiento_chain.pem
sudo cp /etc/letsencrypt/live/seguimiento.agrooriental.uy/privkey.pem /etc/ssl/seguimiento_privkey.pem
sudo cp /etc/letsencrypt/live/seguimiento.agrooriental.uy/cert.pem /etc/ssl/seguimiento_cert.pem

sudo chown ubuntu /etc/ssl/seguimiento_chain.pem
sudo chown ubuntu /etc/ssl/seguimiento_cert.pem 
sudo chown ubuntu /etc/ssl/seguimiento_privkey.pem
sudo chgrp ubuntu /etc/ssl/seguimiento_chain.pem
sudo chgrp ubuntu /etc/ssl/seguimiento_cert.pem
sudo chgrp ubuntu /etc/ssl/seguimiento_privkey.pem

runuser -l ubuntu -c 'NODE_ENV=production pm2 reload all'
