+++
title = '[GoNav 02]前端顶部导航、底部版权信息与搜索框的实现'
date = 2024-10-04T09:38:56+08:00
draft = false

+++

# 一、顶部导航栏

![image-20241008202749051](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F10%2F08%2F0e86c5cf3281dbd73266a703a7f0189a-image-20241008202749051-71ff70.png)

本项目前端使用Vue和Bootstrap5.3，主要参考Bootstrap样式并进行调整。

主要有以下需求：

1. 导航栏有左右两部分，左边导航进入子模块，右边展示信息或进入登录注册页面；
2. 导航栏居中，设置最大宽度（这样在很宽的屏幕下效果更好）；
3. 导航栏样式：鼠标悬浮变色，且底部有横线展开；当前路由的菜单高亮显示；支持响应式布局。
4. 导航栏固定在顶部，鼠标向下滚动，导航栏不动。
5. 在小屏幕上隐藏掉了登录按钮和Github按钮。

Vue代码如下：

```vue
<template>
  <div class="header-navbar-container">
    <nav class="navbar navbar-expand-lg bg-body-tertiary header-navbar-top">
      <div class="container-fluid header-navbar-top-content">
        <div class="d-flex align-items-center">
          <img class="img-navbar-brand" src="@/assets/logo.png" alt="导航站" width="36" height="36" />
          <router-link class="navbar-brand ms-2 noto-serif-sc-brand"  to="/">Go导航</router-link>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item header-navbar-top-item">
              <router-link class="nav-link noto-serif-sc-text" aria-current="page" to="/hello">Hello</router-link>
            </li>
            <li class="nav-item header-navbar-top-item">
              <a class="nav-link noto-serif-sc-text" href="https://www.baidu.com">百度</a>
            </li>
            <li class="nav-item header-navbar-top-item">
              <a class="nav-link noto-serif-sc-text" href="https://google.com/">谷歌</a>
            </li>
          </ul>
        </div>
        <ul class="navbar-nav ms-auto d-none d-lg-flex">
          <li class="nav-item header-navbar-top-icon">
            <a class="nav-link" href="https://github.com/dawnstaryrx/go-nav" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" fill="currentColor" aria-label="github icon" style="width:1.25rem;height:1.25rem;vertical-align:middle;"><path d="M511.957 21.333C241.024 21.333 21.333 240.981 21.333 512c0 216.832 140.544 400.725 335.574 465.664 24.49 4.395 32.256-10.07 32.256-23.083 0-11.69.256-44.245 0-85.205-136.448 29.61-164.736-64.64-164.736-64.64-22.315-56.704-54.4-71.765-54.4-71.765-44.587-30.464 3.285-29.824 3.285-29.824 49.195 3.413 75.179 50.517 75.179 50.517 43.776 75.008 114.816 53.333 142.762 40.79 4.523-31.66 17.152-53.377 31.19-65.537-108.971-12.458-223.488-54.485-223.488-242.602 0-53.547 19.114-97.323 50.517-131.67-5.035-12.33-21.93-62.293 4.779-129.834 0 0 41.258-13.184 134.912 50.346a469.803 469.803 0 0 1 122.88-16.554c41.642.213 83.626 5.632 122.88 16.554 93.653-63.488 134.784-50.346 134.784-50.346 26.752 67.541 9.898 117.504 4.864 129.834 31.402 34.347 50.474 78.123 50.474 131.67 0 188.586-114.73 230.016-224.042 242.09 17.578 15.232 33.578 44.672 33.578 90.454v135.85c0 13.142 7.936 27.606 32.854 22.87C862.25 912.597 1002.667 728.747 1002.667 512c0-271.019-219.648-490.667-490.71-490.667z"></path></svg>
            </a>
          </li>
          <li class="nav-item header-navbar-top-icon">
            <router-link class="nav-link" to="/login">
              <svg t="1727966561987" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5152" width="20" height="20"><path d="M521.7 82c-152.5-0.4-286.7 78.5-363.4 197.7-3.4 5.3 0.4 12.3 6.7 12.3h70.3c4.8 0 9.3-2.1 12.3-5.8 7-8.5 14.5-16.7 22.4-24.5 32.6-32.5 70.5-58.1 112.7-75.9 43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 32.6 32.5 58.1 70.4 76 112.5C865.7 417.8 875 464.1 875 512c0 47.9-9.4 94.2-27.8 137.8-17.8 42.1-43.4 80-76 112.5s-70.5 58.1-112.7 75.9c-43.6 18.4-90 27.8-137.9 27.8-47.9 0-94.3-9.4-137.9-27.8-42.2-17.8-80.1-43.4-112.7-75.9-7.9-7.9-15.3-16.1-22.4-24.5-3-3.7-7.6-5.8-12.3-5.8H165c-6.3 0-10.2 7-6.7 12.3C234.9 863.2 368.5 942 520.6 942c236.2 0 428-190.1 430.4-425.6C953.4 277.1 761.3 82.6 521.7 82zM395.025 624v-76h-314c-4.4 0-8-3.6-8-8v-56c0-4.4 3.6-8 8-8h314v-76c0-6.7 7.8-10.5 13-6.3l141.9 112c4.1 3.2 4.1 9.4 0 12.6l-141.9 112c-5.2 4.1-13 0.4-13-6.3z" fill="currentColor" p-id="5153"></path></svg>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
<style scoped>
.header-navbar-container{
  width: 100%;
  position: fixed;
  backdrop-filter: blur(6px);
  z-index: 1000;
}
.header-navbar-top {
  opacity: 0.90;/* 设置透明度 */
  font-family: 'STHeiti';
  margin: auto;
  box-shadow: 0px 2px 5px 2px rgba(0, 0, 0, 0.1);
}
.noto-serif-sc-brand {/* 设置brand字体 */
  font-family: "Noto Serif SC", serif;
  font-optical-sizing: auto;
  font-weight: 900;
  font-style: normal;
}
.noto-serif-sc-text {/* 设置导航项字体 */
  font-family: "Noto Serif SC", serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
  font-size: 18px;
}
.header-navbar-top-content {
  max-width: 1100px;
}
.navbar-brand:hover{
  color: #de7622 !important;
}

.header-navbar-top-item:hover>a{
  color: #de7622 !important;
}
.header-navbar-top-icon:hover>a{
  color: #de7622 !important;
}
.header-navbar-top-item{
  position: relative;  /* 确保伪元素相对于链接定位 */;
  text-decoration: none;  /* 移除默认的下划线 */
}
.header-navbar-top-item::after{
  content: '';
  position: absolute;
  bottom: -2px;             /* 下划线位于文本的下方 */
  left: 50%;             /* 起始位置在中间 */
  width: 0;              /* 默认宽度为 0 */
  height: 2px;           /* 下划线的高度 */
  background-color: #de7622; /* 下划线的颜色 */
  transition: width 0.3s ease, left 0.3s ease;  /* 添加动画效果 */
  
}
.header-navbar-top-item:hover::after{
  width: 100%;           /* 下划线扩展至整个文本宽度 */
  left: 0;               /* 从左边展开 */
}
.router-link-active {
  color: #de7622 !important;
}
</style>
```

