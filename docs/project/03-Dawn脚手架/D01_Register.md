---
sidebar_position: 1
---

# 注册

## 一、验证码

### 1. 行为验证码

#### 1.1 工作原理

> “人类在执行交互操作（滑动、拖动、点击等）时，会产生具有特征的行为轨迹，而机器人程序很难完美模拟这种自然行为。”

主要流程：

1. **前端展示交互任务**：
    比如滑块拼图、旋转图片、拖动滑条到指定位置、点击正确顺序的图标等。
2. **用户进行操作**：
    系统会记录用户行为的轨迹（如鼠标移动路径、加速度、时间间隔等）。
3. **后端验证行为特征**：
    通过算法判断该行为轨迹是否符合“人类自然操作特征”，以及最终结果是否正确。
4. **返回验证结果**：
    成功后生成一个验证通过的 token，用于后续的敏感操作（如登录、发送验证码等）。

#### 1.2 常见类型

| 类型             | 示例                                   | 验证逻辑                |
| ---------------- | -------------------------------------- | ----------------------- |
| **滑块验证码**   | 拖动拼图滑块到缺口位置                 | 判断滑动轨迹 + 最终位置 |
| **旋转验证码**   | 旋转图片使其角度正确                   | 判断旋转角度与轨迹      |
| **点选验证码**   | 按顺序点击特定区域（如“猫、狗、鸟”）   | 判断点击位置与顺序      |
| **轨迹验证码**   | 模拟拖拽、涂抹等自然动作               | 轨迹特征匹配            |
| **智能行为分析** | 分析鼠标轨迹、点击节奏、页面焦点变化等 | 使用机器学习模型判定    |

#### 1.3 应用场景

行为验证码通常用于以下安全敏感操作前：

- 登录、注册、密码找回
- 发送短信或邮箱验证码
- 提交表单、发表评论
- 防止爬虫、恶意接口请求

#### 1.4 优点

✅ 用户体验好（交互简单、无须输入文字）
✅ 安全性高（机器人难以模拟真实行为）
✅ 可结合风控系统使用（行为数据可二次分析）
✅ 支持无障碍设计，部分版本可适配移动端触摸操作

#### 1.5 常用方案

| 名称                             | 简介                                               | 语言/框架                |
| -------------------------------- | -------------------------------------------------- | ------------------------ |
| **Tianai-Captcha（天爱验证码）** | 开源 Java 行为验证码组件，支持滑块、旋转等多种模式 | Java + Spring Boot       |
| **CAPTCHAjs / Cap**              | 前端行为验证方案，提供可视化验证弹窗               | JavaScript / React / Vue |
| **GeeTest（极验）**              | 商业级行为验证码服务，广泛用于企业安全验证         | 多语言SDK                |
| **Altcha**                       | 免费且隐私友好的前端行为验证组件                   | HTML + JS，支持静态部署  |

天爱验证码：https://github.com/dromara/tianai-captcha

#### 1.6 实现案例

application.yml配置

```yml
# 行为验证码配置， 详细请看 cloud.tianai.captcha.autoconfiguration.ImageCaptchaProperties 类
captcha:
  # 如果项目中使用到了redis，滑块验证码会自动把验证码数据存到redis中， 这里配置redis的key的前缀,默认是captcha:slider
  prefix: captcha
  # 验证码过期时间，默认是2分钟,单位毫秒， 可以根据自身业务进行调整
  expire:
    # 默认缓存时间 2分钟
    default: 10000
    # 针对 点选验证码 过期时间设置为 2分钟， 因为点选验证码验证比较慢，把过期时间调整大一些
    WORD_IMAGE_CLICK: 20000
  # 使用加载系统自带的资源， 默认是 false(这里系统的默认资源包含 滑动验证码模板/旋转验证码模板,如果想使用系统的模板，这里设置为true)
  init-default-resource: true
  # 缓存控制， 默认为false不开启
  local-cache-enabled: false
  # 缓存开启后，验证码会提前缓存一些生成好的验证数据， 默认是20
  local-cache-size: 20
  # 缓存开启后，缓存拉取失败后等待时间 默认是 5秒钟
  local-cache-wait-time: 5000
  # 缓存开启后，缓存检查间隔 默认是2秒钟
  local-cache-period: 2000
  # 配置字体包，供文字点选验证码使用,可以配置多个，不配置使用默认的字体
  font-path:
    - classpath:font/SimHei.ttf
  secondary:
    # 二次验证， 默认false 不开启
    enabled: false
    # 二次验证过期时间， 默认 2分钟
    expire: 120000
    # 二次验证缓存key前缀，默认是 captcha:secondary
    keyPrefix: "captcha:secondary"
```

