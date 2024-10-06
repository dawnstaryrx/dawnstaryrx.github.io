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

