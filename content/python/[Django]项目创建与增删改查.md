+++
title = "【Django】项目创建与增删改查"
date = "2024-07-04T21:06:56+08:00"
tags = ["python"]

+++

## 一、常用命令

```
# 创建虚拟环境
virtualenv venv
# 激活虚拟环境
source venv/Scripts/activate
# 取消激活
deactivate
# 安装Django
pip install Django
# 创建项目
django-admin startproject studybud
# 到manage.py所在目录运行项目
cd studybud
python manage.py runserver

# 数据库迁移
python manage.py makemigrations # 生成了对应的sql语句，没真正将改动迁移到数据库中
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

#把英文改为中文
LANGUAGE_CODE = 'zh-hans'
#把国际时区改为中国时区
TIME_ZONE = 'Asia/Shanghai'

# Pygment生成CSS
pygmentize -S default -f html -a .codehilite > default.css

```



## 二、app创建

```python
# 创建app
python manage.py startapp base
# 注册app->settings.py->INSTALLED_APPS add
'base.apps.BaseConfig',
# 创建针对该应用的urls.py 
# include该app的urls.py
from django.urls import path, include
urlpatterns = [
    path("", include('base.urls'))
]
# 根目录创建templates
# app创建templates/app_name
```



## 三、Django基础

### (一)、View

#### 1. 基于函数的视图

urls.py

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name = "home page"),
    path("room/", views.room, name = "room page"),
]
```

views.py

```python
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello world!")

def room(request):
    return HttpResponse("room page")
```

#### 2. 返回html

```
# template 创建 home.html, room.html
# 添加settings.py->TEMPLATES->"DIRS"
BASE_DIR / 'templates',
```

views.py

```python
from django.shortcuts import render

def home(request):
    return render(request, "home.html")

def room(request):
    return render(request, "room.html")
```

#### 3. 传递数据

views.py

```python
rooms = [
    {'id': 1, 'name': "Let's learn Python!"},
    {'id': 2, 'name': "Let's learn Java!"},
    {'id': 3, 'name': "Let's learn Vue!"},
]

def home(request):
    context = {'rooms': rooms}
    return render(request, "home.html", context)
```

#### 4. 从数据库查询数据

```
queryset = ModelName.objects.all()/get()/filter()/exclude()
```

views.py

```python
def home(request):
    rooms = Room.objects.all()
    context = {'rooms': rooms}
    return render(request, "base/home.html", context)

def room(request, pk):
    room = Room.objects.get(id=int(pk))
    context = {'room': room}
    return render(request, "base/room.html", context)
```

### (二)、Template

#### 1. 常用语法

```
# 包含navbar模版
{% include 'navbar.html' %}

# for循环
{% for room in rooms %}
    <div>
        <h5>{{ room.id }} -- {{ room.name }}</h5>
    </div>
{% endfor %}

# if判断
{% if request.user.is_authenticated %}
<a href="{% url 'logout-page' %}">Logout</a>
{% else %}
<a href="{% url 'login-page' %}">Login</a>
{% endif %}

```

#### 2. 模版继承

main.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Study Bud</title>
</head>
<body>
    {% include 'navbar.html' %}
    {% block content %}

    {% endblock%}
</body>
</html>
```

home.html

```html
{% extends 'main.html' %}

{% block content %}
<h1>Home Template</h1>
{% endblock content%}
```

### (三)、urls.py

#### 静态url

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name = "home page"),
    path("room/", views.room, name = "room page"),
]
```

#### 动态url

```
path("room/<str:pk>/", views.room, name = "room page")
<a href="{% url 'room page' room.id %}">{{ room.name }}</a>
```

views.py

```python
def room(request, pk):
    room = None
    for i in rooms:
        if i['id'] == int(pk):
            room = i
    context = {'room': room}
    return render(request, "base/room.html", context)
```

### (四)、models.py

```python
from django.db import models
from django.contrib.auth.models import User


