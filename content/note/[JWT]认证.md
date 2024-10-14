+++
title = '[JWT]认证'
date = 2024-10-10T21:31:49+08:00
draft = false

+++

# 一、公钥和私钥

## 1.1 公钥和私钥的基本概念

**公钥（Public Key）**和**私钥（Private Key）**是一对密钥，属于**非对称加密（Asymmetric Encryption）**的范畴。非对称加密使用一对相关但不同的密钥来进行加密和解密操作，与**对称加密**（使用同一个密钥进行加密和解密）不同。

- 私钥（Private Key）
  - **定义**：私钥是需要严格保密的密钥，仅由持有者掌握。
  - **用途**：用于解密数据或生成数字签名。
- 公钥（Public Key）
  - **定义**：公钥可以公开共享，任何人都可以获取。
  - **用途**：用于加密数据或验证数字签名。

## 1.2 公钥和私钥的用途

- 加密与解密
  - **加密**：使用公钥加密数据。
  - **解密**：使用对应的私钥解密数据。
- 签名与验证
  - **签名**：使用私钥对数据或消息生成数字签名。
  - **验证**：使用公钥验证数字签名的真实性和完整性。

## 1.3 非对称加密的优势

- **安全性高**：私钥不需要在网络中传输，减少泄露风险。
- **密钥分发简便**：公钥可以自由分发，任何人都可以使用公钥进行加密或验证签名

## 1.4 生成公钥和私钥

- 使用RSA算法生成公钥和私钥，并以PEM格式保存到文件中。
- `password`在这里用于生成一个自定义的随机数生成器（`SecureRandom`）的种子。这意味着相同的密码将生成相同的密钥对。
- 初始化`KeyPairGenerator`，指定密钥长度为1024位，并使用之前创建的`SecureRandom`实例。使用2048位更安全。

```java
public class GenSecretKeyTest {

    @Test
    public void genSecretKey() throws Exception{
        //自定义 随机密码,  请修改这里
        String password = "dawnstar";

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        SecureRandom secureRandom = new SecureRandom(password.getBytes());
        keyPairGenerator.initialize(1024, secureRandom);
        KeyPair keyPair = keyPairGenerator.genKeyPair();
        // 获取公钥和私钥的字节数组
        byte[] publicKeyBytes = keyPair.getPublic().getEncoded();
        byte[] privateKeyBytes = keyPair.getPrivate().getEncoded();

        // 将字节数组编码为Base64字符串
        String publicKeyBase64 = Base64.getEncoder().encodeToString(publicKeyBytes);
        String privateKeyBase64 = Base64.getEncoder().encodeToString(privateKeyBytes);

        // 构建PEM格式字符串
        String publicKeyPem = "-----BEGIN PUBLIC KEY-----\n" +
                insertLineBreaks(publicKeyBase64, 64) +
                "\n-----END PUBLIC KEY-----\n";

        String privateKeyPem = "-----BEGIN PRIVATE KEY-----\n" +
                insertLineBreaks(privateKeyBase64, 64) +
                "\n-----END PRIVATE KEY-----\n";

        // 定义文件路径
        Path publicKeyPath = Paths.get("d:\\test\\pub.pem");
        Path privateKeyPath = Paths.get("d:\\test\\pri.pem");

        // 将PEM格式的密钥写入文件
        Files.write(publicKeyPath, publicKeyPem.getBytes());
        Files.write(privateKeyPath, privateKeyPem.getBytes());

        System.out.println("PEM格式的密钥生成并保存成功！");
    }
    /**
     * 将长字符串每隔指定长度插入换行符，提高PEM文件的可读性
     *
     * @param input  输入字符串
     * @param length 每行长度
     * @return 带有换行符的字符串
     */
    private String insertLineBreaks(String input, int length) {
        StringBuilder sb = new StringBuilder();
        int index = 0;
        while (index < input.length()) {
            sb.append(input, index, Math.min(index + length, input.length()));
            sb.append("\n");
            index += length;
        }
        return sb.toString().trim();
    }
}
```

# 二、JWT

## 2.0 JWT基本概念

### 2.0.1 什么是JWT

JWT （JSON Web Token），是一种通过数字签名的方式，以JSON对象为载体，用于在各方之间安全地传输信息。它由三个部分组成，使用点 `.` 分隔：

1. **Header（头部）**：包含令牌的类型typ（通常是 JWT）和所使用的签名算法arg（如 HS256、RS256）。
2. **Payload（负载）**：包含声明（claims），即要传输的数据，如用户信息、权限、过期时间等。
3. **Signature（签名）**：对头部和负载进行签名，确保 JWT 未被篡改。

### 2.0.2 JWT有什么用

JWT最常见的场景是授权认证，一旦用户登录，后续每个请求都包含JWT，系统在每次处理用户的请求之前，都要先进行JWT安全校验，通过之后再进行处理。

### 2.0.2 JWT结构示例