其中，header-navbar-container类的div中包含了导航栏nav，主要是为了方便固定在顶部。通过router-link-active修改当前所在路由菜单的颜色。



# 二、底部版权信息

![image-20241008202749051](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F10%2F08%2F0e86c5cf3281dbd73266a703a7f0189a-image-20241008202749051-71ff70.png)

主要需求是：

1. 如果当前页面的高度不满一屏，版权信息在页面最底部；
2. 如果当前页面的高度超出一屏，版权信息尾随在最后。
3. 某些页面下，不显示版权信息，如后台和登录页面。

实现：

BottomIcp.vue

```vue
<template>
  <div class="page-container noto-serif-sc-font-family">
    <!-- 页面主体内容 -->
    <div class="content">
      <!-- 这里是页面的其他内容 -->
    </div>
    
    <!-- 备案号部分 -->
    <div class="icp">
      CopyRight {{`© ${year} ${author} ` }}
      <a href="http://beian.miit.gov.cn/" target="_blank">
        {{ record }}
      </a>
    </div>
  </div>
</template>

<script setup>
let year = new Date().getFullYear();        // 一般都是最新的一年
let author = '智浪星辰';						// 作者名
let record = '鲁ICP备2024107617号-1';		// 备案号
</script>

<style>
.noto-serif-sc-font-family {
  font-family: "Noto Serif SC", serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
/* 页面内容 */
.content {
  flex: 1; /* 让内容区域自动扩展，推到备案号组件 */
  /* 这里可以放置其他内容样式 */
}
/* 备案号样式 */
.icp {
  background-color: white;
  margin: 0;
  width: 100%;
  text-align: center;
  color: gray;
  padding: 10px 0;
}

.icp > a {
  color: gray;
  text-decoration: none;
}

.icp > a:hover {
  color: #de7622;
  text-decoration: none;
}
</style>
```

