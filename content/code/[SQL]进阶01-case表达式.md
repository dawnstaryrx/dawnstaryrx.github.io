+++
title = "[SQL] Case表达式"
date = "2024-07-24T19:37:55+08:00"

tags = ["SQL",]
+++

# 一、基本语法

```
-- 简单case表达式
case sex
	when '1' then '男'
	when '2' then '女'
else '其他' end

--搜索case表达式
case when sex = '1' then '男'
	 when sex = '2' then '女'
else '其他' end
```

注意：

- 统一各分支返回的数据类型；
- 不要忘了写end;
- 养成写else子句的习惯。



# 二、应用

## 1. 将已有编号转换为新的方式并统计

![image-20240727074131012](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2Feeb264e8d816eb76e72a4e2613b0abbe-image-20240727074131012-218d1a.png)

按地区分类统计：

![image-20240727074213904](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2Fe7bf5ca80cdf2fbe3011cde1f2a6ebb0-image-20240727074213904-66eb75.png)

```
SELECT
case
	when pref_name = '德岛' OR pref_name = '香川' OR pref_name = '爱媛' OR pref_name = '高知' then '四国'
	when pref_name = '福冈' OR pref_name = '佐贺' OR pref_name = '长崎' then  '九州' 
	ELSE  '其他'
END
AS area_name, sum(population)
FROM poptbl
GROUP BY 
case
	when pref_name = '德岛' OR pref_name = '香川' OR pref_name = '爱媛' OR pref_name = '高知' then '四国'
	when pref_name = '福冈' OR pref_name = '佐贺' OR pref_name = '长崎' then  '九州' 
	ELSE  '其他'
END;
```

按人口数量分类统计：

![image-20240727074236881](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2Fead392a740387af08b00d877e6fbe3d3-image-20240727074236881-e98117.png)

```
SELECT 
case 
	when population <= 100 then '01'
	when population <= 200 then '02'
	when population <= 300 then '03'
	when population <= 400 then '04'
	ELSE '10'
END
AS pop_class, COUNT(pref_name) AS cnt
FROM poptbl
GROUP BY pop_class;
```

## 2. 用一条SQL语句进行多条件统计

![image-20240727074313905](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2Fa438f8b8f09a8200c97f17ac94890996-image-20240727074313905-358196.png)

按性别和地区统计：

![image-20240727074258044](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2F07679183b2ad2749db322ef1d5a5e13a-image-20240727074258044-0f34ba.png)

```
SELECT pref_name, 
SUM(case when sex = 1 then population ELSE 0 END ) AS cnt_m,
SUM(case when sex = 2 then population ELSE 0 END ) AS cnt_f
FROM poptbl2
GROUP BY pref_name
```

## 3. 在update语句里进行条件分支

更新工资

```
UPDATE salaries 
SET salary = (
	case 
		when salary >= 300000 then salary * 0.9
		when salary >= 250000 AND salary < 280000 then salary * 1.2
	ELSE salary end
)
```

主键值调换

```
UPDATE sometable
	SET p_key = (
		case
			when p_key = 'a' then 'b',
			when p_key = 'b' then 'a',
			ELSE p_key
		end
	)
WHERE p_key IN ('a', 'b')
```

## 4. 表之间的数据匹配

![image-20240727074514757](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2F81a16b8cdc5b26964cd406ac02feea8e-image-20240727074514757-8ab71e.png)

![image-20240727074525087](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2F0429d8a9c081ec1c89e6ddbf4407bbe0-image-20240727074525087-9b3c63.png)

生成两张表的交叉表

![image-20240727075519828](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2F60c0d3fa6bc098cc336f3dc0993ee70b-image-20240727075519828-a417d9.png)

### 使用IN谓词

```
SELECT course_name,
  CASE 
    WHEN course_id in 
    (SELECT course_id from opencourses WHERE `month` = 201806)
  THEN
      'O'
  ELSE
      'X'
  END AS '6月',
  CASE 
    WHEN course_id in 
    (SELECT course_id from opencourses WHERE `month` = 201807)
  THEN
      'O'
  ELSE
      'X'
  END AS '7月',
  CASE 
    WHEN course_id in 
    (SELECT course_id from opencourses WHERE `month` = 201808)
  THEN
      'O'
  ELSE
      'X'
  END AS '8月'
FROM coursemaster;

```

### 使用EXISTS谓词

```
SELECT CM.course_name,
  CASE 
    WHEN EXISTS 
    (
      SELECT course_id 
      from opencourses OC 
      WHERE `month` = 201806
      AND OC.course_id = CM.course_id
    )
  THEN
      'O'
  ELSE
      'X'
  END AS '6月',
  CASE 
    WHEN EXISTS 
    (
      SELECT course_id 
      from opencourses OC 
      WHERE `month` = 201807
      AND OC.course_id = CM.course_id
    )
  THEN
      'O'
  ELSE
      'X'
  END AS '7月',
  CASE 
    WHEN EXISTS 
    (
      SELECT course_id 
      from opencourses OC 
      WHERE `month` = 201808
      AND OC.course_id = CM.course_id
    )
  THEN
      'O'
  ELSE
      'X'
  END AS '8月'
FROM coursemaster CM;

```

## 5. 在case表达式中使用聚合函数

![image-20240727082313473](https://dawnstar-blog-1309734834.cos.ap-nanjing.myqcloud.com/img/2024%2F07%2F27%2F011ebcb78f6d8985d06721e1e65c4ddc-image-20240727082313473-3b62ad.png)

### 查询加入一个社团的学生和主社团

```
select std_id, max(club_id) as main_club
from studentclub
GROUP BY std_id
HAVING COUNT(std_id) = 1
```

### 查询加入多个社团的学生和主社团

```
select std_id, club_id as main_club
from studentclub
WHERE main_club_flg = 'Y'
```

### 使用CASE表达式

```
SELECT
  std_id,
CASE
    WHEN count( std_id ) = 1 THEN max( club_id ) 
    ELSE max( 
    CASE WHEN main_club_flg = 'Y' 
    THEN club_id ELSE NULL END ) 
END AS main_club 
FROM
  studentclub 
GROUP BY
  std_id
```

> 新手用having子句进行条件分支，高手用select子句进行条件分支
