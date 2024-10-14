+++
title = '[JWT]登录认证授权使用SpringSecurity'
date = 2024-10-13T14:07:12+08:00
draft = false

+++

# 一、预备内容

## 1. 统一响应结果的封装

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Integer code;//业务状态码  0-成功  1-失败 401-token过期 403-权限不足
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

    public static Result error(String message, Integer code) {
        return new Result(code, message, null);
    }
}
```

## 2. 用户实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String password;
    private String nickname;
    private Integer role;
    private String wechatOpenid;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginDTO {
    private String sessionId; // 会话id，全局唯一
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String nickname;
    private Integer role;
    private String wechatOpenid;
    private Long expiredTime; // 过期时间
}
```

## 3. 异常处理

BaseException

```java
public class BaseException extends RuntimeException {
    private final HttpStatus httpStatus;
    @Setter
    private Integer code; // 自定义一个全局唯一的code，
    public BaseException() {
        httpStatus = HttpStatus.BAD_REQUEST;
    }
    public BaseException(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public BaseException(String msg, HttpStatus httpStatus) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public Integer getCode() {
        return code;
    }

}
```

ExceptionTool

```java
public class ExceptionTool {
    private static final HttpStatus defaultHttpStatus = HttpStatus.BAD_REQUEST;

    public static void throwException(String message) {
        BaseException baseException = new BaseException(message, defaultHttpStatus);
        baseException.setCode(1);
        throw baseException;
    }

    public static void throwException(String message, Integer code) {
        BaseException baseException = new BaseException(message, defaultHttpStatus);
        baseException.setCode(code);
        throw baseException;
    }

    public static void throwException(String message, HttpStatus httpStatus, Integer errorCode) {
        BaseException baseException = new BaseException(message, httpStatus);
        baseException.setCode(errorCode);
        throw baseException;
    }
}
```

GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public Result exceptionHandler(HttpServletResponse response, BaseException e) {
        response.setStatus(e.getHttpStatus().value());
        return createResult(e);
    }

    private Result createResult(BaseException e) {
        return Result.error(e.getMessage(), e.getCode() == null ? 1 : e.getCode());
    }
    // 处理认证异常
    @ExceptionHandler(AuthenticationException.class)
    public Result<Void> handleAuthenticationException(AuthenticationException e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage()) ? e.getMessage() : "认证失败！", 401);
    }

    // 处理授权异常
    @ExceptionHandler(AccessDeniedException.class)
    public Result<Void> handleAccessDeniedException(AccessDeniedException e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage()) ? e.getMessage() : "权限不足！");
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public Result handleVaildException(MethodArgumentNotValidException e){
        BindingResult bindingResult = e.getBindingResult();
        StringBuffer stringBuffer = new StringBuffer();
        bindingResult.getFieldErrors().forEach(item ->{
            //获取错误信息
            String message = item.getDefaultMessage();
            //获取错误的属性名字
            String field = item.getField();
            stringBuffer.append(field + ":" + message + " ");
        });
        return Result.error(stringBuffer + "");
    }
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e){
        e.printStackTrace();
        return Result.error(StringUtils.hasLength(e.getMessage())?e.getMessage():"操作失败！");
    }
}
```





# 二、SpringSecurity基本配置

## 1. 异常处理

**`CustomAccessDeniedHandler`**：处理授权失败（即用户权限不足）时的异常。  

**`CustomAuthenticationExceptionHandler`**：处理认证失败时的异常。  

**`CustomSecurityExceptionHandler`**：全局过滤器，用于统一处理各种安全相关的异常。  

`CustomAccessDeniedHandler` 实现了Spring Security的 `AccessDeniedHandler` 接口，用于处理用户在尝试访问受保护资源时，因权限不足而被拒绝访问的情况。

```java
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public CustomAccessDeniedHandler(ObjectMapper objectMapper){
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        Result result = Result.error("权限不足，拒绝访问！");
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
}
```

`CustomAuthenticationExceptionHandler` 实现了Spring Security的 `AuthenticationEntryPoint` 接口，用于处理用户在认证过程中失败的情况，如未登录或认证失败。

```java
@Component
public class CustomAuthenticationExceptionHandler implements AuthenticationEntryPoint {

