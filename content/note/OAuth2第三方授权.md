+++
title = 'OAuth2第三方授权'
date = 2024-10-14T19:43:46+08:00
draft = true
+++

# 一、介绍

文档：https://datatracker.ietf.org/doc/html/rfc6749

## 1. 角色

- **Client：客户端**
  - 定义：客户端是想要访问资源服务器上的用户资源的应用程序或服务。它可以是网页应用、移动应用、桌面应用，甚至是服务器端应用。
  - 职责：
    - 发起授权请求：客户端向资源所有者请求访问权限，并引导资源所有者通过授权服务器进行授权。
    - 持有凭证：客户端拥有一个唯一的客户端标识符（Client ID）和可能的客户端密钥（Client Secret），用于在与授权服务器通信时进行身份验证。
    - 使用访问令牌：一旦获得访问令牌，客户端使用该令牌向资源服务器请求受保护的资源。
- **User Agent：用户代理**
  - 定义：通常是用户使用的浏览器。
  - 职责：用户（资源所有者）通过用户代理使得客户端与授权服务器进行通信。
- **Resource Server：资源服务器**
  - 定义：资源服务器托管着受保护的资源（如用户数据等）。它负责根据客户端提供的访问令牌来授权或拒绝对这些资源的访问。
  - 职责：
    - 保护资源：确保只有经过授权的请求才能访问受保护的资源。
    - 验证访问令牌：在收到客户端的请求时，资源服务器验证访问令牌的有效性和权限范围。
    - 提供资源：一旦令牌被验证，资源服务器将相应的资源数据返回给客户端。
- **Authorization Server：授权服务器**
  - 定义：授权服务器负责处理客户端的授权请求，验证资源所有者的身份，并颁发访问令牌（Access Token）给客户端。
  - 职责：
    - 处理授权请求：接受客户端的授权请求，包括资源所有者的授权。
    - 验证身份：通过各种方式（如用户名/密码、多因素认证等）验证资源所有者的身份。
    - 颁发令牌：在授权成功后，生成并颁发访问令牌（以及可选的刷新令牌）给客户端。
    - 管理令牌生命周期：负责令牌的生成、验证、刷新和撤销。
- **Resource Owner：资源所有者**
  - 定义：资源所有者通常是最终用户，拥有受保护资源的访问权限。资源所有者通过授权服务器授权客户端访问其资源。
  - 职责：
    - 授权决策：决定是否允许客户端访问其受保护的资源。
    - 提供授权：通过与授权服务器的交互，给予或撤销客户端的访问权限。

以某论坛系统要使用Github OAuth2授权为例：

- **客户端Client**是**论坛系统**
- **用户代理UserAgent**是**浏览器**
- **资源所有者ResourceOwner**是使用Github的**用户**
- **授权服务器AuthorizationServer**是**Github的授权服务器**
- **资源服务器ResourceServer**是**Github保存用户资源的服务器**

## 2. 交互流程

![OAuth2-flow](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F10%2F14%2Ff09586a42fc6180e8252a17c2c5cd884-oauth2-flow1-db8449.png)

第一张图片展示了基本的交互流程：

- AB客户端指的是UserAgent浏览器，CDEF客户端指的是Client应用程序。
- A：浏览器呈现给用户授权页面
- B：用户同意授权
- C：客户端发起一个授权请求
- D：授权成功后，授权服务器返回Access Token
- E：客户端携带Access Token，请求用户数据
- F：资源服务器传送回受保护的资源

在第二部分会展示更详细的流程。

## 3. 创建应用程序

填写：

- 应用名称：无关紧要
- 应用描述：无关紧要
- 应用主页：首页地址
- 回调地址：是客户端应用在 OAuth 2.0 授权流程中预先注册并提供给授权服务器的一个 URL。当用户完成授权操作后，授权服务器会将用户代理重定向回这个地址，并附带必要的参数（如授权码或访问令牌）。得到code之后，会将用户带回**回调页面**，将code发送给后端服务器，然后服务器请求授权服务器得到token

得到：

- Client id：客户端标识，唯一id
- Client Secret：不能泄露

# 二、授权码流程

![image-20241014205722975](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F10%2F14%2F1d225011d24149bc78dac64f8540db3d-image-20241014205722975-ac80d1.png)

第二张图片展示了授权码模式授权的详细流程

