---
sidebar_position: 1
---

# Bark推送

使用Bark向iphone推送消息。

## 1. 部署服务端

```
mkdir bark && cd bark
curl -sL https://git.io/JvSRl > docker-compose.yaml
docker-compose up -d
```

参考https://bark.day.app/#/deploy



## 2. 配置HTTPS

Nginx配置

```
server {
    if ($host = bark.xxx.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name bark.xxx.com;

    return 301 https://$host$request_uri;


}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name bark.xxx.com;
    ssl_certificate /etc/letsencrypt/live/bark.xxx.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/bark.xxx.com/privkey.pem; # managed by Certbot

    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_buffering off;
        proxy_read_timeout 300s;
    }

}
```



申请证书

```
certbot --nginx -d bark.xxx.com
```

链接

```
ln -s /etc/nginx/sites-available/bark.conf \
      /etc/nginx/sites-enabled/bark.conf
```



## 3. Springboot应用

application.yml

```
bark:
  api-url: https://bark.xxx.com
  device-key: xxxxxxxxxxxxxxxxxxxxx
```

BarkPushDTO.java

```java
@Data
public class BarkPushDTO {

    private String title;
    private String subtitle;
    private String body;

    private String level;
    private String group;
    private String sound;
    private Integer badge;
    private String url;
}
```

BarkPushUtil.java

```java
@Slf4j
@Component
public class BarkPushUtil {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${bark.api-url}")
    private String apiUrl;

    @Value("${bark.device-key}")
    private String deviceKey;

    /**
     * 发送简单推送（仅body）
     */
    public boolean push(String body) {
        try {
            // 使用 JSON 方式推送，避免中文乱码
            BarkPushDTO dto = new BarkPushDTO();
            dto.setBody(body);
            return pushAdvancedJson(dto);
        } catch (Exception e) {
            log.error("Bark推送失败", e);
            return false;
        }
    }

    /**
     * 发送带标题的推送
     */
    public boolean push(String title, String body) {
        try {
            // 使用 JSON 方式推送，更稳定
            BarkPushDTO dto = new BarkPushDTO();
            dto.setTitle(title);
            dto.setBody(body);
            return pushAdvancedJson(dto);
        } catch (Exception e) {
            log.error("Bark推送失败", e);
            return false;
        }
    }

    /**
     * 发送完整推送（title + subtitle + body）
     */
    public boolean push(String title, String subtitle, String body) {
        try {
            // 使用 JSON 方式推送，避免中文乱码
            BarkPushDTO dto = new BarkPushDTO();
            dto.setTitle(title);
            dto.setSubtitle(subtitle);
            dto.setBody(body);
            return pushAdvancedJson(dto);
        } catch (Exception e) {
            log.error("Bark推送失败", e);
            return false;
        }
    }

    /**
     * 发送重要警告（critical级别，静音模式也会响铃）
     */
    public boolean pushCritical(String title, String body) {
        BarkPushDTO dto = new BarkPushDTO();
        dto.setTitle(title);
        dto.setBody(body);
        dto.setLevel("critical");
        dto.setSound("alarm");
        return pushAdvancedJson(dto);
    }

    /**
     * 发送分组消息
     */
    public boolean pushWithGroup(String title, String body, String group) {
        BarkPushDTO dto = new BarkPushDTO();
        dto.setTitle(title);
        dto.setBody(body);
        dto.setGroup(group);
        return pushAdvancedJson(dto);
    }

    /**
     * 发送高级推送 - POST JSON方式（推荐）
     */
    public boolean pushAdvancedJson(BarkPushDTO dto) {
        try {
            String url = apiUrl + "/push";

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("device_key", deviceKey);

            if (dto.getTitle() != null) {
                requestBody.put("title", dto.getTitle());
            }
            if (dto.getSubtitle() != null) {
                requestBody.put("subtitle", dto.getSubtitle());
            }
            if (dto.getBody() != null) {
                requestBody.put("body", dto.getBody());
            }
            if (dto.getLevel() != null) {
                requestBody.put("level", dto.getLevel());
            }
            if (dto.getGroup() != null) {
                requestBody.put("group", dto.getGroup());
            }
            if (dto.getSound() != null) {
                requestBody.put("sound", dto.getSound());
            }
            if (dto.getBadge() != null) {
                requestBody.put("badge", dto.getBadge());
            }
            if (dto.getUrl() != null) {
                requestBody.put("url", dto.getUrl());
            }

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("Bark JSON推送成功: {}", response.getBody());
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.error("Bark JSON推送失败", e);
            return false;
        }
    }
}
```

