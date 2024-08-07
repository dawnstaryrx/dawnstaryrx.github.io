+++
title = "Vue3项目搭建"
date = "2024-07-31T16:22:16+08:00"
tags = ["前端",]

+++

# 一、使用vite创建项目

vite官方中文文档：https://cn.vitejs.dev/guide/

```
npm create vite@latest
```

![image-20240731165805108](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F31%2F064c8f5c7c5b9f681b12e81fab90201d-image-20240731165805108-7c52fe.png)

进入项目

```
npm install
npm run dev
```

更换镜像源

```
npm config set registry https://registry.npmmirror.com
npm config set registry https://registry.npm.taobao.org
```

# 二、配置Vue3文件

## 1. 配置vite环境变量及配置代理

解决跨域问题

```js
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

## 2. 添加Vue Router

```
npm install vue-router@4
```

在`main.js`中引入

```js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import { createPinia } from 'pinia'
// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// const pinia = createPinia()
const app = createApp(App);
// pinia.use(piniaPluginPersistedstate)
app.use(router);
// app.use(ElementPlus);
// app.use(pinia)
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
import { useTokenStore } from '@/stores/token.js'
const routes = [
  {
    path: '/',
    name: 'index',
    title: '首页',
    component: () => import('@/views/HomePage.vue'), 
  },
  {
    path: '/app/:id',
    name: 'app_detail',
    title: '应用详情',
    component: () => import('@/views/user/AppDetailPage.vue'), 
  },
  {
      path: '/hello',
      name: 'hello',
      title: '测试页',
      component: () => import('@/views/HelloWorldPage.vue'), 
  },
  {
    path: '/login',
    name: 'login',
    title: '登录页',
    component: () => import('@/views/user/LoginPage.vue'), 
  },
  {
    path: '/register',
    name: 'register',
    title: '注册页',
    component: () => import('@/views/user/RegisterPage.vue'), 
  },
  {
    path: "/admin",
    title: "后台管理",
    redirect:"/admin/index",
    component: () => import('@/views/admin/AdminBasePage.vue'),
    meta: {
      requireAuth: true
    },
    beforeEnter: (to, from, next) => {
      const tokenStore = useTokenStore()
      var role = tokenStore.token.role;
      // 路由独享的拦截逻辑
      if (role==1||role==0) {
        next({name:"index"});// 中断导航
      } else {
        next(); // 继续导航
      }
    },   
    children:[
      {
        path: "index",
        name: "admin_index",
        title: "仪表盘",
        
        component: () => import('@/views/admin/AdminMainPage.vue'),
      },
      {
        path: "user",
        name: "admin_user",
        title: "用户管理",
        component: () => import('@/views/admin/AdminUserPage.vue'),
      },
    ]
  },
]
export default routes
```

修改App.vue

```vue
<template>
  <router-view />
</template>

<script setup>

</script>

<style scoped>
</style>
```

# 三、封装Axios

Axios

https://axios-http.com/docs/intro

https://www.axios-http.cn/docs/intro

```
npm install axios
```

在`src`目录下创建`utils/request.js`

```js
//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import router from "@/router";
import {ElMessage} from 'element-plus'
import {useTokenStore} from "@/stores/token.js";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({baseURL})

instance.interceptors.request.use(
    (config) => {
        // 设置请求头
        if(["post", "put", "patch"].includes(config.method)) { // 如果没有设置请求头
            if (config.method === "post" || config.method === "put" || config.method === "delete") {
                config.headers["Content-Type"] = "application/json;charset=UTF-8";
            } else { // get请求
                config.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
            }
        }
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



# 四、状态管理器Pinia

https://pinia.vuejs.org/zh/

```
npm install pinia
```

引入 `pinia-plugin-persistedstate`

```
npm i pinia-plugin-persistedstate
```

https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/

# 五、引入ElementPlus

```
npm install element-plus --save
```

# 六、初始化项目结构

## 1. APP.vue初始化

```vue
<template>
  <router-view />
</template>

<script setup>

</script>

<style scoped>
</style>
```

## 2. 修改目录结构

1. 删除`views`文件夹中所有`.vue`文件
2. 删除`components`文件夹下所有`.vue`文件
3. 添加`api`、`stores`文件夹