- A：（在左下角）客户端通过将浏览器（用户代理）重定向到授权页面来启动授权流程。客户端在请求中包含Client Id, request scope, local state, redirection URI。授权服务器将在访问被授权（或拒绝）后，通过该 URI 将用户代理返回给客户端。
- B：授权服务器对资源所有者（用户）进行身份验证（通过用户代理），并确定资源所有者（用户）是授予还是拒绝客户端的访问请求。
- C：假设资源所有者授予访问权限，授权服务器使用先前提供的回调 URI（在请求中或在客户端注册期间）将用户代理重定向回客户端。回调URI 包括授权码code和客户端先前提供的任何本地状态。
- D：客户端通过包含在上一步中收到的授权码，从授权服务器的令牌端点请求访问令牌。发出请求时，客户端会向授权服务器进行身份验证。
- E：授权服务器对客户端进行身份验证，验证授权代码code，并确保收到的回调 URI 与步骤 (C) 中用于重定向客户端的 URI 匹配。如果有效，授权服务器将使用访问令牌和刷新令牌进行响应。
- 至此，得到AccessToken，便可以携带token来请求用户数据。

以某论坛系统要使用Github OAuth2授权为例：

1. 用户在论坛系统上选择使用Github登录：论坛系统（客户端）将用户的浏览器（用户代理）重定向到GitHub的授权端点，同时传递必要的信息（如客户端ID、重定向URI、请求的权限范围等）。
2. 用户在Github上授权：GitHub的授权服务器提示用户登录（如果尚未登录）并请求用户授权论坛系统访问其GitHub数据。
3. 用户授权后，Github重定向回论坛系统。如果用户同意授权，GitHub的授权服务器将生成一个授权码code，并通过浏览器将其发送回论坛系统指定的重定向URI。
4. 论坛系统通过授权码code请求访问令牌AccessToken。论坛系统向GitHub的令牌端点发送请求，交换授权码以获取访问令牌。（用code换取token）
5. 获取访问令牌AccessToken后，论坛系统访问用户的Github数据。最重要的是拿到openid（id是某个系统用户的唯一标识），能拿到id就能说明拿到了用户数据，授权成功。

# 三、Java实现

## 1. 登录页面

界面

```vue
<div class="col text-center">
    <img src="@/assets/linuxdo.png" alt="" height="30px">
    <span @click="loginWithLinuxDo" style="cursor: pointer;">
      使用LinuxDo账号登录
    </span>
</div>
```

js