它由三个部分组成，使用点 `.` 分隔。

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.
eyJyb2xlIjoiMCIsIm5pY2tuYW1lIjoi5ri45a6iIiwic2Vzc2lvbklkIjoiYWE1Nzc0MGEtZmU3Ny00Yjk0LTg2MTktZTczNWUwYzNjNTczIiwiaWQiOiI3IiwiZW1haWwiOiJkb25nZmFuZ2ppYmFpQGZvcmVzdHBoYWV0b24uY29tIiwiZXhwaXJlZFRpbWUiOiIxNzI4NjEyMTU3MDkyIiwidXNlcm5hbWUiOiJkb25nZmFuZ2ppYmFpQGZvcmVzdHBoYWV0b24uY29tIiwiZXhwIjoxNzI4NjEyMTU3fQ.
m0WFeKisAKyQYxUha3sq3ErucpTd_7_bSn-4o5jq9yTXdgVcF6KqQXIOlB7PrjsusWPo9oDjuSWO89lnpym-L9cZ2sIEfFoUdomWjranvRt8hQNBYCmTSB6te1dv8j1ldOsfsolhG9FeZyP63ergQPUXF2cwBOtag7B_VXFoMFzF4Xl-DN0mk9Q9NDQJEAoLQUomJ0cL3KEi5pJuX2ZXi6GscxglVfTmoLnCmDV9rf6Jcz3qis0WDx-Lw1QH_-WVxBxalwbF8VmyIWT4L92DcX167io60EXn1l410FmwO-znZnsXrdGe8N3dPlQJSPW55mGavwOgjaA5Xrlrl6xKkQ
```

### 2.0.3 JWT的生成与验证流程

#### 生成 JWT

在用户成功登录后，服务器会生成一个 JWT 并将其返回给客户端。这个 JWT 包含了用户的身份信息和一些声明，如过期时间。生成 JWT 的关键步骤如下：

1. **创建头部**：指定使用的签名算法（如 RS256）。
2. **创建负载**：包含用户信息（如用户 ID、角色）和声明（如过期时间）。
3. **生成签名**：使用私钥（非对称加密）或共享密钥（对称加密）对头部和负载进行签名。

#### 验证 JWT

当客户端发起请求时，会在请求头中携带 JWT（通常在 `Authorization` 头中）。服务器接收到请求后，需要验证 JWT 的有效性，确保其未被篡改且未过期。验证 JWT 的关键步骤如下：

1. **解析 JWT**：分离头部、负载和签名部分。
2. **验证签名**：使用公钥（非对称加密）或共享密钥（对称加密）验证签名，确保 JWT 的完整性。
3. **验证声明**：检查 JWT 的过期时间（`exp`）、发行时间（`iat`）、受众（`aud`）等声明，确保 JWT 的有效性。

### 2.0.4 对称加密算法和非对称加密算法生成JWT

**对称加密**（如HMAC）：如果使用HMAC算法生成JWT，则伪造者需要共享的密钥。如果攻击者获取到这个密钥，就可以伪造合法的JWT。

- 例如：使用`HMAC256`生成JWT，攻击者如果知道密钥（例如`dawnstar`），则可以伪造JWT。

**非对称加密**（如RSA）：使用私钥生成的JWT只可以由拥有私钥的一方签名。攻击者即使能看到JWT的内容，也无法生成有效的JWT，除非他们获得了私钥。

- 例如：使用`RS256`签名，只有拥有私钥的服务器才能签名JWT，攻击者无权签名。

| 特性           | `JwtService`                         | `JwtUtil`                               |
| -------------- | ------------------------------------ | --------------------------------------- |
| **加密算法**   | 非对称加密（RSA `RS256`）            | 对称加密（HMAC `HMAC256`）              |
| **密钥管理**   | 私钥和公钥，私钥保密，公钥可公开     | 单一共享密钥，必须保密                  |
| **适用场景**   | 分布式系统、高安全性需求、微服务架构 | 简单应用、签名和验证在同一服务内        |
| **库依赖**     | `io.jsonwebtoken`（JJWT）            | `com.auth0.jwt`（Java JWT）             |
| **代码复杂度** | 较高，涉及密钥加载和管理             | 较低，直接使用静态密钥                  |
| **安全性**     | 更高，私钥不易泄露且公钥可公开验证   | 较低，密钥一旦泄露，所有 JWT 都易被伪造 |
| **灵活性**     | 高，支持多种算法和复杂操作           | 低，功能相对简单                        |

## 2.1 JWT对称加密

- 对称加密算法，使用 HMAC (`HMAC256`)，即使用相同的密钥进行签名和验证。
- 单一密钥，同时用于签名和验证，必须确保该密钥的安全性。
- 适用于简单的应用场景，尤其是当签名和验证在同一服务内部进行时。

```java
public class JwtUtil {

    private static final String KEY = "dawnstar";