后端

```java
@RestController
@RequestMapping("/captcha")
@RequiredArgsConstructor
public class CaptchaController {
    @Autowired
    private ImageCaptchaApplication application;
    private final StringRedisTemplate stringRedisTemplate;

    @PostMapping("/gen")
    public ApiResponse<ImageCaptchaVO> genCaptcha() {
        // 生成验证码(该数据返回给前端用于展示验证码数据)
        // 参数1为具体的验证码类型， 默认支持 SLIDER、ROTATE、WORD_IMAGE_CLICK、CONCAT 等验证码类型，详见： `CaptchaTypeConstant`类
        return  application.generateCaptcha(CaptchaTypeConstant.SLIDER);
    }

    @PostMapping("/check")
    public ApiResponse<?> checkCaptcha(@RequestBody Data data) {
        ApiResponse<?> response = application.matching(data.getId(), data.getData());
        if (response.isSuccess()) {
            // 验证码验证成功，此处应该进行自定义业务处理， 或者返回验证token进行二次验证等。
            stringRedisTemplate.opsForValue().set(RedisConstant.CAPTCHA_VALID_TOKEN_PREFIX + data.getId(), "true", 5 * 60, java.util.concurrent.TimeUnit.SECONDS);
            return ApiResponse.ofSuccess(Collections.singletonMap("validToken", data.getId()));
        }
        return response;
    }

    @lombok.Data
    public static class Data {
        // 验证码id
        private String  id;
        // 验证码数据
        private ImageCaptchaTrack data;
        // 可以加用户自定义业务参数...
    }
}
```

前端 `CaptchaDialog.jsx`

```jsx
"use client";

import { useEffect, useState } from "react";

/**
 * 通用行为验证码组件（基于 Tianai Captcha）
 * props:
 * - onSuccess: 验证成功后的回调 (token 或验证结果)
 * - onFail: 验证失败回调（可选）
 * - visible: 控制是否显示验证窗口
 * - onClose: 验证窗口关闭事件
 */
export const CaptchaDialog = ({ visible, onSuccess, onFail, onClose }) => {
  const [tacLoaded, setTacLoaded] = useState(false);

  /** 动态加载 Tianai Captcha SDK */
  const loadTACScript = () => {
    return new Promise((resolve, reject) => {
      if (window.initTAC) {
        setTacLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "/tac/js/tac.min.js"; // 放在 public/tac 下
      script.onload = () => {
        setTacLoaded(true);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);

      // 加载样式
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/tac/css/tac.css";
      document.head.appendChild(link);
    });
  };

  /** 初始化验证码 */
  const initCaptcha = async () => {
    if (!visible) return;
    if (!tacLoaded) await loadTACScript();

    const config = {
      requestCaptchaDataUrl: "/api/captcha/gen", // 后端生成接口
      validCaptchaUrl: "/api/captcha/check",     // 校验接口
      bindEl: "#captcha-box",
      validSuccess: (res, c, tac) => {
        console.log("✅ 验证成功:", res);
        tac.destroyWindow();
        onSuccess?.(res);
      },
      validFail: (res, c, tac) => {
        console.warn("❌ 验证失败:", res);
        tac.reloadCaptcha();
        onFail?.(res);
      },
      btnRefreshFun: (el, tac) => tac.reloadCaptcha(),
      btnCloseFun: (el, tac) => {
        tac.destroyWindow();
        onClose?.();
      },
    };

    const style = {
      logoUrl: null, // 不显示 logo
    };

    window
      .initTAC("/tac", config, style)
      .then((tac) => tac.init())
      .catch((e) => console.error("初始化TAC失败:", e));
  };

  useEffect(() => {
    initCaptcha();
  }, [visible]);

  return visible ? <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        id="captcha-box"
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 0 12px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      ></div>
    </div> : null;
};
```

### 2. 邮箱验证码

以126邮箱为例。

#### 2.1 126邮箱

进入设置页面：

![image-20251105183606178](.\assets\image-20251105183606178.png)

开启SMTP服务：

![image-20251105183658637](.\assets\image-20251105183658637.png)

记住 **授权码**。

#### 2.2 后端实现

引入依赖：

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

application.yml

```yml
spring:
  mail:
    host: smtp.126.com
    username: xxxxx@126.com
    password: xxxxxxxxxxxxxxxx
    default-encoding: UTF-8
```

