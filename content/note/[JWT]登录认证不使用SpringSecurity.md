+++
title = '[JWT]Springboot+vue登录认证不使用SpringSecurity'
date = 2024-10-12T21:14:11+08:00
draft = false

+++

# 一、预备内容

## 1. 统一响应结果

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> implements Serializable {
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

## 2. 用户类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private String email;
    private String phone;
    private String password;
    private String username;
    private Integer role;
    private Integer coin;
    private Integer accuCoin;
    private Boolean isDeleted;
    private Boolean isLocked;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginTime;
}
```

## 3. token.js

```js
import {defineStore} from "pinia";
import {ref} from "vue";

export const useTokenStore = defineStore('token',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }
    return {
      token, setToken, removeToken
    }
  },
  {
    persist: true
  }
);
```

## 4. ThreadLocal工具类

```java
public class ThreadLocalUtil {
    //提供ThreadLocal对象,
    private static final ThreadLocal THREAD_LOCAL = new ThreadLocal();

    //根据键获取值
    public static <T> T get(){
        return (T) THREAD_LOCAL.get();
    }

    //存储键值对
    public static void set(Object value){
        THREAD_LOCAL.set(value);
    }


    //清除ThreadLocal 防止内存泄漏
    public static void remove(){
        THREAD_LOCAL.remove();
    }
}
```



# 二、基本流程

## 1. 用户名密码登录

1. 前端输入用户名+密码，点击登录，发送登录请求到后端
2. 用户登录请求不拦截，后端处理登录请求
   1. 判断用户是否存在，用户是否被禁用
   2. 判断密码是否正确
   3. 若以上都通过，生成token并保存到Redis，返回token给前端；
   4. 否则，抛出异常
3. 前端接收到响应结果，将token存储到Pinia状态管理器中，并持久化
4. 之后前端每次发起请求，都携带token
5. 后端拦截到请求后，校验token
6. 若token有效，则放行，进行下一步处理



## 2. 邮箱验证码登录

只需将2.2判断密码是否正确，修改为判断验证码是否正确即可。  

验证码通过邮箱发送给用户一份，Redis中保存一份。比较这两个验证码是否一致。



# 三、后端

## 1. 处理登录请求

1. 判断是否有该用户
2. 若有，则进行后端校验，判断密码是否正确，及用户是否被禁用
3. 若通过校验，则生成token，并存储到Redis中一份
4. 返回UserInfoVO

UserController.java

```java
@PostMapping("/login")
public Result login(@RequestBody @Validated LoginDTO loginDTO){
    UserInfoVO userInfoVO = userService.login(loginDTO);
    final Map<String, Object> map = ThreadLocalUtil.get();
    log.info("map: " + map);
    return Result.success(userInfoVO);
}
```

UserServiceImpl.java

```java
@Override
public UserInfoVO login(LoginDTO loginDTO) {
    // 1. 判断是否有该用户
    User userByEmail = userMapper.getUserByEmail(loginDTO.getEmail());
    if (userByEmail == null){
        throw new BussinesException("该邮箱未注册");
    }
    // 2. 已注册，判断登录方式
    switch (loginDTO.getLoginType()){
        // 2.1 验证码登录
        case 1:
            // 2.1.1 判断有无验证码、验证码是否正确

            if (!StringUtils.hasLength(loginDTO.getEmailCode())){
                throw new BussinesException("验证码不能为空");
            }
            String codeKey = RedisConstants.EMAIL_CODE_PREFIX + loginDTO.getEmail();
            String serverCode = stringRedisTemplate.opsForValue().get(codeKey);
            // 2.1.2 验证码错误
            if (!StringUtils.hasLength(serverCode) || !serverCode.equals(loginDTO.getEmailCode())){
                throw new BussinesException("验证码错误");
            }
            // 2.1.3 验证码正确,移除redis验证码
            stringRedisTemplate.delete(codeKey);
            break;
        // 2.2 密码登录
        case 2:
            // 判断有无密码、密码是否正确
            if (!StringUtils.hasLength(loginDTO.getPassword())){
                throw new BussinesException("密码不能为空");
            }
            if (!Md5Util.checkPassword(loginDTO.getPassword(), userByEmail.getPassword())){
                throw new BussinesException("密码错误");
            }
            // 密码正确
            break;
        default:
            throw new BussinesException("登录方式错误");
    }
    // 3. 验证通过， 生成UserInfoVO
    UserInfoVO userInfoVO = CopyUtil.copy(userByEmail, UserInfoVO.class);

    // 4. 生成token
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userInfoVO.getId());
    claims.put("userRole", userInfoVO.getRole());
    claims.put("userEmail", userInfoVO.getEmail());
    claims.put("userName", userInfoVO.getUsername());
    log.info("claims:{}", claims);
    String token = JwtUtil.genToken(claims);
    // 5. 保存登录信息到redis
    // 5.1 封装TokenUserInfoDTO
    TokenUserInfoDTO tokenUserInfoDto = getTokenUserInfoDto(userByEmail);
    tokenUserInfoDto.setToken(token);
    // 5.2 获取key value
    String tokenKey = USER_TOKEN_PREFIX + userInfoVO.getEmail();
    String tokenValue = JSON.toJSONString(tokenUserInfoDto);
    // 5.3 token 保存一天
    stringRedisTemplate.opsForValue().set(tokenKey, tokenValue, 1, TimeUnit.DAYS);
    userInfoVO.setToken(tokenUserInfoDto.getToken());
    // 6 更新上次登录时间
    userByEmail.setLastLoginTime(LocalDateTime.now());
    userMapper.update(userByEmail);
    // 7 返回
    return userInfoVO;
}
/**
 * 封装TokenUserInfoDTO，序列化后，保存到Redis
 * @param user
 * @return TokenUserInfoDTO
 */
