+++
title = '[Wagtail01]创建'
date = 2024-08-18T21:52:49+08:00
draft = false

+++

# 一、创建并激活虚拟环境

```
py -m venv mysite\env

# then

mysite\env\Scripts\activate.bat

# if mysite\env\Scripts\activate.bat doesn't work, run:

mysite\env\Scripts\activate
```

# 二、安装Wagtail

```
pip install wagtail
```

# 三、创建站点

```
wagtail start mysite mysite
```

项目结构：

```
mysite/
├── .dockerignore
├── Dockerfile
├── home/
├── manage.py*
├── mysite/
├── requirements.txt
└── search/
```

安装依赖：

```
cd mysite
pip install -r requirements.txt
```

# 四、创建数据库

```
python manage.py migrate
```

Every time you alter your model, then you must run the `python manage.py migrate` command to update the database. 

# 五、创建管理员用户

```
python manage.py createsuperuser
```

> username:yrx
> email:rongxingyang@outlook.com
> password:dfjb

# 六、运行项目

```
python manage.py runserver
```

# 七、创建并注册APP

```
python manage.py startapp blog
```

在mysite/settings/base.py注册APP

```
INSTALLED_APPS = [
    "blog",
    ......
]
```

