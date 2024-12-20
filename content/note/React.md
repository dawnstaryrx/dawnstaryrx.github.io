+++
title = 'React'
date = 2024-11-27T15:11:19+08:00
draft = false

+++

# React

## 1. 创建React项目

### 1.1 创建

```
npm create vite@latest
```

- 输入项目名称：react-learn
- 选择React
- JavaScript
- cd xxx      
- code .   打开VSCode
- npm install
- npm run dev

### 1.2 项目结构

- vite.config.js 配置文件
- index.html
- src
  - main.jsx 入口文件

### 1.3 安装tailwind css

https://tailwindcss.com/docs/guides/vite

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

修改tailwind.config.js

```
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

修改index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

重新启动

```
npm run dev
```

测试App.jsx

```
const App = () => {
  return (
    <div className='text-5xl'>App</div>
  )
}

export default App
```

### 1.4 修改端口、反向代理

vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})

```

### 1.5 使用nextUI

```
npm i @nextui-org/react framer-motion
```

tailwind css设置

```js
// tailwind.config.js
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ...
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()]
}
```

provider设置

```jsx
// main.tsx or main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {NextUIProvider} from '@nextui-org/react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>,
)
```



## 2. JSX

快捷键 rafce

### 1. 只能返回一个元素

```
const App = () => {
  return (
    <>
      <div className='text-5xl'>App</div>
      <p>你好</p>
    </>
  )
}

export default App
```

### 2. 变量   {}

```
const App = () => {
  const name = 'John';
  const x = 10;
  const y = 20;
  return (
    <>
      <div className='text-5xl'>App</div>
      <p>你好, {name}</p>
      <p> The sum of {x} and {y} is {x+y}</p>
    </>
  )
}

export default App
```

### 3. 循环

```
const App = () => {
  const names = ['John', 'Peter', 'Mary'];
  return (
    <>
      <ul>
        {
          names.map((name, index) => (
            <li key={index}>{name}</li>
          ))
        }
      </ul>
    </>
  )
}

export default App
```

### 4. 判断

```
const App = () => {
  const loggedIn = true

  if(loggedIn){
    return <h1>Hello, Member!</h1>
  }

  return (
    <>
      <div className='text-5xl'>App</div>
    </>
  )
}

export default App
```

三目运算符

```
const App = () => {
  const loggedIn = true

  return (
    <>
      <h1>{ loggedIn ? <h1>欢迎您， 会员</h1> : '' }</h1>
      <h1>{ loggedIn && <h1>欢迎您， 会员</h1> }</h1>
    </>
  )
}

export default App
```

### 5. CSS

方式1

```
const App = () => {

  return (
    <>
      <p style={{color: 'red', fontSize: '50px'}}>你好</p>
    </>
  )
}

export default App
```

方式2

```
const App = () => {
  const styles = {
    color: 'blue',
    fontSize: '20px'
  }

  return (
    <>
      <p style={styles}>你好</p>
    </>
  )
}

export default App
```



## 3. components

拆分一个HTML页面为5个组件



## 4. useState

Less or More

```jsx
import { useState } from "react"
import { FaMapMarker } from "react-icons/fa"
import { Link } from "react-router-dom"
const JobListing = ({job}) => {
  const [showFullDescription, setShowFullDescription] = useState(false)
  let description = job.description;
  if(!showFullDescription){
    description = description.substring(0, 90) + "..."
  }
  return (
    <div className="bg-white rounded-xl shadow-md relative">
      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2"> { job.type } </div>
          <h3 className="text-xl font-bold">{ job.title }</h3>
        </div>

        <div className="mb-5">
        { description }
        </div>

        <button onClick={() => setShowFullDescription((prevState) => !prevState)} className="text-indigo-500 mb-5 hover:text-indigo-600">{showFullDescription ? 'Less' : 'More'}</button>

        <h3 className="text-indigo-500 mb-2">{ job.salary } / Year</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <FaMapMarker className='inline text-lg mb-1 mr-1' />
            {job.location}
          </div>
          <Link
            to={`/job/${job.id}`}
            className="h-[36px] bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center text-sm"
          >
          Read More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default JobListing
```

### `useState` 讲解

在 React 中，`useState` 是一个 Hook，允许函数组件拥有状态（state）。React 的组件一般分为**类组件**和**函数组件**，以前类组件才能有状态（state），但是随着 React 的更新，函数组件通过 Hook 也可以管理状态。

#### `useState` 的基本用法：

`useState` 是一个函数，它接受初始状态作为参数，返回一个数组，数组中的第一个元素是当前的状态值，第二个元素是用来更新状态的函数。

