+++
title = '[Wagtail02]第一个网站'
date = 2024-08-19T09:05:53+08:00
draft = false

+++

创建app

```
python manage.py startapp blog
```

注册app到mysite/settings/base.py

```
INSTALLED_APPS = [
    "blog", # <- Our new blog app.
    "home",
    "search",
    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    #... other packages
]
```

# 一、博客首页

编辑blog/models.py

```py
from django.db import models

# Add these:
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel


class BlogIndexPage(Page):
    intro = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('intro')
    ]
    template = 'blog/blog_index_page.html'
```

创建迁移文件并迁移

```
python manage.py makemigrations
python manage.py migrate
```

创建文件`blog/templates/blog/blog_index_page.html`

```django
{% extends "base.html" %}

{% load wagtailcore_tags %}

{% block body_class %}template-blogindexpage{% endblock %}

{% block content %}
    <h1>{{ page.title }}</h1>

    <div class="intro">{{ page.intro|richtext }}</div>

    {% for post in page.get_children %}
        <h2><a href="{% pageurl post %}">{{ post.title }}</a></h2>
        {{ post.specific.intro }}
        {{ post.specific.body|richtext }}
    {% endfor %}

{% endblock %}
```

从Wagtail Admin创建页面

1. 前往https://127.0.0.1/admin，并登录
2. 前往Pages页面，点击Home
3. 点击...，添加子页面
4. 选择BlogIndexPage
5. 使用Our Blog作为标题，并修改slug，点击发布
6. 在https://127.0.0.1/blog查看页面

# 二、博文页面

编辑`blog/models.py`

```py
from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel

# add this:
from wagtail.search import index

# keep the definition of BlogIndexPage model, and add the BlogPage model:

class BlogPage(Page):
    date = models.DateField("Post date")
    intro = models.CharField(max_length=250)
    body = RichTextField(blank=True)

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
        index.SearchField('body'),
    ]

    content_panels = Page.content_panels + [
        FieldPanel('date'),
        FieldPanel('intro'),
        FieldPanel('body'),
    ]
```

迁移数据库

# 三、创建页面

`blog/templates/blog/blog_page.html`

```django
{% extends "base.html" %}

{% load wagtailcore_tags %}

{% block body_class %}template-blogpage{% endblock %}

{% block content %}
    <h1>{{ page.title }}</h1>
    <p class="meta">{{ page.date }}</p>

    <div class="intro">{{ page.intro }}</div>

    {{ page.body|richtext }}

    <p><a href="{{ page.get_parent.url }}">Return to blog</a></p>

{% endblock %}
```

1. 进入Wagtail Admin页面，点击Pages，点击Home
2. 在Our Blog，点击...，选择Add child page
3. 选择Blog page



