```js
const CLIENT_ID = "xxxxxxxxxxxxxxxxxxx"; // 替换为你的client_id
const REDIRECT_URI = "http://xxxxx/xxxx/linux-do/callback"; // 替换为你的重定向URI
const AUTHORIZATION_ENDPOINT = "https://connect.linux.do/oauth2/authorize";
const loginWithLinuxDo = () => {
  const state = generateRandomString(16); // 生成随机状态参数以防止CSRF
  localStorage.setItem("oauth_state", state); // 存储状态以便回调时验证
  const authUrl = `${AUTHORIZATION_ENDPOINT}?response_type=code&client_id=${encodeURIComponent(
    CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=${state}`;
  window.location.href = authUrl;
};

// 生成随机字符串
const generateRandomString = (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
```

流程

- 点击登录
- 重定向到授权页面authUrl
- 在授权页面点击确认
- 进入到回调地址

## 2. 回调页面

```vue
<!-- src/views/OAuthCallback.vue -->
<template>
  <div class="container">
    <h1>正在处理您的请求，请稍候。</h1>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import userApi from '@/api/user' // 导入 userApi
import { useTokenStore } from '@/stores/token.js'

export default {
  name: 'OAuthCallback',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const tokenStore = useTokenStore()

    onMounted(async () => {
      const urlParams = new URLSearchParams(route.query)
      const code = urlParams.get('code')

      if (code) {
        try {
          // 发送POST请求到后端服务器
          const res = await userApi.loginLinuxDo(code)
          const tokenData = {
            token: '',
            refreshToken: ''
          }
          tokenData.token = res.data.token
          tokenData.refreshToken = res.data.refreshToken
          console.log(tokenData)
          if (tokenData.token != '') {
            // 存储token
            tokenStore.setToken(tokenData)

            // 如果需要存储用户信息

            // 重定向到首页并携带欢迎消息
            router.push("/")
          } else {
            // 处理没有token的情况
            console.error('No token received')
            router.push({ name: 'login', query: { error: '认证失败，请重试。' } })
          }
        } catch (error) {
          console.error('Error during OAuth callback processing:', error)
          router.push({ name: 'login', query: { error: '认证过程中发生错误，请重试。' } })
        }
      } else {
        console.error('No code found in URL')
        router.push({ name: 'login', query: { error: '缺少授权码，请重试。' } })
      }
    })

    return {}
  },
}
</script>

<style scoped>
略
</style>
```

流程：

- 拿到code
- 将code发送到服务器
- 后端服务器处理，（授权成功，得到AccessToken，得到用户数据），给用户本网站的AccessToken
- 用户登录成功

## 3. 服务器处理

LinuxDoApiClient.java

- 根据code拿token
- 根据token拿用户数据

```java
@Component
public class LinuxDoApiClient {
    private RestTemplate restTemplate = new RestTemplate();

    @Value("${login.LinuxDo.clientId}")
    private String clientId;

    @Value("${login.LinuxDo.clientSecret}")
    private String clientSecret;

    @Value("${login.LinuxDo.redirectUri}")
    private String redirectUri;

public String getTokenByCode(String code) {
    String tokenEndpoint = "https://connect.linux.do/oauth2/token";
    try {
        // 构建请求体
        StringBuilder params = new StringBuilder();
        params.append("grant_type=").append(URLEncoder.encode("authorization_code", "UTF-8"));
        params.append("&code=").append(URLEncoder.encode(code, StandardCharsets.UTF_8));
        params.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));

        // 创建URL和连接
        URL url = new URL(tokenEndpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);

        // 设置请求头
        String credentials = clientId + ":" + clientSecret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes("UTF-8"));
        conn.setRequestProperty("Authorization", "Basic " + encodedCredentials);
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setRequestProperty("Accept", "application/json");

        // 发送请求体
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = params.toString().getBytes("UTF-8");
            os.write(input, 0, input.length);
        }

        // 读取响应
        int status = conn.getResponseCode();
        InputStream is = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();
        BufferedReader in = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            response.append(line);
        }
        in.close();

        // 解析响应
        String responseJson = response.toString();
        Map<String, Object> responseMap = JSONUtil.parseToMap(responseJson);
        Object accessToken = responseMap.get("access_token");
        if (accessToken == null) {
            String errorMessage = (String) responseMap.get("message");
            ExceptionTool.throwException("获取LinuxDoToken失败！错误信息：" + errorMessage);
        }
        return accessToken.toString();
    } catch (Exception e) {
        // 处理异常
        throw new RuntimeException("获取LinuxDoToken失败！", e);
    }
}

public Map<String, Object> getThirdUserInfo(String token) {
    String url = "https://connect.linux.do/api/user";
    try {
        URL obj = new URL(url);
        HttpURLConnection conn = (HttpURLConnection) obj.openConnection();
        conn.setRequestMethod("GET");

        // 设置Authorization头部
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setRequestProperty("Accept", "application/json");

        int responseCode = conn.getResponseCode();
        InputStream is = (responseCode >= 200 && responseCode < 300) ? conn.getInputStream() : conn.getErrorStream();
        BufferedReader in = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) {
            response.append(line);
        }
        in.close();

        // 解析响应
        String responseJson = response.toString();
        Map<String, Object> responseMap = JSONUtil.parseToMap(responseJson);

        Object openId = responseMap.get("id");
        if (openId == null) {
            // 可以根据需要抛出异常或返回特定错误信息
            throw new RuntimeException("获取用户信息失败，未找到id字段。");
        }

        HashMap<String, Object> thirdUser = new HashMap<>();
        thirdUser.put("openId", openId);
        thirdUser.put("nickname", responseMap.get("username")); // 使用username字段
        return thirdUser;
    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("获取LinuxDo用户信息失败！", e);
    }
}
}
```

LinuxDoAuthentication.java

用于封装与 LinuxDo 认证相关的认证信息。

```java
public class LinuxDoAuthentication extends AbstractAuthenticationToken {
  @Getter
  @Setter
  private String code; // 前端传过来
  private UserLoginDTO currentUser; // 认证成功后，后台从数据库获取信息

  public LinuxDoAuthentication() {
    // 权限，用不上，直接null
    super(null);
  }

  @Override
  public Object getCredentials() {
    return isAuthenticated() ? null : code;
  }

  @Override
  public Object getPrincipal() {
    return isAuthenticated() ? currentUser : null;
  }

  public UserLoginDTO getCurrentUser() {
    return currentUser;
  }

  public void setCurrentUser(UserLoginDTO currentUser) {
    this.currentUser = currentUser;
  }
}
```

LinuxDoAuthenticationFilter.java

用于拦截特定的认证请求路径，并将请求中的认证信息提取出来，封装成 `LinuxDoAuthentication` 对象，交由 Spring Security进行认证处理。

```java
public class LinuxDoAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

  private static final Logger logger = LoggerFactory.getLogger(LinuxDoAuthenticationFilter.class);

  public LinuxDoAuthenticationFilter(AntPathRequestMatcher pathRequestMatcher,
                                     AuthenticationManager authenticationManager,
                                     AuthenticationSuccessHandler authenticationSuccessHandler,
                                     AuthenticationFailureHandler authenticationFailureHandler) {
    super(pathRequestMatcher);
    setAuthenticationManager(authenticationManager);
    setAuthenticationSuccessHandler(authenticationSuccessHandler);
    setAuthenticationFailureHandler(authenticationFailureHandler);
  }

  @Override
  public Authentication attemptAuthentication(HttpServletRequest request,
      HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
    logger.debug("use LinuxDoAuthenticationFilter");

    // 提取请求数据
    String requestJsonData = request.getReader().lines()
        .collect(Collectors.joining(System.lineSeparator()));
    Map<String, Object> requestMapData = JSONUtil.parseToMap(requestJsonData);
    String code = requestMapData.get("code").toString();

    // 封装成Spring Security需要的对象
    LinuxDoAuthentication authentication = new LinuxDoAuthentication();
    authentication.setCode(code);
    authentication.setAuthenticated(false);

    // 开始登录认证。SpringSecurity会利用 Authentication对象去寻找 AuthenticationProvider进行登录认证
    return getAuthenticationManager().authenticate(authentication);
  }

}
```

LinuxDoAuthenticationProvider.java

负责验证来自 `LinuxDoAuthentication` 认证令牌中的认证码，与LinuxDo平台交互获取用户信息，并将其与本地系统的用户数据进行匹配或创建。

```java
@Component
public class LinuxDoAuthenticationProvider implements AuthenticationProvider {

  @Autowired
  private UserService userService;

  @Autowired
  private LinuxDoApiClient linuxDoApiClient;

  public static final String PLATFORM = "LinuxDo";

  public LinuxDoAuthenticationProvider() {
    super();
  }

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String code = (String) authentication.getCredentials();
    System.out.println("LinuxDo code: " + code);
    try {
      String token = linuxDoApiClient.getTokenByCode(code);
      System.out.println("LinuxDo token: " + token);
      if (token == null) {
        // 乱传code过来。用户根本没授权！
        ExceptionTool.throwException("授权失败！");
      }
      System.out.println("LinuxDo thirdUser: 111");
      Map<String, Object> thirdUser = linuxDoApiClient.getThirdUserInfo(token);
      if (thirdUser == null) {
        // 未知异常。获取不到用户openId，也就无法继续登录了
        ExceptionTool.throwException("授权失败！");
      }
      assert thirdUser != null;
      String openId = thirdUser.get("openId").toString();
      // 通过第三方的账号唯一id，去匹配数据库中已有的账号信息
      User user = userService.getUserByOpenId(openId, PLATFORM);
      boolean notBindAccount = user == null; // linuxdo账号没有绑定我们系统的用户
      if (notBindAccount) {
        // 没找到账号信息，那就是第一次使用linuxdo登录，可能需要创建一个新用户
        user = new User();
        userService.createUserWithOpenId(user, openId, PLATFORM);
        user = userService.getUserByOpenId(openId, PLATFORM);
      }
      LinuxDoAuthentication successAuth = new LinuxDoAuthentication();
      successAuth.setCurrentUser(JSONUtil.convert(user, UserLoginDTO.class));
      successAuth.setAuthenticated(true); // 认证通过，一定要设成true

      HashMap<String, Object> loginDetail = new HashMap<>();
      // 第一次使用三方账号登录，需要告知前端，让前端跳转到初始化账号页面（可能需要）
      loginDetail.put("needInitUserInfo", notBindAccount);
      loginDetail.put("nickname", thirdUser.get("nickname").toString()); // sayHello
      successAuth.setDetails(loginDetail);
      return successAuth;
    } catch (BaseException e) {
      // 转换已知异常，将异常内容返回给前端
      throw new BadCredentialsException(e.getMessage());
    } catch (Exception e) {
      // 未知异常
      throw new BadCredentialsException("LinuxDo Authentication Failed");
    }
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.isAssignableFrom(LinuxDoAuthentication.class);
  }
}
```

添加LinuxDo登录方式

```java
// 加一个登录方式。linuxdo 登录
LinuxDoAuthenticationFilter giteeFilter = new LinuxDoAuthenticationFilter(
        new AntPathRequestMatcher("/public/user/login/linuxdo", HttpMethod.POST.name()),
        new ProviderManager(
                List.of(applicationContext.getBean(LinuxDoAuthenticationProvider.class))),
        loginSuccessHandler,
        loginFailHandler);
http.addFilterBefore(giteeFilter, UsernamePasswordAuthenticationFilter.class);
```





