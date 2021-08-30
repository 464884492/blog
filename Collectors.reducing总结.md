## Collectors.reducing总结

### 1. 方法签名 一个参数

```java
public static <T> Collector<T, ?, Optional<T>> reducing(BinaryOperator<T> op)
```
参数说明

* BinaryOperator<T> op 归集操作函数 输入参数T返回T

测试代码

我们这里实现一个简单的求和功能，代码如下

```java
//author: herbert 公众号：小院不小 20210827
	@Test
	public void testReducingOne() {
		List<Integer> testData = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9);
		Optional<Integer> sum = testData.stream().collect(Collectors.reducing((prev, cur) -> {
			System.out.println("prev=>" + prev + "cur=>" + cur);
			return prev + cur;
		}));
		System.out.print(sum.get()); // 45 
	}
```
### 2. 方法签名 两个参数

```java
public static <T> Collector<T, ?, T> reducing(T identity, BinaryOperator<T> op)
```

参数说明

* T identity 返回类型T初始值
* BinaryOperator<T> op 归集操作函数 输入参数T返回T

测试代码

我们这里实现一个简单的求和并加上20功能，代码如下

```java
//author: herbert 公众号：小院不小 20210827
	@Test
	public void testReducingTwo() {
		List<Integer> testData = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9);
		Integer sum = testData.stream().collect(Collectors.reducing(20, (prev, cur) -> {
			System.out.println("prev=>" + prev + "cur=>" + cur);
			return prev + cur;
		}));
		System.out.print(sum); //65
	}
```

### 2. 方法签名 三个参数

```java
public static <T, U> Collector<T, ?, U> reducing(U identity,Function<? super T, ? extends U> mapper,BinaryOperator<U> op)
```
这个函数才是真正体现reducing(归集)的过程。调用者要明确知道以下三个点

1. 需要转换类型的初始值
2. 类型如何转换
3. 如何收集返回值

参数说明

+ U identity 最终返回类型U初始值
+ Function<? super T, ? extends U> mapper 将输入参数T转换成返回类型U的函数
+ BinaryOperator\<U\> op 归集操作函数 输入参数U返回U

测试代码 

我们这里实现一个简单数字转字符串并按逗号连接的功能，代码如下

```java
//author: herbert 公众号：小院不小 20210827
	@Test
	public void testReducingThree() {
		List<Integer> testData = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9);
		String joinStr = testData.stream().collect(Collectors.reducing("转换成字符串", in -> {
			return in + "";
		}, (perv, cur) -> {
			return perv + "," + cur;
		}));
		System.out.print(joinStr); // 转换成字符串,1,2,3,4,5,6,7,8,9
	}
```

### 4. 总结

这个知识点很小，但在没有彻底明白之前，对三个参数的调用特别糊涂。最主要的原因就是看到一堆 T R U 的泛型类型就不知道如何下手。欢迎大家关注我的公众号一起收集开发中遇到的点滴知识

![公众号](./images/gzh.png)