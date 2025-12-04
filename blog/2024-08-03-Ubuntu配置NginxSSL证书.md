---
slug: Ubuntu-NginxSSL
title: 在Ubuntu配置NginxSSL证书
authors: [yrx]
tags: [linux]
---

在Ubuntu22.04上配置NginxSSL证书的步骤

<!-- truncate -->

# 1. 安装Certbot

Certbot 是 Let's Encrypt 的官方客户端,用于自动获取和部署 SSL 证书。在 Ubuntu 22.04 上,可以使用以下命令安装 Certbot 及其 Nginx 插件:

```
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

# 2. 配置Nginx

在获取 SSL 证书之前,我们需要确保 Nginx 已经正确配置。编辑你网站的 Nginx 配置文件(一般在 `/etc/nginx/sites-available/` 目录下),确保其中包含以下内容:

```
server {
    listen 80;
    server_name example.com;
    # 其他配置...
}
```

将 `example.com` 替换为你自己的域名。

# 3. 获取SSL证书

现在,我们可以使用 Certbot 来获取 SSL 证书。运行以下命令:

```
sudo certbot --nginx -d example.com
```

同样,将 `example.com` 替换为你自己的域名。Certbot 会自动检测 Nginx 配置并为你的域名申请证书。按照提示完成操作,如果一切顺利,你应该会看到类似以下的输出:

```
IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/example.com/fullchain.pem
   Your key file has been saved at:
   /etc/letsencrypt/live/example.com/privkey.pem
   Your certificate will expire on 2023-07-10. To obtain a new or
   tweaked version of this certificate in the future, simply run
   certbot again with the "certonly" option. To non-interactively
   renew *all* of your certificates, run "certbot renew"
 - If you like Certbot, please consider supporting our work by:

   Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
   Donating to EFF:                    https://eff.org/donate-le
```

# 4. 配置自动续期

Let's Encrypt 的证书有效期为 90 天,因此我们需要设置自动续期。运行以下命令编辑 `crontab`:

```
sudo crontab -e
```

选择你喜欢的编辑器,然后添加以下内容:

```
0 0 1 * * /usr/bin/certbot renew --quiet
```

这将在每个月的第一天自动尝试续期证书。

# 5. 测试自动续期

为了确保自动续期配置正确,我们可以手动触发一次续期:

```
sudo certbot renew --dry-run
```

如果一切正常,你应该会看到类似以下的输出:

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/example.com.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cert not due for renewal, but simulating renewal for dry run
Plugins selected: Authenticator nginx, Installer nginx
Simulating renewal of an existing certificate for example.com
Performing the following challenges:
http-01 challenge for example.com
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed with reload of nginx server; fullchain is
/etc/letsencrypt/live/example.com/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded: 
  /etc/letsencrypt/live/example.com/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```
