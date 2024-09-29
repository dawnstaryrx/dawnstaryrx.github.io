+++
title = '[Leetcode1]双指针'
date = 2024-07-26T20:54:56+08:00
draft = false
tags = ['算法']

+++

# 1. 两数之和 II - 输入有序数组

[两数之和 II - 输入有序数组](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)

题目描述：在有序数组中找出两个数，使它们的和为 target。

使用双指针，一个指针指向值较小的元素，一个指针指向值较大的元素。指向较小元素的指针从头向尾遍历，指向较大元素的指针从尾向头遍历。

- 如果两个指针指向元素的和 sum == target，那么得到要求的结果；
- 如果 sum > target，移动较大的元素，使 sum 变小一些；
- 如果 sum < target，移动较小的元素，使 sum 变大一些。

数组中的元素最多遍历一次，时间复杂度为 O(N)。只使用了两个额外变量，空间复杂度为 O(1)。

```java
public static int[] twoSum(int[] numbers, int target) {
    int left = 1;
    int right = numbers.length;
    while (left < right) {
        int sum = numbers[left - 1] + numbers[right - 1];
        if (sum == target) {
            return new int[]{left, right};
        } else if (sum > target) {
            right--;
        } else {
            left++;
        }
    }
    return null;
}
```

# 2. 两数平方和

```java
public static boolean judgeSquareSum(int c) {
    long left = 0;//i和j平方和可能会出现越界，需要使用long类型去定义
    long right = (int)Math.sqrt(c)+1; 
    while (left <= right){
        if (left * left + right * right < c){
            left++;
        }else if (left * left + right * right > c){
            right--;
        }else {
            return true;
        }
    }
    return false;
}
```

# 3. 反转字符串中的元音字符

```java
public static String reverseVowels(String s) {
    char[] chars = s.toCharArray();
    int left = 0;
    int right = chars.length - 1;
    while (left < right) {
        while (!(chars[left] == 'a' || chars[left] == 'e' || chars[left] == 'i' || chars[left] == 'o' || chars[left] == 'u' || chars[left] == 'A' || chars[left] == 'E' || chars[left] == 'I' || chars[left] == 'O' || chars[left] == 'U')){
            left++;
            if (left >= right) {
                return String.valueOf(chars);
            }
        }
        while (!(chars[right] == 'a' || chars[right] == 'e' || chars[right] == 'i' || chars[right] == 'o' || chars[right] == 'u' || chars[right] == 'A' || chars[right] == 'E' || chars[right] == 'I' || chars[right] == 'O' || chars[right] == 'U')){
            right--;
            if (left >= right) {
                return String.valueOf(chars);
            }
        }
        char temp = chars[left];
        chars[left] = chars[right];
        chars[right] = temp;
        left++;
        right--;
    }
    return String.valueOf(chars);
}
```

# 4. 回文字符串

```java
public static boolean validPalindrome(String s) {
    char[] chars = s.toCharArray();
    int left = 0;
    int right = chars.length - 1;
    int count = 1;
    while (left < right){
        if (chars[left] == chars[right]){
            left++;
            right--;
            if (left >= right){
                return true;
            }
        }else {
            char[] chars1 = new char[chars.length - 1];
            // 去掉chars[left]
            for (int i = 0; i < left; i++){
                chars1[i] = chars[i];
            }
            for (int i = left; i < chars.length - 1; i++){
                chars1[i] = chars[i + 1];
            }
            boolean res1 = isPalindrome(chars1);
            char[] chars2 = new char[chars.length - 1];
            // 去掉chars[right]
            for (int i = 0; i < right; i++){
                chars2[i] = chars[i];
            }
            for (int i = right; i < chars.length - 1; i++){
                chars2[i] = chars[i + 1];
            }
            boolean res2 = isPalindrome(chars2);
            return res1 || res2;
        }
    }
    return false;
}

public static boolean isPalindrome(char[] chars) {
    int left = 0;
    int right = chars.length - 1;
    while (left < right) {
        if (chars[left] != chars[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
```

# 5. 归并两个有序数组

new了一个数组，最后再把这个数组遍历赋值给nums1

```java
public static void merge(int[] nums1, int m, int[] nums2, int n) {
    int i = 0;
    int j = 0;
    int[] res = new int[m + n];
    int k = 0;
    while (i < m && j < n) {
        if (nums1[i] <= nums2[j]) {
            res[k] = nums1[i];
            k++;
            i++;
        } else {
            res[k] = nums2[j];
            k++;
            j++;
        }
    }
    while (i < m){
        res[k] = nums1[i];
        k++;
        i++;
    }
    while (j < n){
        res[k] = nums2[j];
        k++;
        j++;
    }
    if (m + n >= 0) System.arraycopy(res, 0, nums1, 0, m + n);
}
```

# 6. 判断链表是否存在环

使用双指针，一个指针每次移动一个节点，一个指针每次移动两个节点，如果存在环，那么这两个指针一定会相遇。

```java
public boolean hasCycle(ListNode head) {
    if (head == null) {
        return false;
    }
    ListNode l1 = head, l2 = head.next;
    while (l1 != null && l2 != null && l2.next != null) {
        if (l1 == l2) {
            return true;
        }
        l1 = l1.next;
        l2 = l2.next.next;
    }
    return false;
}
```

# 7. 通过删除字母匹配到字典里最长单词