class Topic(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Room(models.Model):
    host = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    # participants =
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    body = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.body[0:10]
```

### (五)、admin.py

```python
from .models import Room
admin.site.register(Room)
```

## 四、CRUD

### (一)、增-Create

urls.py

```python
path("create-room/", views.create_room, name = "create-room"),
```

forms.py

```python
from django.forms import ModelForm
from .models import Room

class RoomForm(ModelForm):
    class Meta:
        model = Room
        fields = "__all__"
        # fields = ['name', ...]
```

views.py

```python
from django.shortcuts import redirect
from .forms import RoomForm

def create_room(request):
    form = RoomForm()
    context = {'form': form}
    if request.method == "POST":
        form = RoomForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("home-page")
    return render(request, 'base/room_form.html', context)
```

room_form.html

```html
{% extends 'main.html' %}

{% block content %}

<div>
    <form action="" method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <input type="submit" value="Submit">
    </form>
</div>

{% endblock content %}
```

home.html

```html
<a href="{% url 'create-room' %}"> Create Room </a>
```

### (二)、改-Update

urls.py

```python
path("update-room/<str:pk>/", views.update_room, name = "update-room"),
```

views.py

```python
def update_room(request, pk):
    room = Room.objects.get(id=int(pk))
    form = RoomForm(instance=room)
    if request.method == "POST":
        form = RoomForm(request.POST, instance=room)
        if form.is_valid():
            form.save()
            return redirect("home-page")
    context = {'form': form}
    return render(request, 'base/room_form.html', context)
```

home.html

```html
<a href="{% url 'update-room' room.id %}">Edit</a>
```

### (三)、删-Delete

urls.py

```python
path("delete-room/<str:pk>/", views.delete_room, name = "delete-room"),
```

delete.html

```html
{% extends "main.html" %}

{% block content %}

<form action="" method="POST">
    {% csrf_token %}
    <p> Are you sure you want to delete "{{ obj.name }}" ? </p>
    <a href="{{ request.META.HTTP_REFERER }}">Go back</a>
    <input type="submit" value="Confirm" />
</form>

{% endblock content %}
```

views.py

```python
def delete_room(request, pk):
    room = Room.objects.get(id=int(pk))
    if request.method == "POST":
        room.delete()
        return redirect('home-page')
    return render(request, 'base/delete.html', {'obj':room})
```

home.html

```html
<a href="{% url 'delete-room' room.id %}">Delete</a>
```

### (四)、查-Retrieve

#### 1. 侧边栏

home.html

```html
{% extends 'main.html' %}

{% block content %}

<style>
    .home-container{
        display: grid;
        grid-template-columns: 1fr 3fr;
    }
</style>

<div class="home-container">
    <div>
        <h3>Browse Topics</h3>
        <hr>
        <div>
            <a href="{% url 'home-page' %}"> All </a>
        </div>
        {% for topic in topics %}
            <div>
                <a href="{% url 'home-page' %}?q={{ topic.name }}"> {{ topic.name }} </a>
            </div>
        {% endfor %}
    </div>

    <div>
        <a href="{% url 'create-room' %}"> Create Room </a>
        <div>
            {% for room in rooms %}
            <div>
                <a href="{% url 'update-room' room.id %}">Edit</a>
                <a href="{% url 'delete-room' room.id %}">Delete</a>
                <span>@{{ room.host }}</span>
                <h5>{{ room.id }} -- <a href="{% url 'room-page' room.id %}">{{ room.name }}</a></h5>
                <small>{{ room.topic }}</small>
                <hr>
            </div>
            {% endfor %}
        </div>
    </div>
</div>

{% endblock content%}
```

views.py

```python
def home(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    rooms = Room.objects.all().filter(topic__name__icontains = q)
    topics = Topic.objects.all()
    context = {'rooms': rooms, 'topics': topics}
    return render(request, "base/home.html", context)
```

#### 2. 搜索框

navbar.html

```html
<a href="/">
  <h1>Study Bud</h1>
</a>

<form action="{% url 'home-page' %}" method="get">
  <input type="text" name="q" placeholder="Search Rooms..." />
</form>

<hr>
```

views.py

```python
from django.db.models import Q

def home(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    rooms = Room.objects.all().filter(
        Q(topic__name__icontains = q) |
        Q(name__icontains = q) |
        Q(description__contains = q)
    )
    topics = Topic.objects.all()
    context = {'rooms': rooms, 'topics': topics}
    return render(request, "base/home.html", context)
```

#### 3. 查询数量

home.html

```html
<h5>{{ room_count }} rooms available</h5>
```

views.py

```python
room_count = rooms.count()
```

## 五、用户操作

### (一)、登录

urls.py

```python
path("login/", views.loginPage, name = "login-page"),
```

navbar.html

```html
<a href="{% url 'login-page' %}">Login</a>
```

login_register.html 消息弹出

```html
{% extends 'main.html' %}

{% block content %}
<div>
    <form action="" method="POST">
        {% csrf_token %}

        <label>Username:</label>
        <input type="text" name="username" placeholder="Enter Username here...">
        <br>
        <label>Password:</label>
        <input type="password" name="password" placeholder="Enter Password here...">
        <br>
        <input type="submit" value="Login" />
    </form>
</div>
{% endblock content %}
```

main.html

```html
{% include 'navbar.html' %}
    {% if messages %}
    <ul class="messages">
        {% for message in messages %}
        <li>
            {{ message }}
        </li>
        {% endfor %}
    </ul>
    {% endif %}
{% block content %}

{% endblock%}
```

views.py

```python
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

def loginPage(request):

    if request.method == "POST":
        username = request.POST.get("username").lower()
        password = request.POST.get("password")
        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, "User does not exist.")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home-page')
        else:
            messages.error(request, "Username OR password does not exist.")
    context = {}
    return render(request, "base/login_register.html", context)
```

### (二)、登出

urls.py

```python
path("logout/", views.logoutPage, name = "logout-page"),
```

navbar.html

```html
{% if request.user.is_authenticated %}
<a href="{% url 'logout-page' %}">Logout</a>
{% else %}
<a href="{% url 'login-page' %}">Login</a>
{% endif %}
```

views.py

```python
def logoutPage(request):
    logout(request)
    return redirect('home-page')
```

### (三)、限制访问

#### 1. 限制登录

views.py

```python
from django.contrib.auth.decorators import login_required

@login_required(login_url= "login-page")
def create_room(request):
    form = RoomForm()
    context = {'form': form}
    if request.method == "POST":
        form = RoomForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("home-page")
    return render(request, 'base/room_form.html', context)
```

#### 2. 限制特定用户

home.html

```html
{% if request.user == room.host %}
<a href="{% url 'update-room' room.id %}">Edit</a>
<a href="{% url 'delete-room' room.id %}">Delete</a>
{% endif %}
```

views.py

```python
@login_required(login_url= "login-page")
def update_room(request, pk):
    room = Room.objects.get(id=int(pk))
    form = RoomForm(instance=room)

    if request.user != room.host:
        return HttpResponse("You are not allowed here!")

    if request.method == "POST":
        form = RoomForm(request.POST, instance=room)
        if form.is_valid():
            form.save()
            return redirect("home-page")
    context = {'form': form}
    return render(request, 'base/room_form.html', context)
```

#### 3. 防止用户重新登录

```python
def loginPage(request):
    if request.user.is_authenticated:
        return redirect("home-page")
```

### (四)、注册

登录 views.py

```python
def loginPage(request):
    page = 'login-page'
    # ......
    context = {"page":page}
    return render(request, "base/login_register.html", context)
```

urls.py

```python
path("register/", views.registerPage, name = "register-page"),
```

login_register.html

```html
{% extends 'main.html' %}

{% block content %}

{% if page == 'login-page' %}
<div>
    <form action="" method="POST">
        {% csrf_token %}

        <label>Username:</label>
        <input type="text" name="username" placeholder="Enter Username here...">
        <br>
        <label>Password:</label>
        <input type="password" name="password" placeholder="Enter Password here...">
        <br>
        <input type="submit" value="Login" />
    </form>
    <p>
        havent signed up yet?
    </p>
    <a href="{% url 'register-page' %}">Sign up</a>
</div>
{% else %}
<div>
    <form action="" method="POST">
        {% csrf_token %}
        {{ form.as_p }}
        <input type="submit" value="Register" />
    </form>
    <p>
        already signed up yet?
    </p>
    <a href="{% url 'login-page' %}">Login</a>
</div>
{% endif %}
{% endblock content %}
```

views.py

```python
def registerPage(request):
    page = "register-page"
    form = UserCreationForm()
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.username = user.username.lower()
            user.save()
            login(request, user)
            return redirect('home-page')
        else:
            messages.error(request, "An error occurred during registration.")
    context = {"page": page, "form": form}
    return render(request, "base/login_register.html", context)
```