语法：

```
const [state, setState] = useState(initialState);
```

- `state`：当前状态值。
- `setState`：更新状态的函数。
- `initialState`：状态的初始值。

#### 在你提供的代码中的 `useState`：

```
const [showFullDescription, setShowFullDescription] = useState(false);
```

- `showFullDescription` 是状态变量，表示是否展示完整的职位描述。
- `setShowFullDescription` 是用来更新 `showFullDescription` 状态的函数。
- `false` 是初始状态，表示默认情况下不展示完整描述。

### 代码逻辑解读

这个组件 `JobListing` 展示一个职位的详细信息。关键的交互部分是显示职位描述的“更多”与“收起”按钮，它通过 `showFullDescription` 来控制描述的显示与隐藏。

1. **初始状态：**

   - 在初始渲染时，`showFullDescription` 为 `false`，意味着职位描述会被截断，只显示前 90 个字符，并附加一个 "..." 表示还有更多内容。

2. **条件渲染描述：**

   ```
   let description = job.description;
   if (!showFullDescription) {
     description = description.substring(0, 90) + "...";
   }
   ```

   - 如果 `showFullDescription` 为 `false`，会截取职位描述的前 90 个字符，之后加上 `...` 表示还有更多内容。

3. **点击按钮切换状态：**

   ```
   <button onClick={() => setShowFullDescription((prevState) => !prevState)} className="text-indigo-500 mb-5 hover:text-indigo-600">
     {showFullDescription ? 'Less' : 'More'}
   </button>
   ```

   - 当点击按钮时，会调用 

     ```
     setShowFullDescription
     ```

      来切换状态值：

     - `!prevState`：如果当前状态是 `false`，会更新为 `true`，反之亦然。

   - 如果 `showFullDescription` 为 `true`，按钮显示 "Less"（收起）；如果为 `false`，按钮显示 "More"（更多）。

4. **根据状态更新显示：**

   - 当 `showFullDescription` 为 `true` 时，完整的职位描述会显示出来，点击按钮后变成 "Less"，以便收起描述。
   - 当 `showFullDescription` 为 `false` 时，职位描述会被截断，并显示 "More" 以展开完整描述。

## 5. React 图标

```
npm install react-icons
```

使用

```
import { FaMapMarker } from "react-icons/fa"
<FaMapMarker className='inline text-lg mb-1 mr-1' />
```

## 6. React-router

```
npm i react-router-dom
```

### 6.1 主要的组件和 API

`react-router-dom` 提供了多个重要的 API 和组件：

- **`BrowserRouter`**：管理应用的路由状态，通常包裹整个应用。
- **`Route`**：定义路由规则，指定一个路径和该路径应该渲染的组件。
- **`Link`**：创建一个跳转到指定路径的链接。
- **`RouterProvider`**（React Router 6 中新增）: 用于提供 `router` 配置。

### 6.2 `createBrowserRouter` 和 `createRoutesFromElements`

在 React Router 6 中，新增了 `createBrowserRouter` 和 `createRoutesFromElements` 的 API，用来配置路由。具体来说：

- **`createBrowserRouter`**：用于创建一个路由实例，该实例会根据浏览器的 URL 来管理路由和页面的渲染。
- **`createRoutesFromElements`**：用于从 React 元素（如 `<Route />`）创建路由配置。

这两个 API 的组合是 React Router 6 中推荐的路由配置方式，下面我们来详细分析一下代码。

```jsx
import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider 
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import AddJobPage from "./pages/AddJobPage";

// 配置路由
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      {/* index 代表默认的首页路由 */}
      <Route index element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/add-job" element={<AddJobPage />} />
    </Route>
  )
);

// 在 App 组件中提供路由实例
const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;

```

### 6.3 所有页面统一顶部菜单

```jsx
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default MainLayout
```

### 6.4 Link

```jsx
import { Link } from 'react-router-dom'
const ViewAllJobs = () => {
  return (
    <section className="m-auto max-w-lg my-10 px-6">
      <Link
        to="/jobs"
        className="block bg-black text-white text-center py-4 px-6 rounded-xl hover:bg-gray-700"
        >
        View All Jobs
      </Link>
    </section>
  )
}

export default ViewAllJobs
```

### 6.5 NavLink

增强版Link

