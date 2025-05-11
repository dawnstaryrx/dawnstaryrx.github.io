+++
title = 'SpringSecurity6笔记'
date = 2024-10-06T10:09:28+08:00
draft = false

+++

# 一、统一API响应数据结构

定义统一响应结果类Result.java

```java
//统一响应结果
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Integer code;//业务状态码  0-成功  1-失败
    private String message;//提示信息
    private T data;//响应数据

    //快速返回操作成功响应结果(带响应数据)
    public static <E> Result<E> success(E data) {
        return new Result<>(0, "操作成功", data);
    }

    //快速返回操作成功响应结果
    public static Result success() {
        return new Result(0, "操作成功", null);
    }

    public static Result error(String message) {
        return new Result(1, message, null);
    }
}
```

测试

```java
@RestController
public class TestController {
    @GetMapping("/testA")
    public Result testA(){
        return Result.success();
    }

    @GetMapping("/testB")
    public Result testB(){
        if (true){
            throw new RuntimeException("testB");
        }
        return Result.error("testB");
    }
}
```

全局异常处理器

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage())?e.getMessage():"操作失败！");
    }
}
```

> 认证authentication和授权authorization
>
> 身份验证是关于验证您的凭据，如用户名/用户ID和密码，以验证您的身份。系统确定您是否就是您所说的使用凭据。在公共和专用网络中，系统通过登录密码验证用户身份。身份验证通常通过用户名和密码完成，有时与身份验证因素结合使用，后者指的是各种身份验证方式。
>
> 授权是确定经过身份验证的用户是否可以访问特定资源的过程。它验证您是否有权授予您访问信息，数据库，文件等资源的权限。授权通常在验证后确认您的权限。简单来说，就像给予某人官方许可做某事或任何事情。

# 二、多种方式登录

## 1. 不用SpringSecurity

UsernameAuthentication

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsernameAuthentication {
    private String username;
    private String password;
}
```

SmsAuthentication

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SmsAuthentication {
    private String phone;
    private String code;
}
```

登录

```java
// 用户名登录
@PostMapping("/user/login/username")
public Result loginByUsername(@RequestBody UsernameAuthentication usernameAuthentication){
    // 1. 获取请求参数
    String username = usernameAuthentication.getUsername();
    String password = usernameAuthentication.getPassword();
    // 2. 验证用户名密码
    System.out.println("username"+ username + " password" + password);
    // 3. 认证通过，返回jwt token
    HashMap<Object, Object> responseData = new HashMap<>();
    responseData.put("token", "jwtToken...");
    responseData.put("refreshToken", "refreshToken...");
    return Result.success(responseData);
}
// 短信登录
@PostMapping("/user/login/sms")
public Result loginBySms(@RequestBody SmsAuthentication smsAuthentication){
    // 1. 获取请求参数
    String phone = smsAuthentication.getPhone();
    String code = smsAuthentication.getCode();
    // 2. 验证短信验证码
    System.out.println("phone:" + phone + " code:" + code);
    // 3. 认证通过，返回jwt token
    HashMap<Object, Object> responseData = new HashMap<>();
    responseData.put("token", "jwtToken...");
    responseData.put("refreshToken", "refreshToken...");
    return Result.success(responseData);
}
```

## 2. 使用SpringSecurity

依赖

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 2.1 Filter

**什么是Filter？**  

在Java Web应用中，`Filter` 是一种用于在请求到达Servlet之前或响应离开Servlet之后，对请求和响应进行预处理或后处理的组件。它们基于Java Servlet规范，允许开发者在请求处理的生命周期中插入自定义逻辑。

**Spring Boot中Filter的作用**  

在Spring Boot中，Filter通常用于以下场景：

1. **日志记录**：记录每个请求的详细信息，如URL、请求参数、响应时间等。
2. **身份验证和授权**：检查用户是否已认证或是否有权限访问特定资源。
3. **请求修改**：对请求进行预处理，例如修改请求头、参数等。
4. **响应修改**：对响应进行后处理，例如添加自定义头信息。
5. **CORS处理**：处理跨域资源共享（CORS）相关的请求。

#### 2.1.1 创建一个Filter

要创建一个Filter，需要实现`javax.servlet.Filter`接口或继承`OncePerRequestFilter`（Spring提供的抽象类，确保每个请求只执行一次Filter）。

**示例：简单的日志记录Filter**

```java
public class LoggingFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化Filter，如果需要的话
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        System.out.println("Incoming request data log: " + httpRequest.getMethod() + " " + httpRequest.getRequestURI());
        
        // 继续过滤器链
        chain.doFilter(request, response);
        
        // 可以在这里对响应进行后处理
    }

    @Override
    public void destroy() {
        // 清理资源，如果需要的话
    }
}
```

#### 2.1.2 注册Filter

在Spring Boot中，有多种方式注册Filter：  

**方法一：使用`@Component`注解**  

将Filter类标记为Spring的组件，这样Spring Boot会自动注册它。

```java
import org.springframework.stereotype.Component;

@Component
public class LoggingFilter implements Filter {
    // 实现方法同上
}
```

不过，这种方式不允许你自定义Filter的顺序或指定URL模式。

**方法二：通过`@Bean`注册Filter**  

在配置类中定义一个`FilterRegistrationBean`，可以更灵活地配置Filter。

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<LoggingFilter> loggingFilter(){
        FilterRegistrationBean<LoggingFilter> registrationBean 
          = new FilterRegistrationBean<>();
        
        registrationBean.setFilter(new LoggingFilter());
        registrationBean.addUrlPatterns("/*"); // 拦截所有请求
        registrationBean.setOrder(1); // 设置Filter顺序
        
        return registrationBean;    
    }
}
```

#### 2.1.3 Filter与拦截器（Interceptor）的区别

虽然Filter和Spring的拦截器（`HandlerInterceptor`）都可以用于请求的预处理和后处理，但它们有一些关键区别：

- **层级不同**：
  - Filter运行在Servlet容器层面，可以拦截所有进入应用的请求，包括静态资源。
  - 拦截器运行在Spring MVC框架层面，只拦截被Spring MVC处理的请求。