EmailDTO

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDTO {
    // 收件邮箱
    private String email;
    // 标题
    private String title;
    // 内容
    private String content;
}
```

EmailService

```java
public interface EmailService {
    void sendMsg(EmailDTO emailDTO);
}
```

EmailServiceImpl

```java
@Service
public class EmailServiceImpl implements EmailService {
    //邮件发送人 application.yml中的username
    @Value("${spring.mail.username}")
    private String from;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendMsg(EmailDTO emailDTO) {
        //创建一个对象
        SimpleMailMessage mailMessage = new SimpleMailMessage();

        //开始发送
        mailMessage.setFrom(from);
        mailMessage.setTo(emailDTO.getEmail());
        mailMessage.setSubject(emailDTO.getTitle());
        mailMessage.setText(emailDTO.getContent());

        //真正的发送邮件操作，从from到to
        mailSender.send(mailMessage);
    }
}
```

### 3. 短信验证码

#### 3.1 短信宝平台

官网：https://console.smsbao.com/#/index

文档：https://www.smsbao.com/openapi

#### 3.2 后端实现

application.yml

```yml
sms:
  username: dawnstar
  password: Password0k$
  content: 【xxxx】您的验证码是{code}。如非本人操作，请忽略本短信
```

SmsService

```java
public interface SmsService {
    void sendMsg(String phone,String code, String type);
}
```

SmsServiceImpl

```java
/**
 * 短信服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsServiceImpl implements SmsService {

    private final StringRedisTemplate stringRedisTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final HttpServletRequest request;

    private static final String RATE_LIMITER_KEY = "rate_limiter:";
    private static final int MAX_REQUESTS = 5; // 最大请求次数
    private static final int TIME_WINDOW = 60; // 时间窗口（秒）

    @Value("${sms.username}")
    private String smsUsername;
    @Value("${sms.password}")
    private String smsPassword;
    @Value("${sms.content}")
    private String smsContent;

    @Override
    public void sendMsg(String phone,String code, String type) {
        if (phone == null){
            ExceptionTool.throwException("手机号不能为空");
        }
        // 获取客户端 IP
        String clientIp = IpUtil.getClientIp(request);
        // 检查是否超过请求限制
        if (!allowRequest(clientIp)) {
            ExceptionTool.throwException("请求频率过高，请稍后再试");
        }
        String key = ""; // Redis key，用于后续校验
        if (CodeTypeEnum.REGISTER_PHONE_CODE.getType().equals(type)){
            // 注册
            key = RedisConstant.PHONE_REGISTER_CODE_PREFIX + phone;
        } else if(CodeTypeEnum.LOGIN_PHONE_CODE.getType().equals(type)){
            // 登录
            key = RedisConstant.PHONE_LOGIN_CODE_PREFIX + phone;
        } else {
            ExceptionTool.throwException("未知的验证码类型");
        }
        // 往Redis中存储一个键值对
        ValueOperations<String, String> operations = stringRedisTemplate.opsForValue();
        operations.set(key,  code, RedisConstant.CODE_TIME_SECOND, TimeUnit.SECONDS);
        // 模拟发送短信
        log.info("发送短信成功------------");
        sendSmsByBao(code, phone, clientIp);
    }

    private boolean allowRequest(String ip) {
        String key = RATE_LIMITER_KEY + ip;
        Long currentCount = redisTemplate.opsForValue().increment(key);

        if (currentCount == 1) {
            redisTemplate.expire(key, TIME_WINDOW, TimeUnit.SECONDS);
        }

        return currentCount <= MAX_REQUESTS;
    }

    private void sendSmsByBao(String code, String phone, String ip){
        if (!allowRequest(ip)) {
            System.out.println(ip + "请求频率过高，请稍后再试");
            throw new RuntimeException("请求频率过高，请稍后再试");
        }
        String myUsername = smsUsername; //在短信宝注册的用户名
        String myPassword = smsPassword; //在短信宝注册的密码
        String myContent = smsContent;
        String content = myContent.replace("{code}", code); //要发送的短信内容

        String httpUrl = "http://api.smsbao.com/sms";

        StringBuffer httpArg = new StringBuffer();
        httpArg.append("u=").append(myUsername).append("&");
        httpArg.append("p=").append(md5(myPassword)).append("&");
        httpArg.append("m=").append(phone).append("&");
        httpArg.append("c=").append(encodeUrlString(content, "UTF-8"));

        String result = request(httpUrl, httpArg.toString());
        System.out.println(result);
    }

    public static String request(String httpUrl, String httpArg) {
        BufferedReader reader = null;
        String result = null;
        StringBuilder sbf = new StringBuilder();
        httpUrl = httpUrl + "?" + httpArg;

        try {
            URL url = new URL(httpUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();
            InputStream is = connection.getInputStream();
            reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
            String strRead = reader.readLine();
            if (strRead != null) {
                sbf.append(strRead);
                while ((strRead = reader.readLine()) != null) {
                    sbf.append("\n");
                    sbf.append(strRead);
                }
            }
            reader.close();
            result = sbf.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public static String md5(String plainText) {
        StringBuilder buf = null;
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(plainText.getBytes());
            byte[] b = md.digest();
            int i;
            buf = new StringBuilder();
            for (byte value : b) {
                i = value;
                if (i < 0)
                    i += 256;
                if (i < 16)
                    buf.append("0");
                buf.append(Integer.toHexString(i));
            }
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return buf.toString();
    }

    public static String encodeUrlString(String str, String charset) {
        String strret = null;
        if (str == null)
            return str;
        try {
            strret = java.net.URLEncoder.encode(str, charset);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return strret;
    }
}
```

## 二、注册

注册方式有邮箱注册和手机号注册。

![image-20251106215049166](.\assets\image-20251106215049166.png)

![image-20251106215104816](.\assets\image-20251106215104816.png)

### 1. 注册步骤

用户首先输入邮箱/手机号，点击获取验证码，进行行为校验，行为校验通过后会发送验证码。

用户获取验证码之后，输入验证码、密码和确认密码进行注册。

### 2. 实现

#### 2.1 前端

`Register.tsx`

```tsx
"use client";

import React, { useRef, useState } from "react";
import { Button, Input, Checkbox, Link, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";

import { sendCodeAPI } from "@/apis/user";
import { CaptchaDialog } from "@/components/common/CaptchaDialog";

export const Register = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);

  const [countdown, setCountdown] = React.useState(0); // 倒计时
  const [registerType, setRegisterType] = useState<"email" | "phone">("email");
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");

  const [captchaVisible, setCaptchaVisible] = useState(false); // 控制行为验证码弹窗
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /** 密码显示切换 */
  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  /** 提交注册逻辑 */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registerType === "email") {
      // 📬 邮箱注册逻辑
      console.log("邮箱注册");
    } else {
      // 📱 手机注册逻辑
      console.log("手机注册");
    }
  };
    
   /** 🧠 点击“获取验证码”前先进行行为验证 */
  const handleBeforeSendCode = () => {
    if (countdown > 0) return; // 防止重复点击
    if (!emailOrPhone) {
      toast.error("请输入邮箱或手机号！");
      return;
    }
    setCaptchaVisible(true); // 显示行为验证弹窗
  };

  /** ✅ 行为验证码通过后再发送验证码 */
  const handleCaptchaSuccess = async (res: any) => {
    console.log("行为验证通过:", res);
    setCaptchaVisible(false);

    try {
      const type = registerType === "email" ? "emailRegister" : "phoneRegister";

      // 传递行为验证返回的token到后端（如果后端需要）
      const resData = await sendCodeAPI(emailOrPhone, type, res.data.validToken);
      // const resData = await sendCodeAPI(emailOrPhone, type);

      if (resData.code === 0) {
        toast.success(
          registerType === "email"
            ? "📬 验证码已发送至邮箱"
            : "📱 验证码已发送至手机"
        );
      } else {
        toast.error(resData.message || "发送失败");
        return;
      }

      // 启动倒计时
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("发送验证码失败，请稍后再试");
    }
  };

  /** ✨ 清除定时器 */
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-large flex w-full max-w-sm flex-col gap-2 px-8">
        <p className="pb-2 text-left text-3xl font-semibold">
          注册
          <span aria-label="emoji" className="ml-2" role="img">
            👋
          </span>
        </p>

        {/* 注册方式切换 */}
        <Tabs
          fullWidth
          aria-label="注册方式"
          selectedKey={registerType}
          variant="underlined"
          onSelectionChange={(key) =>
            setRegisterType(key as "email" | "phone")
          }
        >
          <Tab key="email" title="邮箱注册" />
          <Tab key="phone" title="手机号注册" />
        </Tabs>

        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          {/*  邮箱注册 */}
          {registerType === "email" && (
            <Input
              isRequired
              label="邮箱"
              labelPlacement="outside"
              name="email"
              placeholder="请输入邮箱"
              type="email"
              variant="bordered"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
          )}

          {/* 手机注册 */}
          {registerType === "phone" && (
            <Input
              isRequired
              label="手机号"
              labelPlacement="outside"
              name="phone"
              placeholder="请输入手机号"
              type="tel"
              variant="bordered"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
          )}

          {/* 验证码（两种方式共用） */}
          <div className="flex gap-2">
            <Input
              isRequired
              label="验证码"
              labelPlacement="outside"
              name="code"
              placeholder="请输入验证码"
              type="text"
              variant="bordered"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleBeforeSendCode}
              className="h-[40px] mt-6"
              disabled={countdown > 0}
              color={countdown > 0 ? "default" : "primary"}
            >
              {countdown > 0 ? `${countdown}s` : "获取验证码"}
            </Button>
          </div>

          {/* 密码 */}
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="密码"
            labelPlacement="outside"
            name="password"
            placeholder="请输入密码"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />

          {/* 确认密码 */}
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleConfirmVisibility}>
                {isConfirmVisible ? (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="text-default-400 pointer-events-none text-2xl"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="确认密码"
            labelPlacement="outside"
            name="confirmPassword"
            placeholder="请再次输入密码"
            type={isConfirmVisible ? "text" : "password"}
            variant="bordered"
          />

          <Checkbox isRequired className="py-4" size="sm">
            我同意&nbsp;
            <Link className="relative z-1" href="#" size="sm">
              用户协议
            </Link>
            &nbsp;和&nbsp;
            <Link className="relative z-1" href="#" size="sm">
              隐私政策
            </Link>
          </Checkbox>

          <Button color="primary" type="submit">
            注册
          </Button>
        </form>
        <p className="text-small text-center">
          <Link href="/login" size="sm">
            已有账号? 去登录
          </Link>
        </p>
      </div>
      {/* ✨ 行为验证码弹窗 */}
      <CaptchaDialog
        visible={captchaVisible}
        onSuccess={handleCaptchaSuccess}
        onClose={() => setCaptchaVisible(false)}
      />
    </div>
  );
}
```

`user.ts`

```ts
import request from "./index";