private TokenUserInfoDTO getTokenUserInfoDto(User user){
    TokenUserInfoDTO tokenUserInfoDto = new TokenUserInfoDTO();
    tokenUserInfoDto.setId(user.getId());
    tokenUserInfoDto.setEmail(user.getEmail());
    tokenUserInfoDto.setUsername(user.getUsername());
    tokenUserInfoDto.setRole(user.getRole());
    tokenUserInfoDto.setIsLocked(user.getIsLocked());
    return tokenUserInfoDto;
}
```

## 2. 处理不需要登录的请求

直接放行。

## 3. 处理需要登录的请求（拦截器）

1. 对登录注册等接口不拦截
2. 对于其他接口
   1. 首先判断token是否存在，如果不存在，直接抛出异常
   2. 存在，解析token，进行校验
      1. 判断token是否过期
      2. 获取邮箱，并取出在Redis中的token，判断两个token是否一致
   3. 校验通过，将用户信息存储到ThreadLocal中

WebConfig

```java
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 登录和注册接口不拦截，发送验证码的服务不拦截
        registry.addInterceptor(loginInterceptor).excludePathPatterns(
            "/user/register",
            "/user/sendCode",
            "/user/login",
        );
    }
}
```

loginInterceptor

```java
@Component
@Slf4j
public class LoginInterceptor implements HandlerInterceptor {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 令牌验证
        String token = request.getHeader("token");
        log.info("==============> token: " + token);
        //验证token
        try {
            // 把业务数据存储到ThreadLocal中
            Map<String, Object> claims = JwtUtil.parseToken(token);
            ThreadLocalUtil.set(claims);
            // 获取Email
            final Map<String, Object> map = ThreadLocalUtil.get();
            final String userEmail = (String) map.get("userEmail");
            // 取redis中的token
            String key = USER_TOKEN_PREFIX + userEmail;
            ValueOperations<String, String> operations = stringRedisTemplate.opsForValue();
            String redisToken = operations.get(key);
            if (redisToken == null){
                // token失效, 移除业务数据
                ThreadLocalUtil.remove();
                throw new RuntimeException();
            }
			// 比较Redis中的token与用户的token是否一致
            if (redisToken != token){
                // token失效, 移除业务数据
                ThreadLocalUtil.remove();
                throw new RuntimeException();
            }
            return true; // 放行
        }catch (Exception e) {
            // http响应状态码为401
            log.error("==============>  "+ e);
            response.setStatus(401);
            return false; // 不放行
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 清空ThreadLocal中的数据
        ThreadLocalUtil.remove();
    }
}
```









# 四、前端

## 1. 发送请求

- 前端进行简单校验
- 如判断用户名/密码是否为空，如果为空，则不能发起请求。  

- 校验通过，发送请求。  

api

```js
export const userLoginService = (loginData) => {
  return request.post('/user/login',  loginData);
}
```

前端发起请求

```js
const login =  async () => {
  let result = await userLoginService(loginData);
  if(result.code == 0){
    ElMessage.success(result.message ? result.message : '登录成功！')
  } else {
    ElMessage.error(result.message ? result.message : '登录失败！')
  }
  tokenStore.setToken(result.data)
  router.push('/')
}
```

## 2. 登录成功

将result.data也就是token存储到pinia状态管理器中，并持久化（1天）。随后跳转到首页。

```
tokenStore.setToken(result.data)
router.push('/')
```

除此之外，还应该存储当前用户信息到Pinia中。

### 2.1 已登录不能访问登录页面

用户在已登录的情况下，访问/login登录页面，会跳转到/首页。

```js
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore();
  const isLoggedIn = tokenStore.token == null || tokenStore.token == "" ? false : true;
  if (to.path == "/login" && isLoggedIn) {
    // 已登录，重定向到主页
    next({ path: "/" });
  } else {
    next();
  }
});
```

### 2.2 未登录不能访问需要登录的页面

这是在前端进行的处理，用户如果在未登录的状态下访问需要授权的页面，则会跳转到登录页面。

```js
// 全局前置守卫，这里可以加入用户登录判断
import { useTokenStore } from '@/stores/token.js'
// 解析token，判断有没有过期
import { jwtDecode } from "jwt-decode";