- **功能不同**：
  - Filter主要用于处理请求和响应，如编码、日志、安全等。
  - 拦截器主要用于处理业务逻辑前后的操作，如权限检查、事务管理等。

- **配置方式不同**：
  - Filter通过`FilterRegistrationBean`或注解配置。
  - 拦截器通过实现`HandlerInterceptor`接口并在Spring MVC配置中注册。

#### 2.1.4 示例：身份验证Filter

以下是一个简单的身份验证Filter示例，检查请求头中是否存在特定的认证令牌：

```java
public class AuthFilter implements Filter {

    private static final String AUTH_TOKEN = "SecretToken";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 初始化逻辑
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String token = httpRequest.getHeader("Authorization");

        if (AUTH_TOKEN.equals(token)) {
            // 认证通过，继续请求
            chain.doFilter(request, response);
        } else {
            // 认证失败，返回401
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        }
    }

    @Override
    public void destroy() {
        // 清理资源
    }
}
```

**注册Filter：**

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<AuthFilter> authFilter(){
        FilterRegistrationBean<AuthFilter> registrationBean 
          = new FilterRegistrationBean<>();
        
        registrationBean.setFilter(new AuthFilter());
        registrationBean.addUrlPatterns("/secure/*"); // 只拦截/secure/下的请求
        registrationBean.setOrder(2); // 设置Filter顺序
        
        return registrationBean;    
    }
}
```

#### 2.1.5 Filter的顺序

在一个应用中可能存在多个Filter，设置Filter的顺序非常重要。`FilterRegistrationBean`的`setOrder(int order)`方法用于定义Filter的执行顺序，数字越小，优先级越高，越先执行。

#### 2.1.6 常见的第三方Filter

Spring Boot集成了许多常用的Filter，例如：

- **CharacterEncodingFilter**：设置请求和响应的字符编码。
- **HiddenHttpMethodFilter**：支持HTML表单的PUT、DELETE等HTTP方法。
- **CorsFilter**：处理跨域请求。

你可以通过配置这些Filter来满足应用的需求，或者创建自定义的Filter以实现特定功能。

### 2.2 默认SpringSecurity Filter 和 基础配置

默认

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
        );
    return http.build();
}
```

Filter

```
2024-10-06T21:21:30.829+08:00 DEBUG 29180 --- [demo4] [           main] o.s.s.web.DefaultSecurityFilterChain     : Will secure any request with filters: DisableEncodeUrlFilter, WebAsyncManagerIntegrationFilter, SecurityContextHolderFilter, HeaderWriterFilter, CorsFilter, CsrfFilter, 【LogoutFilter, RequestCacheAwareFilter, 】SecurityContextHolderAwareRequestFilter, AnonymousAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter
```

自定义Filter应该放在LogoutFilter退出登录, UsernamePasswordAuthenticationFilter校验密码之间



```
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
        );

    http
        .addFilterBefore(new LoggingFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
2024-10-06T21:28:45.740+08:00 DEBUG 27908 --- [demo4] [           main] o.s.s.web.DefaultSecurityFilterChain     : Will secure any request with filters: DisableEncodeUrlFilter, WebAsyncManagerIntegrationFilter, SecurityContextHolderFilter, HeaderWriterFilter, CorsFilter, CsrfFilter, 【LogoutFilter, LoggingFilter, RequestCacheAwareFilter, 】SecurityContextHolderAwareRequestFilter, AnonymousAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter
```

#### 2.2.1 禁用无用的Filter

```java
// 禁用SpringSecurity默认filter。这些filter都是非前后端分离项目的产物，用不上.
// yml配置文件将日志设置DEBUG模式，就能看到加载了哪些filter
// logging:
//    level:
//       org.springframework.security: DEBUG
// 表单登录/登出、session管理、csrf防护等默认配置，如果不disable。会默认创建默认filter
http.formLogin(AbstractHttpConfigurer::disable)
    .httpBasic(AbstractHttpConfigurer::disable)
    .logout(AbstractHttpConfigurer::disable)
    .sessionManagement(AbstractHttpConfigurer::disable)
    .csrf(AbstractHttpConfigurer::disable)
    // requestCache用于重定向，前后端分析项目无需重定向，requestCache也用不上
    .requestCache(cache -> cache
        .requestCache(new NullRequestCache())
    )
    // 无需给用户一个匿名身份
    .anonymous(AbstractHttpConfigurer::disable);
```