    //接收业务数据,生成token并返回
    public static String genToken(Map<String, Object> claims) {
        return JWT.create()
                .withClaim("claims", claims)
                .withExpiresAt(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24小时过期
//                .withExpiresAt(new Date(System.currentTimeMillis() + 1000 * 60)) // 1分钟过期，用于测试
                .sign(Algorithm.HMAC256(KEY));
    }

    //接收token,验证token,并返回业务数据
    public static Map<String, Object> parseToken(String token) {
        return JWT.require(Algorithm.HMAC256(KEY))
                .build()
                .verify(token)
                .getClaim("claims")
                .asMap();
    }

}
```



## 2.2 JWT非对称加密

- **配置属性**（如`login.jwt.private-key`）存储的是私钥的Base64编码字符串，适合于配置文件的存储格式。
- **`getPrivateKey()`方法**负责将这个字符串转换为`PrivateKey`对象，以便在代码中实际使用（如生成和签名JWT）。
- **转换过程**包括Base64解码、密钥规范创建和使用`KeyFactory`生成密钥对象。

```java
@Service
public class JwtService implements InitializingBean {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
	// 私钥
    private PrivateKey privateKey;
	// JWT解析器
    private JwtParser jwtParser;
	// 创建JWT,使用私钥对 JWT 进行签名
    // expiredAt：应确保传入的过期时间合理，以防 JWT 过早失效或长时间有效，增加安全风险。
	// jwtPayload：负载部分可以包含用户信息、权限等，但应避免存储敏感信息，因为虽然签名保证了完整性，但负载部分是可解码的。
    public String createJwt(Object jwtPayload, long expiredAt) {
        // 添加构成JWT的参数
        // 构建JWT头部，alg签名算法，typ固定JWT
        Map<String, Object> headMap = new HashMap<>();
        headMap.put("alg", SignatureAlgorithm.RS256.getValue());//使用RS256签名算法
        headMap.put("typ", "JWT");
        // 构建JWT负载，body
        Map body = JSONUtil.parse(JSONUtil.stringify(jwtPayload), HashMap.class);
        // 构建JWT
        String jwt = Jwts.builder()
                .setHeader(headMap)
                .setClaims(body)
                .setExpiration(new Date(expiredAt))
                .signWith(privateKey)
                .compact();
        // 返回生成的 JWT 字符串
        return jwt;
    }
	// 私钥的 Base64 编码字符串
    @Value("${login.jwt.private-key}")
    private String privateKeyBase64;
    //获取私钥，用于生成Jwt
    private PrivateKey getPrivateKey() {
        try {
            // 利用JDK自带的工具生成私钥
            KeyFactory kf = KeyFactory.getInstance("RSA");
            // 解码Base64私钥为字节数组，构建 PKCS8EncodedKeySpec
            PKCS8EncodedKeySpec ks = new PKCS8EncodedKeySpec(Decoders.BASE64.decode(privateKeyBase64));
            // 返回生成的 PrivateKey 对象，用于 JWT 的签名操作
            return kf.generatePrivate(ks);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw new BusinessException( "获取Jwt私钥失败");
        }
    }
	// 公钥的 Base64 编码字符串
    @Value("${login.jwt.public-key}")
    private String publicKeyBase64;
    // 获取 JwtParser，公钥用于验证签名，确保JWT没有被纂改
    private JwtParser getJwtParser() {
        try {
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(Decoders.BASE64.decode(publicKeyBase64));
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey pk = keyFactory.generatePublic(keySpec);
            return Jwts.parserBuilder().setSigningKey(pk).build();
        } catch (Exception e) {
            // 获取公钥失败
            throw new BusinessException("获取Jwt公钥失败");
        }
    }
	// 初始化方法
    @Override
    public void afterPropertiesSet() throws Exception {
        // 调用 getPrivateKey 方法将 Base64 编码的私钥字符串转换为 PrivateKey 对象。
        // 私钥生成数字签名
        privateKey = getPrivateKey();
        // 调用 getJwtParser 方法将 Base64 编码的公钥字符串转换为 JwtParser 对象，用于后续的 JWT 验证。
        // 公钥验证数字签名
        jwtParser = getJwtParser();
    }
	// 验证JWT
    public <T> T verifyJwt(String jwt, Class<T> jwtPayloadClass) {
        // 为空，返回null，表示无效的JWT
        if (jwt == null || jwt.isEmpty()) {
            return null;
        }
        // 签名验证，过期时间验证
        Jws<Claims> jws = this.jwtParser.parseClaimsJws(jwt); 
        // 获取JWT负载
        Claims jwtPayload = jws.getBody();
        if (jwtPayload == null) {
            return null;
        }
        // 负载转换
        return JSONUtil.convert(jwtPayload, jwtPayloadClass);
    }
	// 提取 JWT 负载
    public static <T> T getPayload(String jwt, Class<T> jwtPayloadClass) {
        if (jwt == null || jwt.isEmpty()) {
            return null;
        }
        try {
            // jwt字符串由3部分组成，用英文的点分割：herder.payload.sign
            // 可以直接取中间一段，进行Base64解码
            byte[] decodedBytes = Base64.getDecoder().decode(jwt.split("\\.")[1]);
            return JSONUtil.parse(new String(decodedBytes), jwtPayloadClass);
        } catch (Exception e) {
            return null;
        }
    }
}
```