```
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom"
const NavBar = () => {
  const linkClass =  ({ isActive }) => isActive ? "bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2" : "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
  return (
    <>
      <nav className="bg-indigo-700 border-b border-indigo-500">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div
              className="flex flex-1 items-center justify-center md:items-stretch md:justify-start"
            >
              {/* <!-- Logo --> */}
              <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
                <img
                  className="h-10 w-auto"
                  src={ logo }
                  alt="React Jobs"
                />
                <span className="hidden md:block text-white text-2xl font-bold ml-2"
                  >React Jobs</span
                >
              </NavLink>
              <div className="md:ml-auto">
                <div className="flex space-x-2">
                  <NavLink
                    to="/"
                    className={ linkClass }
                    >
                    Home
                  </NavLink>
                  <NavLink
                    to="/jobs"
                    className={ linkClass }
                    >
                    Jobs
                  </NavLink>
                  <NavLink
                    to="/add-job"
                    className={ linkClass }
                    >
                    Add Job
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavBar
```





## 7. 自定义404

NotFoundPage.jsx

```jsx
import { Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'

const NotFoundPage = () => {
  return (
    <section className="text-center flex flex-col justify-center items-center h-96">
      <FaExclamationTriangle className='text-yellow-400 text-6xl mb-4'></FaExclamationTriangle>
      <h1 className="text-6xl font-bold mb-4">404 Not Found</h1>
      <p className="text-xl mb-5">This page does not exist</p>
      <Link
        to="/"
        className="text-white bg-indigo-700 hover:bg-indigo-900 rounded-md px-3 py-2 mt-4"
        >
        Go Back
      </Link>
    </section>
  )
}

export default NotFoundPage
```

App.jsx 

```jsx
import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider
} from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import JobsPage from "./pages/JobsPage"
import AddJobPage from "./pages/AddJobPage"
import NotFoundPage from "./pages/NotFoundPage"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout/>}>
      <Route index element={<HomePage/>} />
      <Route path="/jobs" element={<JobsPage/>} />
      <Route path="/add-job" element={<AddJobPage/>} />
      <Route path="*" element={<NotFoundPage/>} />
    </Route>
  )
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
```



## 8. JSON服务器

### 8.1 使用

```
npm i -D json-server
```

packege.json

```
{
  "name": "react-learn",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "server": "json-server --watch src/jobs.json --port 8080"
  },
  ......
```

运行

```
npm run server
```

### 8.2 Proxying

vite.config.js

```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
```

JobListing.jsx

```jsx
import JobListing from './JobListing'
import { useState, useEffect } from 'react'
import Spinner from './Spinner'
const JobListings = ( { isHome = false } ) => {
  // const jobListings = isHome ? jobs.slice(0, 3) : jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const apiUrl = isHome ? '/api/jobs?_limit=3' : '/api/jobs';
      try{
        const res = await fetch(apiUrl)
        const data = await res.json()
        setJobs(data)
      } catch(error){
        console.log(error)
      } finally{
        setLoading(false)
      }
    }
    fetchJobs()
  }, []);

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          { isHome ? 'Recent Jobs' : 'All Jobs' }
        </h2>
          { loading ? ( <Spinner loading={loading} />) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              { jobs.map((job) => (
                <JobListing key={job.id} job={job} />
              )) }
            </div>
          ) }
      </div>
    </section>
  )
}

export default JobListings
```







## 9. Spinners

```
npm i react-spinners
```

code

```jsx
import JobListing from './JobListing'
import { useState, useEffect } from 'react'
import Spinner from './Spinner'
const JobListings = ( { isHome = false } ) => {
  // const jobListings = isHome ? jobs.slice(0, 3) : jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const apiUrl = isHome ? 'http://localhost:8080/jobs?_limit=3' : 'http://localhost:8080/jobs';
      try{
        const res = await fetch(apiUrl)
        const data = await res.json()
        setJobs(data)
      } catch(error){
        console.log(error)
      } finally{
        setLoading(false)
      }
    }
    fetchJobs()
  }, []);

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          { isHome ? 'Recent Jobs' : 'All Jobs' }
        </h2>
          { loading ? ( <Spinner loading={loading} />) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              { jobs.map((job) => (
                <JobListing key={job.id} job={job} />
              )) }
            </div>
          ) }
      </div>
    </section>
  )
}

export default JobListings
```



## 10. 路由参数 & Data Loader

JobPage.jsx