    // private final ObjectMapper objectMapper;
    // public CustomAuthenticationExceptionHandler(ObjectMapper objectMapper){
    //     this.objectMapper = objectMapper;
    // }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        PrintWriter writer = response.getWriter();
        writer.print(JSONUtil.stringify(Result.error("${authentication.fail:认证失败}", 1)));
        writer.flush();
        writer.close();
    }
}
```

`CustomSecurityExceptionHandler` 继承自 `OncePerRequestFilter`，是一个自定义的全局安全异常处理过滤器。它用于捕获和处理过滤器链中抛出的各种安全相关异常，确保系统能够返回统一的错误响应。

```java
public class CustomSecurityExceptionHandler extends OncePerRequestFilter {

    public static final Logger logger = LoggerFactory.getLogger(CustomSecurityExceptionHandler.class);

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                 FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (BaseException e) {
            // 自定义异常
            Result result = Result.error(e.getMessage(), e.getCode());
            response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
            response.setStatus(e.getHttpStatus().value());
            PrintWriter writer = response.getWriter();
            writer.write(JSONUtil.stringify(result));
            writer.flush();
            writer.close();
        } catch (AuthenticationException | AccessDeniedException e) {
            response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
            response.setStatus(HttpStatus.FORBIDDEN.value());
            PrintWriter writer = response.getWriter();
            writer.print(JSONUtil.stringify(Result.error(e.getMessage())));
            writer.flush();
            writer.close();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            // 未知异常
            Result result = Result.error("系统异常");
            response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            PrintWriter writer = response.getWriter();
            writer.write(JSONUtil.stringify(result));
            writer.flush();
            writer.close();
        }
    }
}
```

## 2. SecurityConfig

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final ApplicationContext applicationContext;
    private final CustomAuthenticationExceptionHandler customAuthenticationExceptionHandler;
    private final AuthenticationEntryPoint authenticationExceptionHandler = new CustomAuthenticationExceptionHandler();
    private final Filter globalSpringSecurityExceptionHandler = new CustomSecurityExceptionHandler();
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Autowired
    public SecurityConfig(
            ApplicationContext applicationContext,
            CustomAuthenticationExceptionHandler customAuthenticationExceptionHandler,
            CustomAccessDeniedHandler customAccessDeniedHandler
    ){
        this.applicationContext = applicationContext;
        this.customAuthenticationExceptionHandler = customAuthenticationExceptionHandler;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    private void commonHttpSetting(HttpSecurity http) throws Exception {
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
        // 处理 SpringSecurity 异常响应结果。响应数据的结构，改成业务统一的JSON结构。不要框架默认的响应结构
        http.exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                // 认证失败异常
                                .authenticationEntryPoint(authenticationExceptionHandler)
                // 鉴权失败异常
//                        .accessDeniedHandler(authorizationExceptionHandler)
        );
        // 其他未知异常. 尽量提前加载。
        http.addFilterBefore(globalSpringSecurityExceptionHandler, SecurityContextHolderFilter.class);

    }
    @Bean
    public SecurityFilterChain loginFilterChain(HttpSecurity http) throws Exception {
        commonHttpSetting(http);
        // 使用securityMatcher限定当前配置作用的路径
        http.securityMatcher("/public/user/login/*")
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated());

        // 异常处理
        http
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationExceptionHandler)
                        .accessDeniedHandler(customAccessDeniedHandler));

        return http.build();
    }

    /** 其余路径，走这个默认过滤链 */
    @Bean
    @Order(Integer.MAX_VALUE) // 这个过滤链最后加载
    public SecurityFilterChain defaultApiFilterChain(HttpSecurity http) throws Exception {
        commonHttpSetting(http);
        http // 不用securityMatcher表示缺省值，匹配不上其他过滤链时，都走这个过滤链
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated());
        http.addFilterBefore(new PublicApiAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

## 3. PublicApiAuthenticationFilter

```java
public class PublicApiAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        System.out.println("这里是默认过滤链...");
        // 随便给个默认身份
        Authentication authentication = new TestingAuthenticationToken("username", "password", "ROLE_TOURIST");
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // 放行
        filterChain.doFilter(request, response);
    }
}
```





# 三、登录认证流程



## 获取当前用户的信息

```java
public class CurrentUserUtil {
    /**
     * 获取当前认证的用户信息
     *
     * @return 当前用户的 UserPrincipal 对象，若未认证则返回 null
     */
    public static UserLoginDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication.getPrincipal() instanceof String)) { // 避免匿名用户
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserLoginDTO) {
                return (UserLoginDTO) principal;
            }
        }
        return null;
    }
}
```





# 四、授权





# 五、token无痛刷新



