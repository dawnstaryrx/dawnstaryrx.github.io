+++
title = '[GoNav 01]项目介绍与创建'
date = 2024-10-04T09:38:13+08:00
draft = false

+++

# 一、项目背景

在一家公司实习的时候，我参与了一个AI导航站的项目，主要是做AI工具的导航。最后因为种种原因，AI导航站的项目也停止了。

但是，我感受到了导航站的便捷性，于是就有了这个项目。这个项目的前端样式受到了[Van-Nav](https://github.com/Mereithhh/van-nav)的启发，因为我认为导航站首先要做到的是简约。

最后，因为我有一个域名 gooodh.com，所以，把这个项目命名为Go导航。



# 二、项目介绍

首先，这个项目是单用户/多用户的导航站，基于Springboot3和Vue3前后端分离开发，前端UI选择Bootstrap5.3。可以只有一个人使用（关闭注册），管理员用户的导航站展示在主页面，非管理员用户的导航站展示在子页面。通过开启注册/邀请码注册，也可以提供给多个人（团队使用/开放使用）。

项目的功能模块大致有：

1. 注册登录
2. 分类管理（书签管理）
3. 应用管理
4. 网站设置



# 三、项目创建

## (一) 后端

创建SpringBoot3项目。选择依赖Lombok，MySQL，Web，MyBatis。

先注释掉数据库的依赖。创建`UserController`，测试：

```java
@RestController
public class UserController {
    @RequestMapping("/hello")
    public String hello(){
        return "hello world";
    }
}
```

浏览器输入http://localhost:8080/hello，可以看到hello world。项目创建成功！



## (二) 前端

### 1. 使用vite创建项目

```
npm create vite@latest
```

- 输入项目名：gonav
- 选择框架：Vue
- 选择：JavaScript

```
cd gonav
npm install
npm run dev
```

项目创建完毕。  

可更换npm镜像源：  

```
npm config set registry https://registry.npmmirror.com
npm config set registry https://registry.npm.taobao.org
```

### 2. 配置vite环境变量及代理

用于解决跨域问题，以及使用@别名配置（@代表src目录）

```
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  server: {
    // 配置前端服务地址和端口
    // 服务器主机名
    host: '0.0.0.0',
    // 端口号
    port: 80,
    // 设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口
    strictPort: false,
    // 服务器启动时自动在浏览器中打开应用程序,当此值为字符串时，会被用作 URL 的路径名
    open: false,
    // 自定义代理规则
    proxy: {
      // 选项写法
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },

  resolve: {
    //别名配置，引用src路径下的东西可以通过@如：import Layout from '@/layout/index.vue'
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
})
```

### 3. 配置Vue-Router

```
npm install vue-router@4
```

在main.js中引入：

```js
createApp(App).mount('#app')
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// vue-i18n 需要命名导入
// import { createI18n } from 'vue-i18n'
// import i18n from './language/i18n'

const pinia = createPinia()
const app = createApp(App);
pinia.use(piniaPluginPersistedstate)
app.use(router);
app.use(pinia);
// app.use(i18n);
app.mount('#app');
```

在`src`目录下创建`router/index.js`

```js
import { createRouter, createWebHistory} from 'vue-router';
// 导入路由页面的配置
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

创建`router/routes.js`，存储路由信息

```js
// import { useTokenStore } from '@/stores/token.js'
const routes = [
  {
    path: '/hello',
    name: 'hello',
    title: '你好',
    component: () => import('@/views/HelloPage.vue'), 
  },
  {
    path: '/',
    name: 'index',
    title: '首页',
    component: () => import('@/views/HomePage.vue'), 
  },
  {
    path: '/login',
    name: 'login',
    title: '登录',
    component: () => import('@/views/login/LoginPage.vue'), 
  },
  {
    path: '/register',
    name: 'register',
    title: '注册',
    component: () => import('@/views/login/RegisterPage.vue'),
  }
]
export default routes
```

修改`App.vue`

```
<template>
  <router-view />
</template>

<script setup>

</script>

<style scoped>
</style>
```

### 4. 封装Axios

```
npm install axios
```

在`src`目录下创建`utils/request.js`

```js
//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import router from "@/router";
// import {ElMessage} from 'element-plus'
// import {useTokenStore} from "@/stores/token.js";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({baseURL})

instance.interceptors.request.use(
    (config) => {
        // 添加token
        // const tokenStore = useTokenStore();
        // if (tokenStore.token) {
        //     config.headers.token = tokenStore.token.token;
        // }
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
        // ElMessage.error(result.data.message ? result.data.message : "服务异常")
        return Promise.reject(result.data)

    },
    err => {
        if (err.response.status === 401) {
            // ElMessage.error("请先登陆");
            router.push("/login")
        } else {
            // ElMessage.error("服务异常")
        }

        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
```

### 5. 状态管理器Pinia

https://pinia.vuejs.org/zh/

```
npm install pinia
```

引入 `pinia-plugin-persistedstate`

```
npm i pinia-plugin-persistedstate
```

https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/

### 6. 引入Bootstrap5

```
npm install boostrap
```

### 7. 初始化项目结构

#### 1. APP.vue初始化

```vue
<template>
  <router-view />
</template>

<script setup>

</script>

<style scoped>
</style>
```

#### 2. 修改目录结构

1. 删除`views`文件夹中所有`.vue`文件
2. 删除`components`文件夹下所有`.vue`文件
3. 添加`api`、`stores`文件夹