```jsx
import { useParams, useLoaderData } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const JobPage = () => {
  const { id } = useParams();
  const job = useLoaderData();

  return (
    <>
      {/* <!-- Go Back --> */}
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/jobs"
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className='mr-2' /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div
                className="bg-white p-6 rounded-lg shadow-md text-center md:text-left"
              >
                <div className="text-gray-500 mb-4">{ job.type }</div>
                <h1 className="text-3xl font-bold mb-4">
                  { job.title }
                </h1>
                <div
                  className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start"
                >
                  <FaMapMarker className='mr-1 text-orange-700' />
                  <p className="text-orange-700">{ job.location }</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Job Description
                </h3>

                <p className="mb-4">
                { job.description }
                </p>

                <h3 className="text-indigo-800 text-lg font-bold mb-2">Salary</h3>

                <p className="mb-4">{ job.salary } / Year</p>
              </div>
            </main>

            {/* <!-- Sidebar --> */}
            <aside>
              {/* <!-- Company Info --> */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Company Info</h3>

                <h2 className="text-2xl">{ job.company.name }</h2>

                <p className="my-2">
                  { job.company.description }
                </p>

                <hr className="my-4" />

                <h3 className="text-xl">Contact Email:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  { job.company.contactEmail }
                </p>

                <h3 className="text-xl">Contact Phone:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">{ job.company.contactPhone }</p>
              </div>

              {/* <!-- Manage --> */}
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                <Link
                  to={`/jobs/edit/`}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >Edit Job</Link
                >
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Delete Job
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

const jobLoader = async ( {params} ) => {
  const res = await fetch(`/api/jobs/${params.id}`)
  const job = await res.json()
  return job
}

export { JobPage as default, jobLoader }
```

App.jsx

```jsx
import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider
} from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import JobsPage from "./pages/JobsPage"
import JobPage, { jobLoader } from "./pages/JobPage"
import AddJobPage from "./pages/AddJobPage"
import NotFoundPage from "./pages/NotFoundPage"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout/>}>
      <Route index element={<HomePage/>} />
      <Route path="/jobs" element={<JobsPage/>} />
      <Route path="/jobs/:id" element={<JobPage/>} loader={jobLoader} />
      <Route path="/add-job" element={<AddJobPage/>} />
      <Route path="*" element={<NotFoundPage/>} />
    </Route>
  )
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
```



## 11. Add Job

for -> htmlFor

class -> className



App.jsx

```jsx
import { 
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider
} from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import HomePage from "./pages/HomePage"
import JobsPage from "./pages/JobsPage"
import JobPage, { jobLoader } from "./pages/JobPage"
import AddJobPage from "./pages/AddJobPage"
import NotFoundPage from "./pages/NotFoundPage"

const App = () => {
  // Add New Job
  const addJob = async (newJob) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newJob)
    })
    return ;
  }

  // Delete Job
  const deleteJob = async (id) => {
    await fetch(`/api/jobs/${id}`, {
      method: 'DELETE'
    })
    return ;
  }
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout/>}>
        <Route index element={<HomePage/>} />
        <Route path="/jobs" element={<JobsPage/>} />
        <Route path="/jobs/:id" element={<JobPage deleteJob={deleteJob} />} loader={jobLoader} />
        <Route path="/add-job" element={<AddJobPage addJobSubmit={addJob} />} />
        <Route path="*" element={<NotFoundPage/>} />
      </Route>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

export default App
```

JobPage.jsx

```jsx
// import { useParams, useLoaderData } from 'react-router-dom';
import {  useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const JobPage = ({ deleteJob }) => {
  // const { id } = useParams();
  const job = useLoaderData();
  const navigate = useNavigate();

  const onDeleteClick = (id) => {
    const confirm = window.confirm('Are you sure you want to delete this job?');
    if ( !confirm ){
      return;
    }
    deleteJob(id);
    navigate('/jobs');
  }

  return (
    <>
      {/* <!-- Go Back --> */}
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/jobs"
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className='mr-2' /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div
                className="bg-white p-6 rounded-lg shadow-md text-center md:text-left"
              >
                <div className="text-gray-500 mb-4">{ job.type }</div>
                <h1 className="text-3xl font-bold mb-4">
                  { job.title }
                </h1>
                <div
                  className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start"
                >
                  <FaMapMarker className='mr-1 text-orange-700' />
                  <p className="text-orange-700">{ job.location }</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Job Description
                </h3>

                <p className="mb-4">
                { job.description }
                </p>

                <h3 className="text-indigo-800 text-lg font-bold mb-2">Salary</h3>

                <p className="mb-4">{ job.salary } / Year</p>
              </div>
            </main>

            {/* <!-- Sidebar --> */}
            <aside>
              {/* <!-- Company Info --> */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Company Info</h3>

                <h2 className="text-2xl">{ job.company.name }</h2>

                <p className="my-2">
                  { job.company.description }
                </p>

                <hr className="my-4" />

                <h3 className="text-xl">Contact Email:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  { job.company.contactEmail }
                </p>

                <h3 className="text-xl">Contact Phone:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">{ job.company.contactPhone }</p>
              </div>

              {/* <!-- Manage --> */}
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                <Link
                  to={`/jobs/edit/`}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                  Edit Job
                </Link>
                <button onClick={() => onDeleteClick(job.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                >
                  Delete Job
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

const jobLoader = async ( {params} ) => {
  const res = await fetch(`/api/jobs/${params.id}`)
  const job = await res.json()
  return job
}

export { JobPage as default, jobLoader }
```