App.vue：实现页面内容高度不足一屏时，版权信息固定在页面底部

**实现方式**：

- **使用 Flex 布局**：在 `App.vue` 中，通过设置 `.m-content-display` 为 `flex` 布局，并使用 `flex-direction: column` 使子元素垂直排列。
- **内容区域自动扩展**：`.m-router-view` 设置了 `flex: 1`，使其占据剩余的可用空间。这确保了当页面内容不足一屏时，`.m-router-view` 会扩展以填满可用空间，从而将版权信息（`BottomIcp` 组件）推到页面底部。

```vue
<template>
  <div class="m-content-display">
    <div class="m-router-view">
    <router-view />
    </div>
    <!-- 使用 v-if 根据条件决定是否显示 BottomIcp -->
    <BottomIcp v-if="!hideBottomIcp" />
</div>

</template>
<script>
import BottomIcp from "@/components/front/BottomIcp.vue";
export default {
  components: {
    BottomIcp
  },
  computed: {
    hideBottomIcp() {
      const route = this.$route;
      // 确保 this.$route 存在后再访问 path
      if (!route || !route.path) {
        return false;  // 如果没有路由信息，默认显示 BottomIcp
      }
      const path = route.path;
      // 检查当前路由是否是 /login, /register 或以 /admin 开头
      return path === '/login' || path === '/register' || path.startsWith('/admin');
    }
  }
}
</script>
<style scoped>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  /* 禁止横向滚动 */
  overflow-x: hidden; 
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}
.m-content-display {
  display: flex;
  flex-direction: column;
  /* 使用视口高度 */
  min-height: 100vh; 
  /* 禁止横向滚动 */
  overflow-x: hidden; 
}
.m-router-view {
  flex: 1;
}

</style>

```

确保应用的根元素 `#app` 覆盖整个视口，以便 Flex 布局正常工作。并禁止掉横向滚动。

# 三、搜索框

![image-20241008202749051](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F10%2F08%2F0e86c5cf3281dbd73266a703a7f0189a-image-20241008202749051-71ff70.png)

搜索框的实现