/** 接口返回通用结构 */
export interface Result<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 发送验证码（邮箱或手机）
 * @param emailOrPhone 邮箱或手机号
 * @param type 类型：emailLogin, phoneLogin, emailRegister, phoneRegister
 */
export const sendCodeAPI = (
  emailOrPhone: string,
  type: string,
  token: string
): Promise<Result> => {
  return request.post("/sendCode", null, {
    params: { emailOrPhone, type, token },
  });
};
```

#### 2.2 后端

```java
/**
 * 注册
 * - 检查用户是否存在
 * - 检查验证码是否正确
 * - 检查两次密码是否一致
 * - 保存用户信息
 * @param registerDTO
 */
@Override
public void register(RegisterDTO registerDTO) {
    // 查询用户是否存在
    SysUser userByUsernameOrEmail = userMapper.getUserByUsernameOrEmailOrPhone(registerDTO.getEmail());
    if (userByUsernameOrEmail != null){
        ExceptionTool.throwException("用户已存在！");
    }
    // 检查验证码是否正确
    ValueOperations<String, String> operations = stringRedisTemplate.opsForValue();
    String key = "";
    if (Objects.equals(registerDTO.getType(), CodeTypeEnum.REGISTER_EMAIL_CODE.getType())){
        key = EMAIL_REGISTER_CODE_PREFIX + registerDTO.getEmail();
    } else if (Objects.equals(registerDTO.getType(), CodeTypeEnum.REGISTER_PHONE_CODE.getType())){
        key = PHONE_REGISTER_CODE_PREFIX + registerDTO.getPhone();
    }
    String redisCode = operations.get(key);
    if (!registerDTO.getCode().equals(redisCode)){
        ExceptionTool.throwException("验证码错误！");
    }
    // 检查两次密码是否一致
    if (!registerDTO.getPassword().equals(registerDTO.getRePassword())){
        ExceptionTool.throwException("两次密码不一致！");
    }
    SysUser user = new SysUser();
    user.setUsername(registerDTO.getEmail());
    user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
    user.setCreateTime(LocalDateTime.now());
    user.setUpdateTime(LocalDateTime.now());
    // 获取两种角色
    SysRole roleSuperAdmin = sysRoleService.getRoleByRoleCode("ROLE_SUPER_ADMIN");
    SysRole roleUser = sysRoleService.getRoleByRoleCode("ROLE_USER");
    userMapper.add(user);
    // superAdminList设置为Super Admin，其他用户设置为普通用户User
    List<String> superAdminList = getSuperAdminList();
    if (superAdminList.contains(registerDTO.getEmail()) ||
        superAdminList.contains(registerDTO.getPhone())
    ) {
        sysUserRoleService.add(user.getId(), roleSuperAdmin.getId());
        return;
    }
    sysUserRoleService.add(user.getId(), roleUser.getId());
}
```





