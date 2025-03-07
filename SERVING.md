# Serving the Application Locally with Nginx and ngrok

This document explains how to set up your local development environment so that your application is served over HTTPS on a custom domain (e.g., `https://lobby.local`) using Nginx as a reverse proxy, and then expose it publicly using ngrok.

> **Note:**
>
> - This guide assumes you have already built your frontend (e.g., using Vite) and your Flask backend (with Socket.IO) is running locally.
> - You must have generated SSL certificate and key files for your custom domain (e.g., using [mkcert](https://github.com/FiloSottile/mkcert)).

## 1. Map Your Custom Domain to Localhost

Edit your system's hosts file to point your custom domain (`lobby.local`) to your local machine.

- **macOS/Linux:**  
  Open a terminal and run:
  ```bash
  sudo nano /etc/hosts
  ```
- **Windows:**  
  Edit `C:\Windows\System32\drivers\etc\hosts` with administrator privileges.

Add the following line:

```
127.0.0.1    lobby.local
```

Save and close the file.

## 2. Prepare Your SSL Certificates

Make sure you have the SSL certificate and key for `lobby.local` (for example, `lobby.local.pem` and `lobby.local-key.pem`). Place them in a secure directory (e.g., in your project under a folder named `certs`).

## 3. Build Your Frontend

Assuming you are using Vite for your React app, navigate to the frontend directory and run:

```bash
cd multi-user-pregame-lobby/frontend
npm run build
```

This will output the production-ready static files (usually in a `dist` folder).

## 4. Configure Nginx as a Reverse Proxy

### Create an Nginx Configuration File

Create a file (for example, `nginx/lobby.local.conf.example`) in your repository with the following contents:

```nginx
server {
    listen 443 ssl;
    server_name lobby.local;

    # SSL Certificate and Key (update these paths to point to your certificate files)
    ssl_certificate     /path/to/your/certs/lobby.local.pem;
    ssl_certificate_key /path/to/your/certs/lobby.local-key.pem;

    # Root directory where your frontend static files are located
    root /path/to/multi-user-pregame-lobby/frontend/dist;
    index index.html;

    # Serve the Single Page Application (SPA)
    location / {
        try_files $uri /index.html;
    }

    # Proxy API requests to the Flask backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Proxy WebSocket connections for Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Set Up Nginx on macOS (Homebrew)

Homebrew’s Nginx configuration is typically located in `/usr/local/etc/nginx/`. By default, there may not be a dedicated `servers` directory, so you can create one and update `nginx.conf` to include it.

1. **Create a directory for server blocks:**

   ```bash
   sudo mkdir -p /usr/local/etc/nginx/servers
   ```

2. **Link the configuration file from your repo to the servers folder:**
   Replace `/path/to/your/repo/nginx/lobby.local.conf.example` with the actual path.

   ```bash
   sudo ln -s /path/to/your/repo/nginx/lobby.local.conf.example /usr/local/etc/nginx/servers/lobby.local.conf
   ```

3. **Update Nginx Configuration:**
   Edit `/usr/local/etc/nginx/nginx.conf` and add the following line inside the `http { ... }` block:

   ```nginx
   include servers/*.conf;
   ```

4. **Test and Restart Nginx:**
   ```bash
   nginx -t
   brew services restart nginx
   ```

## 5. Run Your Backend

Ensure your Flask (and Socket.IO) backend is running on port 5000. For example:

```bash
python -m backend.app
```

## 6. Expose Your Local Application with ngrok

With Nginx serving your application on port 443 (HTTPS), open a new terminal window and run ngrok:

```bash
ngrok http 443
```

ngrok will output a public URL (e.g., `https://abc123.ngrok.io`). This URL now points to your local Nginx server, which serves your static frontend and proxies API/WebSocket requests to your backend.

## 7. Verify Your Setup

- Open a browser and navigate to your ngrok URL (e.g., `https://abc123.ngrok.io`).
- You should see your application being served over HTTPS.
- Ensure that API calls and WebSocket connections are working as expected (they should be proxied to your Flask backend on port 5000).

## Troubleshooting

- **Hosts File:** Double-check that `lobby.local` is correctly mapped to `127.0.0.1`.
- **Certificate Paths:** Verify that the paths in your Nginx configuration point to the correct certificate files.
- **Nginx Logs:** Check Nginx’s error logs (usually in `/usr/local/var/log/nginx/`) if something isn’t working.
- **Backend Availability:** Confirm that your Flask backend is running and accessible on `http://127.0.0.1:5000`.

## Conclusion

This setup allows you to mimic a production-like environment locally by serving your application over HTTPS with a custom domain and exposing it publicly using ngrok. This is especially useful for testing integrations and ensuring your app behaves as expected before deploying to AWS.

Happy coding!