```vue
<div class="content-section-search-container">
<form class="d-flex " role="search" style="width: 100%;" @submit="handleSearch">
  <input 
    ref="searchInput"
    class="form-control me-2" 
    type="search" 
    placeholder="按任意键开始搜索~~" 
    aria-label="Search" 
    style="border: 0px;box-shadow: 0 0 0 0rem;"
    >
  <button class="btn custom-search-btn" type="submit" >
    <svg t="1728041224119" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5573" width="20" height="20"><path d="M351.1808 59.2896A435.2 435.2 0 0 1 805.376 715.264 460.8 460.8 0 0 1 351.1808 59.3408z" fill="#ffffff" p-id="5574" data-spm-anchor-id="a313x.search_index.0.i12.117c3a817iUd2m" class="selected"></path><path d="M754.3808 722.2272a358.4 358.4 0 1 0-267.8272 120.2176 51.2 51.2 0 0 1 0 102.4 460.8 460.8 0 1 1 365.1584-179.712l118.8864 121.2416c23.7568 24.2176 23.552 63.0272-0.4096 87.04l-0.4096 0.4096a61.184 61.184 0 0 1-86.9888-0.4608l-148.0192-150.9376a61.7984 61.7984 0 0 1 0.4096-86.9888l0.4096-0.4096c5.632-5.5808 11.9808-9.8304 18.7904-12.8z m-467.968-364.5952h409.6a51.2 51.2 0 1 1 0 102.4h-409.6a51.2 51.2 0 1 1 0-102.4z m0 204.8h256a51.2 51.2 0 0 1 0 102.4h-256a51.2 51.2 0 1 1 0-102.4z" fill="currentColor" p-id="5575"></path></svg>
  </button>
</form>
<br>
</div>
并进行响应式布局：
.content-section-search-container {
  width: 100%;
  max-width: 1080px;
  margin: auto;
  margin-top: 66px;
  position: fixed;
  top: 20px;                      /* 垂直居中 */
  left: 50%;                     /* 水平居中 */
  transform: translate(-50%, -50%); /* 精确居中 */
  /* margin: auto; */
  background-color: rgba(255, 255, 255, 0.5); /* 半透明背景 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);   /* 添加阴影 */
  border-radius: 8px;            /* 圆角边框 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;                 /* 确保搜索框位于其他内容之上 */
}
@media (max-width: 768px) {
  .content-section-search-container {
    width: 90%;
  }
}
.content-section-category-container {
  max-width: 1080px;
  margin: auto;
  margin-top: 120px;
}
.content-section-card-container {
  max-width: 1100px;
  margin: auto;
  /* margin-top: 120px; */
}
/* 自定义按钮样式 */
.custom-search-btn {
  /* 基础样式 */
  width: 40px;
  height: 40px;
  border-radius: 100%;
  color: #000; /* 文字颜色 */
  background-color: #fff; /* 按钮背景颜色 */
  border: 0px solid #de7622; /* 按钮边框颜色 */
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; /* 平滑过渡效果 */
}

/* 悬停状态样式 */
.custom-search-btn:hover {
  background-color: #de7622; /* 悬浮后的背景颜色 */
  border-color: #de7622; /* 悬浮后的边框颜色 */
  color: #fff; /* 悬浮后的文字颜色 */
}

/* 聚焦状态样式（可选） */
.custom-search-btn:focus {
  box-shadow: 0 0 0 0.1rem rgba(222, 118, 34, 0.5); /* 添加聚焦时的阴影效果 */
}

/* 禁用状态样式（可选） */
.custom-search-btn:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
  cursor: not-allowed;
  opacity: 0.65;
}
```

此外，搜索框实现了按下任意按键直接聚焦的功能

```vue
<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'SearchCenter',
  setup() {
    // 引用搜索输入框
    const searchInput = ref(null);

    // 初始化一级分类选项
    onMounted(() => {
      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeydown);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    // 处理表单提交
    const handleSearch = (event) => {
      event.preventDefault(); // 阻止表单默认提交行为

      const query = searchInput.value.value.trim();
      if (query) {
        console.log('搜索查询:', query);
      } else {
        console.log('请输入搜索内容');
      }
    };

    const handleKeydown = (event) => {
      // 忽略修饰键（Ctrl, Alt, Meta, Shift）
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      // 检查当前是否聚焦在输入框、textarea 或 contenteditable 元素
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable;

      if (isInputFocused) {
        return;
      }

      // 检查按下的键是否为可打印字符
      if (event.key.length === 1) {
        event.preventDefault(); // 防止其他默认行为
        searchInput.value.focus();
        searchInput.value.value = event.key;
      }
    };
    return {
      searchInput,
      handleSearch,
    };
  },
};
</script>
```