AddJobPage.jsx

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddJobPage = ({ addJobSubmit }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Full-Time");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("Under $50K");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();

    const newJob = {
      title,
      type,
      location, 
      description,
      salary,
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail,
        contactPhone,
      }
    }

    addJobSubmit(newJob);

    return navigate("/jobs");
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div
          className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0"
        >
          <form onSubmit={submitForm}>
            <h2 className="text-3xl text-center font-semibold mb-6">Add Job</h2>

            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-700 font-bold mb-2"
                >Job Type</label
              >
              <select
                id="type"
                name="type"
                className="border rounded w-full py-2 px-3"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2"
                >Job Listing Name</label
              >
              <input
                type="text"
                id="title"
                name="title"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="eg. Beautiful Apartment In Miami"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 font-bold mb-2"
                >Description</label
              >
              <textarea
                id="description"
                name="description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="Add any job duties, expectations, requirements, etc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="type" className="block text-gray-700 font-bold mb-2"
                >Salary</label
              >
              <select
                id="salary"
                name="salary"
                className="border rounded w-full py-2 px-3"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              >
                <option value="Under $50K">Under $50K</option>
                <option value="$50K - 60K">$50K - $60K</option>
                <option value="$60K - 70K">$60K - $70K</option>
                <option value="$70K - 80K">$70K - $80K</option>
                <option value="$80K - 90K">$80K - $90K</option>
                <option value="$90K - 100K">$90K - $100K</option>
                <option value="$100K - 125K">$100K - $125K</option>
                <option value="$125K - 150K">$125K - $150K</option>
                <option value="$150K - 175K">$150K - $175K</option>
                <option value="$175K - 200K">$175K - $200K</option>
                <option value="Over $200K">Over $200K</option>
              </select>
            </div>

            <div className='mb-4'>
              <label className='block text-gray-700 font-bold mb-2'>
                Location
              </label>
              <input
                type='text'
                id='location'
                name='location'
                className='border rounded w-full py-2 px-3 mb-2'
                placeholder='Company Location'
                required   
                value={location}
                onChange={(e) => setLocation(e.target.value)}        
              />
            </div>

            <h3 className="text-2xl mb-5">Company Info</h3>

            <div className="mb-4">
              <label htmlFor="company" className="block text-gray-700 font-bold mb-2"
                >Company Name</label
              >
              <input
                type="text"
                id="company"
                name="company"
                className="border rounded w-full py-2 px-3"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="company_description"
                className="block text-gray-700 font-bold mb-2"
                >Company Description</label
              >
              <textarea
                id="company_description"
                name="company_description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="What does your company do?"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label
                htmlFor="contact_email"
                className="block text-gray-700 font-bold mb-2"
                >Contact Email</label
              >
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                className="border rounded w-full py-2 px-3"
                placeholder="Email address for applicants"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contact_phone"
                className="block text-gray-700 font-bold mb-2"
                >Contact Phone</label
              >
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                className="border rounded w-full py-2 px-3"
                placeholder="Optional phone for applicants"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AddJobPage
```



## 12. React Toastify Package

```
npm i react-toastify
```

MainLayout.jsx

```jsx
import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
// import NavBarTest from "../components/NavBarTest"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

const MainLayout = () => {
  return (
    <>
      <Navbar />
      {/* <NavBarTest /> */}
      <Outlet />
      <ToastContainer />
    </>
  )
}

export default MainLayout
```

JobPage.jsx

```jsx
// import { useParams, useLoaderData } from 'react-router-dom';
import {  useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const JobPage = ({ deleteJob }) => {
  // const { id } = useParams();
  const job = useLoaderData();
  const navigate = useNavigate();

  const onDeleteClick = (id) => {
    const confirm = window.confirm('Are you sure you want to delete this job?');
    if ( !confirm ){
      return;
    }
    deleteJob(id);

    toast.success('Job deleted successfully');

    navigate('/jobs');
  }
```



## 13. Edit Job













