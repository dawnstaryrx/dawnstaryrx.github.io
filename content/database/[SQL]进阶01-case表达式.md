+++
title = "【SQL】进阶01 Case表达式"
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

```
-- 建表
CREATE TABLE PopTbl
(pref_name VARCHAR(32) PRIMARY KEY,
 population INTEGER NOT NULL);

INSERT INTO PopTbl VALUES('德岛', 100);
INSERT INTO PopTbl VALUES('香川', 200);
INSERT INTO PopTbl VALUES('爱媛', 150);
INSERT INTO PopTbl VALUES('高知', 200);
INSERT INTO PopTbl VALUES('福冈', 300);
INSERT INTO PopTbl VALUES('佐贺', 100);
INSERT INTO PopTbl VALUES('长崎', 200);
INSERT INTO PopTbl VALUES('东京', 400);
INSERT INTO PopTbl VALUES('群马', 50);
```

按地区分类统计：

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

```
CREATE TABLE PopTbl2
(pref_name VARCHAR(32),
 sex CHAR(1) NOT NULL,
 population INTEGER NOT NULL,
    PRIMARY KEY(pref_name, sex));

INSERT INTO PopTbl2 VALUES('德岛', '1',	60 );
INSERT INTO PopTbl2 VALUES('德岛', '2',	40 );
INSERT INTO PopTbl2 VALUES('香川', '1',	100);
INSERT INTO PopTbl2 VALUES('香川', '2',	100);
INSERT INTO PopTbl2 VALUES('爱媛', '1',	100);
INSERT INTO PopTbl2 VALUES('爱媛', '2',	50 );
INSERT INTO PopTbl2 VALUES('高知', '1',	100);
INSERT INTO PopTbl2 VALUES('高知', '2',	100);
INSERT INTO PopTbl2 VALUES('福冈', '1',	100);
INSERT INTO PopTbl2 VALUES('福冈', '2',	200);
INSERT INTO PopTbl2 VALUES('佐贺', '1',	20 );
INSERT INTO PopTbl2 VALUES('佐贺', '2',	80 );
INSERT INTO PopTbl2 VALUES('长崎', '1',	125);
INSERT INTO PopTbl2 VALUES('长崎', '2',	125);
INSERT INTO PopTbl2 VALUES('东京', '1',	250);
INSERT INTO PopTbl2 VALUES('东京', '2',	150);
```

按性别和地区统计：

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