// to跳转到哪个页面， from表示从哪个页面跳转过去
// next的表示将页面要不要执行下一步操作，写之前首先要记录每一个未授权界面
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  // pinia出来
  var nowtoken = tokenStore.token.token;
  if (to.meta.requireAuth && (nowtoken === "" || nowtoken == null)) {
    next({name: "login"});
  } else {
    if(!to.meta.requireAuth){
      next();
      return;
    }
    // 判断token有没有过期
    // 解析出来
    const decode = jwtDecode(nowtoken);
    // 如果过期
    if (decode.exp * 1000  < Date.now()) {
      // 删除token
      tokenStore.removeToken;
      next({name:"login"});
    }else{
      next();
    }
  }
})
```

扩展：普通用户访问需要管理员权限的页面(/admin开头的路由)时，跳转到首页。

```js
const routes = [
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requireAuth: true, roles: ['admin'] }
  },
  // 其他路由
];

// 导入必要的模块和函数
import router from '@/router'; // 根据您的项目结构调整路径
import { useTokenStore } from '@/stores/token.js';
import jwtDecode from 'jwt-decode'; // 确保正确导入
import { computed } from 'vue';

router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore();
  const token = tokenStore.token.token;

  // 检查是否需要认证
  if (to.meta.requireAuth) {
    if (!token) {
      // 未登录，重定向到登录页
      next({ name: 'login' });
      return;
    }

    try {
      // 解析token
      const decoded = jwtDecode(token);

      // 检查token是否过期
      if (decoded.exp * 1000 < Date.now()) {
        // Token过期，移除token并重定向到登录页
        tokenStore.removeToken();
        next({ name: 'login' });
        return;
      }

      // 如果路由有角色要求，检查用户角色
      if (to.meta.roles && to.meta.roles.length > 0) {
        const userRole = decoded.role; // 假设token中有role字段

        if (!to.meta.roles.includes(userRole)) {
          // 用户角色不匹配，重定向到首页
          next({ name: 'home' });
          return;
        }
      }

      // 一切检查通过，放行
      next();
    } catch (error) {
      console.error('Token解析错误:', error);
      // Token无效，移除token并重定向到登录页
      tokenStore.removeToken();
      next({ name: 'login' });
    }
  } else {
    // 不需要认证的路由，直接放行
    next();
  }
});

```



## 3. 之后的请求

之后的每次请求，都应该在请求头中携带token。使用请求拦截器。

```js
//定制请求的实例
//导入axios
import axios from 'axios';
import router from "@/router";
import {ElMessage} from 'element-plus'
import {useTokenStore} from "@/stores/token.js";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({baseURL})

instance.interceptors.request.use(
    (config) => {
        // 添加token
        const tokenStore = useTokenStore();
        if (tokenStore.token) {
            config.headers.token = tokenStore.token.token;
        }
        return config;
    },
    (err) => {
        Promise.reject(err);
    }
)
//添加响应拦截器
instance.interceptors.response.use(
    result => {
        if (result.data.code === 0) {
            return result.data;
        }
        ElMessage.error(result.data.message ? result.data.message : "服务异常")
        return Promise.reject(result.data)

    },
    err => {
        if (err.response.status === 401) {
            ElMessage.error("请先登陆");
            router.push("/login")
        } else {
            ElMessage.error("服务异常")
        }

        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
```