#### 2.2.2 认证

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    System.out.println("Incoming request data log: " + httpRequest.getMethod() + " " + httpRequest.getRequestURI());
    
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    Authentication authentication =
            new TestingAuthenticationToken("username", "password", "ROLE_USER");
    context.setAuthentication(authentication);

    SecurityContextHolder.setContext(context);
    // 继续过滤器链
    chain.doFilter(request, response);

    // 可以在这里对响应进行后处理
}
```

#### 2.2.3 错误拦截返回统一数据结构

CustomAccessDeniedHandler

```java
// 自定义访问拒绝处理器
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public CustomAccessDeniedHandler(ObjectMapper objectMapper){
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        Result<Void> result = Result.error("权限不足，拒绝访问！");
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
```

CustomAuthenticationExceptionHandler

```java
@Component
public class CustomAuthenticationExceptionHandler implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationExceptionHandler(ObjectMapper objectMapper){
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException authException) throws IOException, ServletException {
        Result<Void> result = Result.error("未认证，请登录！");
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
```

GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage())?e.getMessage():"操作失败！");
    }
    // 处理认证异常
    @ExceptionHandler(AuthenticationException.class)
    public Result<Void> handleAuthenticationException(AuthenticationException e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage()) ? e.getMessage() : "认证失败！");
    }

    // 处理授权异常
    @ExceptionHandler(AccessDeniedException.class)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage()) ? e.getMessage() : "权限不足！");
    }
}
```

配置异常处理

```
http
.exceptionHandling(exception -> exception                      .authenticationEntryPoint(customAuthenticationExceptionHandler)
                        .accessDeniedHandler(customAccessDeniedHandler));
```

1. 当用户提交他们的凭证时，`AbstractAuthenticationProcessingFilter` 会从 `HttpServletRequest` 中创建一个要认证的[`Authentication`](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-authentication)。创建的认证的类型取决于 `AbstractAuthenticationProcessingFilter` 的子类。例如，[`UsernamePasswordAuthenticationFilter`](https://springdoc.cn/spring-security/servlet/authentication/passwords/form.html#servlet-authentication-usernamepasswordauthenticationfilter)从 `HttpServletRequest` 中提交的 *username* 和 *password* 创建一个 `UsernamePasswordAuthenticationToken`。

2. 接下来，[`Authentication`](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-authentication) 被传入 [`AuthenticationManager`](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-authenticationmanager)，以进行认证。

3. 如果认证失败，则为 *Failure*。

   - [SecurityContextHolder](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder) 被清空。

   - `RememberMeServices.loginFail` 被调用。如果没有配置记住我（remember me），这就是一个无用功。请参阅 [`rememberme`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/authentication/rememberme/package-frame.html) 包。

   - `AuthenticationFailureHandler` 被调用。参见 [`AuthenticationFailureHandler`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/authentication/AuthenticationFailureHandler.html) 接口。

4. 如果认证成功，则为 *Success*。

   - `SessionAuthenticationStrategy` 被通知有新的登录。参见 [`SessionAuthenticationStrategy`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/authentication/session/SessionAuthenticationStrategy.html) 接口。

   - [Authentication](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-authentication) 是在 [SecurityContextHolder](https://springdoc.cn/spring-security/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder) 上设置的。后来，如果你需要保存 `SecurityContext` 以便在未来的请求中自动设置，必须显式调用 `SecurityContextRepository#saveContext`。参见 [`SecurityContextHolderFilter`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/context/SecurityContextHolderFilter.html) 类。

   - `RememberMeServices.loginSuccess` 被调用。如果没有配置 remember me，这就是一个无用功。请参阅 [`rememberme`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/authentication/rememberme/package-frame.html) 包。

   - `ApplicationEventPublisher` 发布一个 `InteractiveAuthenticationSuccessEvent` 事件。

   - `AuthenticationSuccessHandler` 被调用。参见 [`AuthenticationSuccessHandler`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/web/authentication/AuthenticationSuccessHandler.html) 接口。

### 2.3 用户名密码登录

#### 2.3.1 service

UserService

```java
@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 通过openId获取用户信息
     * @param openId
     * @param thirdPlatform 三方平台，比如gitee/qq/wechat
     * @return
     */
    public User getUserByOpenId(String openId, String thirdPlatform) {
        System.out.println("通过openId从数据库查询user"); // todo
        if (thirdPlatform.equals("gitee")) {
            User testUser = new User();
            testUser.setUserId(1003L);
            testUser.setUsername("Tom");
            testUser.setRoleId("manager");
            testUser.setPassword(passwordEncoder.encode("manager"));
            testUser.setPhone("123000123");
            return testUser;
        }
        return null;
    }

    public User getUserByPhone(String phoneNumber) {
        if (phoneNumber.equals("1234567890")) {
            User testUser = new User();
            testUser.setUserId(1002L);
            testUser.setUsername("manager");
            testUser.setRoleId("manager");
            testUser.setPassword(passwordEncoder.encode("manager"));
            testUser.setPhone("1234567890");
            return testUser;
        }
        return null;
    }

    public User getUserFromDB(String username) {
        if (username.equals("admin")) {
            User testUser = new User();
            testUser.setUserId(1001L);
            testUser.setUsername("admin");
            testUser.setRoleId("admin");
            testUser.setPassword(passwordEncoder.encode("admin"));
            return testUser;
        }
        return null;
    }

    public void createUserWithOpenId(User user, String openId, String platform) {
        System.out.println("在数据库创建一个user"); // todo
        System.out.println("user绑定openId"); // todo
    }
}
```

JWT

依赖

```
<jjwt.version>0.11.5</jjwt.version>
<!-- jwt -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>${jjwt.version}</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>${jjwt.version}</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>${jjwt.version}</version>
</dependency>
```

JwtService

```java
@Service
public class JwtService implements InitializingBean {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    private PrivateKey privateKey;

    private JwtParser jwtParser;

    public String createJwt(Object jwtPayload, long expiredAt) {
        //添加构成JWT的参数
        Map<String, Object> headMap = new HashMap();
        headMap.put("alg", SignatureAlgorithm.RS256.getValue());//使用RS256签名算法
        headMap.put("typ", "JWT");
        Map body = JSON.parse(JSON.stringify(jwtPayload), HashMap.class);
        String jwt = Jwts.builder()
                .setHeader(headMap)
                .setClaims(body)
                .setExpiration(new Date(expiredAt))
                .signWith(privateKey)
                .compact();
        return jwt;
    }

    @Value("${login.jwt.private-key:MI}")
    private String privateKeyBase64;
    //获取私钥，用于生成Jwt
    private PrivateKey getPrivateKey() {
        try {
            // 利用JDK自带的工具生成私钥
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PKCS8EncodedKeySpec ks = new PKCS8EncodedKeySpec(Decoders.BASE64.decode(privateKeyBase64));
            return kf.generatePrivate(ks);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
//            ExceptionTool.throwException("获取Jwt私钥失败");
            throw new BaseException("获取Jwt私钥失败");
//            return null;
        }
    }

    @Value("${login.jwt.public-Key:MI}")
    private String publicKeyBase64;
    // 公钥，用于解析Jwt
    private JwtParser getJwtParser() {
        try {
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Decoders.BASE64.decode(publicKeyBase64));
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey pk = keyFactory.generatePublic(keySpec);
            return Jwts.parserBuilder().setSigningKey(pk).build();
        } catch (Exception e) {
            // 获取公钥失败
//            ExceptionTool.throwException("获取Jwt公钥失败");
//            return null;
            throw new BaseException("获取Jwt公钥失败");
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        privateKey = getPrivateKey();
        jwtParser = getJwtParser();
    }

    public <T> T verifyJwt(String jwt, Class<T> jwtPayloadClass) {
        if (jwt == null || jwt.equals("")) {
            return null;
        }
        Jws<Claims> jws = this.jwtParser.parseClaimsJws(jwt); // 会校验签名，校验过期时间
        Claims jwtPayload = jws.getBody();
        if (jwtPayload == null) {
            return null;
        }
        return JSON.convert(jwtPayload, jwtPayloadClass);
    }

    public static <T> T getPayload(String jwt, Class<T> jwtPayloadClass) {
        if (jwt == null || jwt.equals("")) {
            return null;
        }

        try {
            // jwt字符串由3部分组成，用英文的点分割：herder.payload.sign
            // 可以直接取中间一段，进行Base64解码
            byte[] decodedBytes = Base64.getDecoder().decode(jwt.split("\\.")[1]);
            return JSON.parse(new String(decodedBytes), jwtPayloadClass);
        } catch (Exception e) {
            return null;
        }
    }
}
```

#### 2.3.2 Util

JSON

```Java
public class JSON {

  private static final ObjectMapper objectMapper = new ObjectMapper();

  static {
    // 反序列时，遇到未知的字段，不报错。比如Json中有key1字段，Java的object中没有key1字段，如果不设置成false，反序列时会报错
    objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    // 数字类型统一转成String， 因为前端Js不支持long类型的数据，前端读取到long类型数据会丢失后三位数
    objectMapper.configure(JsonWriteFeature.WRITE_NUMBERS_AS_STRINGS.mappedFeature(), true);
  }

  public static <T> T convert(Object obj, Class<T> returnType) {
    if (obj == null) {
      return null;
    }
    return parse(stringify(obj), returnType);
  }

  /**
   * Object to json
   *
   * @param obj
   * @return
   */
  public static String stringify(Object obj) {
    try {
      if (obj == null) {
        return null;
      } else if (obj instanceof String) {
        return obj.toString();
      }
      return objectMapper.writeValueAsString(obj);
    } catch (Exception e) {
      throw new IllegalArgumentException("对象转化成json字符串出错", e);
    }
  }

  /**
   * json to Object
   *
   * @param json
   * @param targetType
   * @param <T>
   * @return
   */
  public static <T> T parse(String json, Type targetType) {
    try {
      return objectMapper.readValue(json, TypeFactory.defaultInstance().constructType(targetType));
    } catch (IOException e) {
      throw new IllegalArgumentException("将JSON转换为对象时发生错误:" + json, e);
    }
  }

  public static <T> T parse(String json, Class<T> targetType) {
    try {
      return objectMapper.readValue(json, TypeFactory.defaultInstance().constructType(targetType));
    } catch (IOException e) {
      throw new IllegalArgumentException("将JSON转换为对象时发生错误:" + json, e);
    }
  }

  /**
   * json to Object
   */
  public static <T> T parse(String json, TypeReference<T> typeReference) {
    if (json != null && !json.isEmpty()) {
      try {
        return objectMapper.readValue(json, typeReference);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    } else {
      return null;
    }
  }

  public static Map<String, Object> parseToMap(String json) {
    return parse(json, HashMap.class);
  }
}
```

TimeTool

```java
public class TimeTool {

  public static Date nowDate() {
    return Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
  }

  public static long nowMilli() {
    return System.currentTimeMillis();
  }
}
```

#### 2.3.3 认证流程

##### 2.3.3.1 UsernameAuthentication

```java
/**
 * SpringSecurity传输登录认证的数据的载体，相当一个Dto
 * 必须是 {@link Authentication} 实现类
 * 这里选择extends{@link AbstractAuthenticationToken}，而不是直接implements Authentication,
 * 是为了少些写代码。因为{@link Authentication}定义了很多接口，我们用不上。
 */
public class UsernameAuthentication extends AbstractAuthenticationToken {

  private String username; // 前端传过来
  private String password; // 前端传过来
  private UserLoginInfo currentUser; // 认证成功后，后台从数据库获取信息

  public UsernameAuthentication() {
    // 权限，用不上，直接null
    super(null);
  }

  @Override
  public Object getCredentials() {
    // 根据SpringSecurity的设计，授权成后，Credential（比如，登录密码）信息需要被清空
    return isAuthenticated() ? null : password;
  }

  @Override
  public Object getPrincipal() {
    // 根据SpringSecurity的设计，授权成功之前，getPrincipal返回的客户端传过来的数据。授权成功后，返回当前登陆用户的信息
    return isAuthenticated() ? currentUser : username;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public UserLoginInfo getCurrentUser() {
    return currentUser;
  }

  public void setCurrentUser(UserLoginInfo currentUser) {
    this.currentUser = currentUser;
  }
}
```

##### 2.3.3.2 UsernameAuthenticationFilter

```java
/**
 * 用户名密码登录
 * AbstractAuthenticationProcessingFilter 的实现类要做的工作：
 * 1. 从HttpServletRequest提取授权凭证。假设用户使用 用户名/密码 登录，就需要在这里提取username和password。
 *    然后，把提取到的授权凭证封装到的Authentication对象，并且authentication.isAuthenticated()一定返回false
 * 2. 将Authentication对象传给AuthenticationManager进行实际的授权操作
 */
public class UsernameAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

  private static final Logger logger = LoggerFactory.getLogger(UsernameAuthenticationFilter.class);

  public UsernameAuthenticationFilter(
          AntPathRequestMatcher pathRequestMatcher,     // url 对应@PostMapping("/user/login/username")
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
    logger.debug("use UsernameAuthenticationFilter");

    // 提取请求数据
    String requestJsonData = request.getReader().lines()
        .collect(Collectors.joining(System.lineSeparator()));
    Map<String, Object> requestMapData = JSON.parseToMap(requestJsonData);
    String username = requestMapData.get("username").toString();
    String password = requestMapData.get("password").toString();

    // 封装成Spring Security需要的对象
    UsernameAuthentication authentication = new UsernameAuthentication();
    authentication.setUsername(username);
    authentication.setPassword(password);
    authentication.setAuthenticated(false); // 还没开始认证

    // 开始登录认证。SpringSecurity会利用 Authentication对象去寻找 AuthenticationProvider进行登录认证
    return getAuthenticationManager().authenticate(authentication);
  }

}
```

##### 2.3.3.3 UsernameAuthenticationProvider

```java
/**
 * 帐号密码登录认证
 */
@Component
public class UsernameAuthenticationProvider implements AuthenticationProvider {

  @Autowired
  private UserService userService;

  @Autowired
  private PasswordEncoder passwordEncoder;

  public UsernameAuthenticationProvider() {
    super();
  }

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    // 用户提交的用户名 + 密码：
    String username = (String)authentication.getPrincipal();
    String password = (String) authentication.getCredentials();
    System.out.println("校验：" + username + ":" + password);
    // 查数据库，匹配用户信息
    User user = userService.getUserFromDB(username);
    if (user == null
        || !passwordEncoder.matches(password, user.getPassword())) {
      // 密码错误，直接抛异常。
      // 根据SpringSecurity框架的代码逻辑，认证失败时，应该抛这个异常：org.springframework.security.core.AuthenticationException
      // BadCredentialsException就是这个异常的子类
      // 抛出异常后后，AuthenticationFailureHandler的实现类会处理这个异常。
      throw new BadCredentialsException("用户名或密码不正确");
    }

    UsernameAuthentication token = new UsernameAuthentication();
    token.setCurrentUser(JSON.convert(user, UserLoginInfo.class));
    token.setAuthenticated(true); // 认证通过，这里一定要设成true
    return token;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.isAssignableFrom(UsernameAuthentication.class);
  }
}
```

##### 2.3.3.4 SecurityConfig

```java
LoginSuccessHandler loginSuccessHandler = applicationContext.getBean(LoginSuccessHandler.class);
        LoginFailHandler loginFailHandler = applicationContext.getBean(LoginFailHandler.class);
        // 加一个登录方式。用户名、密码登录
        String usernameLoginPath = "/user/login/username";
        UsernameAuthenticationFilter usernameLoginFilter = new UsernameAuthenticationFilter(
                // @PostMapping("/user/login/username")
                new AntPathRequestMatcher(usernameLoginPath, HttpMethod.POST.name()),
                // 校验
                new ProviderManager(List.of(applicationContext.getBean(UsernameAuthenticationProvider.class))),
                // 成功失败处理
                loginSuccessHandler,
                loginFailHandler);
        http.addFilterBefore(usernameLoginFilter, UsernamePasswordAuthenticationFilter.class);
```

### 2.4 短信验证码登录

#### 2.4.1 SmsAuthentication

```java
public class SmsAuthentication extends AbstractAuthenticationToken {

  private String phone; // 前端传过来
  private String captcha; // 前端传过来
  private UserLoginInfo currentUser; // 认证成功后，后台从数据库获取信息

  public SmsAuthentication() {
    // 权限，用不上，直接null
    super(null);
  }

  @Override
  public Object getCredentials() {
    // 根据SpringSecurity的设计，授权成后，Credential（比如，登录密码）信息需要被清空
    return isAuthenticated() ? null : captcha;
  }

  @Override
  public Object getPrincipal() {
    // 根据SpringSecurity的设计，授权成功之前，getPrincipal返回的客户端传过来的数据。授权成功后，返回当前登陆用户的信息
    return isAuthenticated() ? currentUser : phone;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getCaptcha() {
    return captcha;
  }

  public void setCaptcha(String captcha) {
    this.captcha = captcha;
  }

  public UserLoginInfo getCurrentUser() {
    return currentUser;
  }

  public void setCurrentUser(UserLoginInfo currentUser) {
    this.currentUser = currentUser;
  }
}
```

#### 2.4.2 SmsAuthenticationFilter

```java
public class SmsAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

  private static final Logger logger = LoggerFactory.getLogger(SmsAuthenticationFilter.class);

  public SmsAuthenticationFilter(
          AntPathRequestMatcher pathRequestMatcher,     // url 对应@PostMapping("/user/login/sms")
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
    logger.debug("use SmsAuthenticationFilter");

    // 提取请求数据
    String requestJsonData = request.getReader().lines()
        .collect(Collectors.joining(System.lineSeparator()));
    Map<String, Object> requestMapData = JSON.parseToMap(requestJsonData);
    String phone = requestMapData.get("phone").toString();
    String captcha = requestMapData.get("captcha").toString();

    // 封装成Spring Security需要的对象
    SmsAuthentication authentication = new SmsAuthentication();
    authentication.setPhone(phone);
    authentication.setCaptcha(captcha);
    authentication.setAuthenticated(false); // 还没开始认证

    // 开始登录认证。SpringSecurity会利用 Authentication对象去寻找 AuthenticationProvider进行登录认证
    return getAuthenticationManager().authenticate(authentication);
  }

}
```

#### 2.4.3 SmsAuthenticationProvider

```java
@Component
public class SmsAuthenticationProvider implements AuthenticationProvider {

  @Autowired
  private UserService userService;

  @Autowired
  private PasswordEncoder passwordEncoder;

  public SmsAuthenticationProvider() {
    super();
  }

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    // 用户提交的用户名 + 密码：
    String phone = (String)authentication.getPrincipal();
    String captcha = (String) authentication.getCredentials();
    System.out.println("校验：" + phone + ":" + captcha);
    // 查数据库，匹配用户信息
    User user = userService.getUserByPhone(phone);

    if (user == null
        || !"123abc".equals(captcha)){
      throw new BadCredentialsException("验证码不正确");
    }
    SmsAuthentication token = new SmsAuthentication();
    token.setCurrentUser(JSON.convert(user, UserLoginInfo.class));
    token.setAuthenticated(true); // 认证通过，这里一定要设成true
    return token;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.isAssignableFrom(SmsAuthentication.class);
  }
}
```

#### 2.4.4 SecurityConfig

```Java
// 加一个登录方式。短信，验证码登录
String smsLoginPath = "/user/login/sms";
SmsAuthenticationFilter smsLoginFilter = new SmsAuthenticationFilter(
        new AntPathRequestMatcher(smsLoginPath, HttpMethod.POST.name()),
        new ProviderManager(
                List.of(applicationContext.getBean(SmsAuthenticationProvider.class))),
        loginSuccessHandler,
        loginFailHandler);
http.addFilterBefore(smsLoginFilter, UsernamePasswordAuthenticationFilter.class);
```



## 3. 支持多种资源API的鉴权

### 3.1 本系统的用户请求API时鉴权

#### 3.1.1 Controller

```java
@GetMapping("/business-1")
public Result getA() {
    UserLoginInfo userLoginInfo = (UserLoginInfo) SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getPrincipal();
    System.out.println("自家用户登录信息：" + JSON.stringify(userLoginInfo));
    return Result.success(userLoginInfo);
}
```

#### 3.1.2 MyJwtAuthentication

```java
public class MyJwtAuthentication extends AbstractAuthenticationToken {

    private String jwtToken; // 前端传过来
    private UserLoginInfo currentUser; // 认证成功后，后台从数据库获取信息

    public MyJwtAuthentication() {
        // 权限，用不上，直接null
        super(null);
    }

    @Override
    public Object getCredentials() {
        // 根据SpringSecurity的设计，授权成后，Credential（比如，登录密码）信息需要被清空
        return isAuthenticated() ? null : jwtToken;
    }

    @Override
    public Object getPrincipal() {
        // 根据SpringSecurity的设计，授权成功之前，getPrincipal返回的客户端传过来的数据。授权成功后，返回当前登陆用户的信息
        return isAuthenticated() ? currentUser : jwtToken;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public UserLoginInfo getCurrentUser() {
        return currentUser;
    }

    public void setCurrentUser(UserLoginInfo currentUser) {
        this.currentUser = currentUser;
    }
}
```

#### 3.1.3 MyJwtAuthenticationFilter

```java
public class MyJwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(MyJwtAuthenticationFilter.class);

  private JwtService jwtService;

  public MyJwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    logger.debug("Use OpenApi1AuthenticationFilter");

    String jwtToken = request.getHeader("Authorization");
    if (StringUtils.isEmpty(jwtToken)) {

      ExceptionTool.throwException("JWT token is missing!", 10086);

    }
    if (jwtToken.startsWith("Bearer ")) {
      jwtToken = jwtToken.substring(7);
    }


    try {
      UserLoginInfo userLoginInfo = jwtService.verifyJwt(jwtToken, UserLoginInfo.class);

      MyJwtAuthentication authentication = new MyJwtAuthentication();
      authentication.setJwtToken(jwtToken);
      authentication.setAuthenticated(true); // 设置true，认证通过。
      authentication.setCurrentUser(userLoginInfo);
      // 认证通过后，一定要设置到SecurityContextHolder里面去。
      SecurityContextHolder.getContext().setAuthentication(authentication);
    }catch (ExpiredJwtException e) {
      // TODO 转换异常，指定code，让前端知道时token过期，去调刷新token接口
//      throw new BaseException("token过期",HttpStatus.BAD_REQUEST);
      ExceptionTool.throwException("jwt过期", HttpStatus.UNAUTHORIZED, 10087);
    } catch (Exception e) {
      ExceptionTool.throwException("jwt过期", HttpStatus.UNAUTHORIZED, 10087);
    }
    // 放行
    filterChain.doFilter(request, response);
  }
}
```

#### 3.1.4 FilterChain

```java
// 自家用户
@Bean
public SecurityFilterChain bussiness1FilterChain(HttpSecurity http) throws Exception {
    commonHttpSetting(http);
    // 使用securityMatcher限定当前配置作用的路径
    http.securityMatcher("/open-api/business-1");
    http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated());
    // JWT Filter
    MyJwtAuthenticationFilter myJwtAuthenticationFilter = new MyJwtAuthenticationFilter(applicationContext.getBean(JwtService.class));
    http.addFilterBefore(myJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### 3.2 对外提供开放API使用MD5签名验签鉴权

#### 3.2.1 Controller

```java
@GetMapping("/business-2")
public Result getB() {
    OpenApi2LoginInfo userLoginInfo = (OpenApi2LoginInfo)SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getPrincipal();
    System.out.println("三方API登录信息：" + JSON.stringify(userLoginInfo));
    return Result.success(userLoginInfo);
}
```

#### 3.2.2 Authentication

```java
public class OpenApi2Authentication extends AbstractAuthenticationToken {

  private String appId; // 前端传过来
  private String appSecurity; // 前端传过来
  private OpenApi2LoginInfo currentUser; // 认证成功后，后台从数据库获取信息

  public OpenApi2Authentication() {
    // 权限，用不上，直接null
    super(null);
  }

  @Override
  public Object getCredentials() {
    // 根据SpringSecurity的设计，授权成后，Credential（比如，登录密码）信息需要被清空
    return isAuthenticated() ? null : appSecurity;
  }

  @Override
  public Object getPrincipal() {
    // 根据SpringSecurity的设计，授权成功之前，getPrincipal返回的客户端传过来的数据。授权成功后，返回当前登陆用户的信息
    return isAuthenticated() ? currentUser : appId;
  }

  public String getAppId() {
    return appId;
  }

  public void setAppId(String appId) {
    this.appId = appId;
  }

  public String getAppSecurity() {
    return appSecurity;
  }

  public void setAppSecurity(String appSecurity) {
    this.appSecurity = appSecurity;
  }

  public OpenApi2LoginInfo getCurrentUser() {
    return currentUser;
  }

  public void setCurrentUser(
      OpenApi2LoginInfo currentUser) {
    this.currentUser = currentUser;
  }
}
```

#### 3.2.3 AuthenticationFilter

```java
public class OpenApi2AuthenticationFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(OpenApi2AuthenticationFilter.class);

  public OpenApi2AuthenticationFilter() {
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    logger.debug("Use OpenApi2AuthenticationFilter...");

    String appId = request.getHeader("x-app-id");
    if (StringUtils.isEmpty(appId)) {
     throw new BaseException("x-app-id token is missing!", HttpStatus.BAD_REQUEST);
    }

    // 认证开始前，按SpringSecurity设计，要将Authentication设置到SecurityContext里面去。
    System.out.println("appId认证通过...");

    OpenApi2Authentication authentication = new OpenApi2Authentication();

    OpenApi2LoginInfo userLoginInfo = new OpenApi2LoginInfo();
    userLoginInfo.setAppId(appId);
    userLoginInfo.setMerchantName("三方系统商户名称");

    authentication.setAuthenticated(true); // 设置true，认证通过。
    authentication.setCurrentUser(userLoginInfo);
    SecurityContextHolder.getContext().setAuthentication(authentication); // 一定要设置到ThreadLocal

    // 放行
    filterChain.doFilter(request, response);
  }
}
```

#### 3.2.4 FilterChain

```java
// 第三方用户
@Bean
public SecurityFilterChain bussiness2FilterChain(HttpSecurity http) throws Exception {
    commonHttpSetting(http);
    // 使用securityMatcher限定当前配置作用的路径
    http.securityMatcher("/open-api/business-2");
    http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated());
    // Third Filter
    http.addFilterBefore(new OpenApi2AuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### 3.3 其他自定义鉴权

网站首页，不需要任何权限校验

#### 3.3.1 controller接口

```java
@GetMapping("/business-3")
public Result getC() {
    Authentication authentication = SecurityContextHolder
            .getContext()
            .getAuthentication();
    System.out.println("登录信息：" + JSON.stringify(authentication));
    return Result.success("模拟访问成功的响应数据");
}
```

#### 3.3.2 FilterChain

```java
// 不需要鉴权
@Bean
public SecurityFilterChain bussiness3FilterChain(HttpSecurity http) throws Exception {
    commonHttpSetting(http);
    // 使用securityMatcher限定当前配置作用的路径
    http.securityMatcher("/open-api/business-3");
    http.authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
    return http.build();
}
```

## 三、OAuth2认证流程 gitee认证示例

oauth2标准定义：

https://datatracker.ietf.org/doc/html/rfc6749

### 1. 创建应用

设置->第三方应用->创建应用  

应用主页：随便填

应用回调地址：http://localhost:8080/index.html

client id

69fe7b9577b917283454fb91736f243ff995507657257d2d9ab59a95d59aafb5

client secret

77e5a1ad16fc536c4b1b95e148e94b37758c91c474f3d284d4e54790a800d3f5

### 2. 认证步骤

1. 应用通过 浏览器 或 Webview 将用户引导到码云三方认证页面上（ **GET请求** ）

   1. https://gitee.com/oauth/authorize?client_id=69fe7b9577b917283454fb91736f243ff995507657257d2d9ab59a95d59aafb5&redirect_uri=http://localhost:8080/index.html&response_type=code
   2. code=8779e41d249eca08bd902715cd250a4baecfac924a201c2657a9eda2485fbdb2

2. 用户对应用进行授权

   1. 注意: 如果之前已经授权过的需要跳过授权页面，需要在上面第一步的 URL 加上 scope 参数，且 scope 的值需要和用户上次授权的勾选的一致。
   2. 如用户在上次授权了user_info、projects以及pull_requests。
   3. https://gitee.com/oauth/token?grant_type=authorization_code&code={code}&client_id={client_id}&redirect_uri={redirect_uri}&client_secret={client_secret}

3. 根据accessToken换用户信息openid - userid, nickname - id

   https://gitee.com/api/v5/user

### 3. 代码实现逻辑

#### 3.1 通过AI生成前端页面

```
我正在测试oauth2三方授权登录，需要你帮我实现前端页面代码，尽量美观一点，要有商业风格：

1.首选创建一个index.html代码，在页面正中间创建一个按钮：Gitee授权登录

2.点击按钮时，先GET请求http://localhost:8080/public/login/gitee/config接口，这个会返回json数据：{"data": {"clientId":"clientId...","redirectUri":"redirectUri..."}}。 得到json数据后替换替换这个url（https://gitee.com/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code）请求参数中的动态参数{client_id}和{redirect_uri}，得到一个三方授权页面的完整url，最后重定向到这个url。用户汇在这个页面中进行确认授权

3.创建一个新的html页面gitee-callback.html

4.当用户授权完毕，gitee服务器会重定向到一个这个新的页面（http://localhost:8080/gitee-callback.html），同时url上面会带上请求参数code。当重定向请求到达后，需要自动提取url上面的code，同时发post请求到后台服务器（http://localhost:8080/user/login/gitee），请求body数据{code:"..."}，响应数据{"message": "登录信息...", "data":{"nickname": "用户昵称"}}，得到响应数据后，提取中message字段中的数据，重定向到一个新的页面home-page.html，同时在home-page.html中展示message + 'hello, ' + nickname信息（home-page.html也请帮我实现）
```

#### 3.2 GiteeLoginConfigController

```java
@RestController
@RequestMapping("/public/login/gitee")
public class GiteeLoginConfigController {

  @Value("${login.gitee.clientId}")
  private String giteeClientId;

  @Value("${login.gitee.redirectUri}")
  private String giteeCallbackEndpoint;

  @GetMapping("/config")
  public Result getA() {
    HashMap<String, Object> config = new HashMap<>();
    config.put("clientId", giteeClientId);
    config.put("redirectUri", giteeCallbackEndpoint);
    return Result.success(config);
  }

}
```

#### 3.3 GiteeAuthentication

```java
public class GiteeAuthentication extends AbstractAuthenticationToken {

  private String code; // 前端传过来
  private UserLoginInfo currentUser; // 认证成功后，后台从数据库获取信息

  public GiteeAuthentication() {
    // 权限，用不上，直接null
    super(null);
  }

  @Override
  public Object getCredentials() {
    // 根据SpringSecurity的设计，授权成后，Credential（比如，登录密码）信息需要被清空
    return isAuthenticated() ? null : code;
  }

  @Override
  public Object getPrincipal() {
    // 根据SpringSecurity的设计，授权成功之前，getPrincipal返回的客户端传过来的数据。授权成功后，返回当前登陆用户的信息
    return isAuthenticated() ? currentUser : null;
  }

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
  }

  public UserLoginInfo getCurrentUser() {
    return currentUser;
  }

  public void setCurrentUser(UserLoginInfo currentUser) {
    this.currentUser = currentUser;
  }
}
```

#### 3.4 GiteeAuthenticationFilter

```java
public class GiteeAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

  private static final Logger logger = LoggerFactory.getLogger(GiteeAuthenticationFilter.class);

  public GiteeAuthenticationFilter(
          AntPathRequestMatcher pathRequestMatcher,     // url 对应@PostMapping("/user/login/sms")
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
    logger.debug("use GiteeAuthenticationFilter");

    // 提取请求数据
    String requestJsonData = request.getReader().lines()
        .collect(Collectors.joining(System.lineSeparator()));
    Map<String, Object> requestMapData = JSON.parseToMap(requestJsonData);
    String code = requestMapData.get("code").toString();

    // 封装成Spring Security需要的对象
    GiteeAuthentication authentication = new GiteeAuthentication();
    authentication.setCode(code);
    authentication.setAuthenticated(false); // 还没开始认证

    // 开始登录认证。SpringSecurity会利用 Authentication对象去寻找 AuthenticationProvider进行登录认证
    return getAuthenticationManager().authenticate(authentication);
  }

}
```

#### 3.5 GiteeAuthenticationProvider

```java
@Component
public class GiteeAuthenticationProvider implements AuthenticationProvider {

  @Autowired
  private UserService userService;

  @Autowired
  private GiteeApiClient giteeApiClient;

  public static final String PLATFORM = "gitee";

  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String code = authentication.getCredentials().toString();
    try {
      String token = giteeApiClient.getTokenByCode(code);
      if (token == null) {
        // 乱传code过来。用户根本没授权！
        ExceptionTool.throwException("${gitee.get.open.id.fail:Gitee授权失败！}");
      }
      Map<String, Object> thirdUser = giteeApiClient.getThirdUserInfo(token);
      if (thirdUser == null) {
        // 未知异常。获取不到用户openId，也就无法继续登录了
        ExceptionTool.throwException("${gitee.get.open.id.fail:Gitee授权失败！}");
      }
      String openId = thirdUser.get("openId").toString();

      // 通过第三方的账号唯一id，去匹配数据库中已有的账号信息
      User user = userService.getUserByOpenId(openId, PLATFORM);
      boolean notBindAccount = user == null; // gitee账号没有绑定我们系统的用户
      if (notBindAccount) {
        // 没找到账号信息，那就是第一次使用gitee登录，可能需要创建一个新用户
        user = new User();
        userService.createUserWithOpenId(user, openId, PLATFORM);
      }

      GiteeAuthentication successAuth = new GiteeAuthentication();
      successAuth.setCurrentUser(JSON.convert(user, UserLoginInfo.class));
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
      throw new BadCredentialsException("Gitee Authentication Failed");
    }
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.isAssignableFrom(GiteeAuthentication.class);
  }
}
```

#### 3.6 GiteeApiClient

```java
@Component
public class GiteeApiClient {

  private RestTemplate restTemplate = new RestTemplate();

  @Value("${login.gitee.clientId}")
  private String clientId;

  @Value("${login.gitee.clientSecret}")
  private String clientSecret;

  @Value("${login.gitee.redirectUri}")
  private String redirectUri;

  public String getTokenByCode(String code) {
    String url = "https://gitee.com/oauth/token?grant_type=authorization_code"
        + "&code=" + code
        + "&client_id=" + clientId
        + "&redirect_uri=" + redirectUri
        + "&client_secret=" + clientSecret;
    String responseJson = sendPostRequest(url, null);
    Map<String, Object> responseMap = JSON.parseToMap(responseJson);
    Object accessToken = responseMap.get("access_token");
    if (accessToken == null) {
      ExceptionTool.throwException("{gitee.get.token.fail:获取GiteeToken失败！}");
    }
    return accessToken.toString();
  }

  public Map<String, Object> getThirdUserInfo(String token) {
    // {"id":1483966,"login":"用户名"}
    String responseJson = sendGetRequest("https://gitee.com/api/v5/user?access_token=" + token);
    Map<String, Object> responseMap = JSON.parseToMap(responseJson);
    Object openId = responseMap.get("id");
    if (openId == null) {
      return null;
    }

    HashMap<String, Object> thirdUser = new HashMap<>();
    thirdUser.put("openId", openId);
    thirdUser.put("nickname", responseMap.get("login"));
    return thirdUser;
  }

  public String sendPostRequest(String url, Map<String, Object> body) {
    // 请求头
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    // 创建HttpEntity对象
    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
    // 发送POST请求
    try {
      ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity,
          String.class);
      // 返回响应体
      return response.getBody();
    } catch (HttpClientErrorException e) {
      return e.getResponseBodyAsString();
    }
  }

  public String sendGetRequest(String url) {
    // 请求头
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    // 创建HttpEntity对象
    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(headers);
    // 发送GET请求
    try {
      ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity,
          String.class);
      // 返回响应体
      return response.getBody();
    } catch (HttpClientErrorException e) {
      return e.getResponseBodyAsString();
    }
  }
}
```

#### 3.7 SecurityConfig

```
// 加一个登录方式。Gitee 登录
GiteeAuthenticationFilter giteeFilter = new GiteeAuthenticationFilter(
        new AntPathRequestMatcher("/user/login/gitee", HttpMethod.POST.name()),
        new ProviderManager(
                List.of(applicationContext.getBean(GiteeAuthenticationProvider.class))),
        loginSuccessHandler,
        loginFailHandler);
http.addFilterBefore(giteeFilter, UsernamePasswordAuthenticationFilter.class);
```

# 四、权限控制

controller

根据请求的路径进行权限认证

































