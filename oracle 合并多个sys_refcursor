一、背景
---

在数据开发中，有时你需要合并两个动态游标`sys_refcursor`。

开发一个存储过程PROC\_A,这个过程业务逻辑相当复杂，代码篇幅较长。一段时间后要开发一个PROC\_B,要用PROC\_A同样的逻辑,而且在这个过程中，还要循环调用PROC\_A这个过程。摆在你面前的有两个选择。

+ 打开PL/SQL,仔细的读PROC\_A这个过程，一直到明白了所有的逻辑，然后在自己的过程中重写这个逻辑 。
+ 直接复制PROC\_A这个过的代码过来，多写极端。还是业界标准大法好
+ 针对循环调用的，建立一个临时表，循环插入数据到临时表（但这里还有一个问题，每次返回的游标可能列都不相同，建立临时表就显得复杂了）

好吧，这个新的过程是完成了，可是看上去，它更复杂了，代码量更大了。完全不能接受，必须改改！
这时，已经默默打开了ORACLE官方帮助文档 https://docs.oracle.com/cd/B19306_01/index.htm，寻找一个可行的办法，最终目标标是要解析，整合，合并 游标 sys_refcursor

二、思路
---
经过搜索查询，找到以下可行的方案
1. 序列化sys_refcursor为xml文档,ORACLE对xml支持还不错，12C已经有JSON格式了
2. 使用ORACLE xml解析的方法，对序列化的xml文档，添加、删除、修改
3. 转换为内存表，通过游标返回查询的结果

为此你需要掌握的知识有
+ 使用 Dbms_Lob 个package操作clob类型数据，因为解析后的游标可能用varchar2是装不下的，帮助地址  https://docs.oracle.com/cd/E11882_01/timesten.112/e21645/d_lob.htm#TTPLP600。
+ 重点掌握Oracle类型xmltype如何使用 https://docs.oracle.com/cd/B19306_01/appdev.102/b14258/t_xml.htm#BABHCHHJ
三、实现
---
从上边的帮助文档中，知道xmltype的构造函数中可以直接传入游标`xmltype(refcursor)`从而得到一个xmltype，调用xmltype的`getClobVal`方法，可得到序列化的结果，所以它的结构是这样的

```xml
<?xml version="1.0"?>
<ROWSET>
  <ROW>
    <COLUMNNAME1></COLUMNNAME1>
    <COLUMNNAME2></COLUMNNAME2>
    <...>...</...>
  </ROW>
  ....
</ROWSET>
```

所以，如果需要合并两个数据列相同游标，只需要提取DOM中的ROW节点数据保存到定义的clob字段中去。

提取dom中片段，采用标准的xpath语法，`/ROWSET/ROW `这里提取ROW信息

```sql
Declare
  x        xmltype;
  rowxml   clob;
  mergeXml clob;
  ref_cur  Sys_Refcursor;
  ref_cur2 Sys_Refcursor;
  ref_cur3 Sys_Refcursor;
begin
  open ref_cur for
    select F_USERNAME, F_USERCODE, F_USERID
      from Tb_System_User
     where F_userid = 1;
  Dbms_Lob.createtemporary(mergeXml, true);
  Dbms_Lob.writeappend(mergeXml, 8, '<ROWSET>');
  x := xmltype(ref_cur);
  Dbms_Output.put_line('=====完整的REFCURSOR结构=====');
  Dbms_Output.put_line(x.getClobVal());
  Dbms_Output.put_line('=====只提取行信息=====');
  rowxml := x.extract('/ROWSET/ROW').getClobVal(0, 0);
  Dbms_Output.put_line(rowxml);
  Dbms_Lob.append(mergeXml, rowxml);ROWSET
  open ref_cur2 for
    select F_USERNAME, F_USERCODE, F_USERID
      from Tb_System_User
     where F_userid = 1000;
  x      := xmltype(ref_cur2);
  rowxml := x.extract('/ROWSET/ROW').getClobVal(0, 0);
  Dbms_Lob.append(mergeXml, rowxml);
  Dbms_Lob.writeappend(mergeXml, 9, '</ROWSET>');
  Dbms_Output.put_line('=====合并后的信息=====');
  Dbms_Output.put_line(mergeXml);
end;
```
执行这段代码输出的结果是这样的
```xml
=====完整的REFCURSOR结构=====
<?xml version="1.0"?>
<ROWSET>
 <ROW>
  <F_USERNAME>系统管理员</F_USERNAME>
  <F_USERCODE>admin</F_USERCODE>
  <F_USERID>1</F_USERID>
 </ROW>
</ROWSET>

=====只提取行信息=====
<ROW>
<F_USERNAME>系统管理员</F_USERNAME>
<F_USERCODE>admin</F_USERCODE>
<F_USERID>1</F_USERID>
</ROW>

=====合并后的信息=====
<ROWSET><ROW>
<F_USERNAME>系统管理员</F_USERNAME>
<F_USERCODE>admin</F_USERCODE>
<F_USERID>1</F_USERID>
</ROW>
<ROW>
<F_USERNAME>黄燕</F_USERNAME>
<F_USERCODE>HUANGYAN</F_USERCODE>
<F_USERID>1000</F_USERID>
</ROW>
</ROWSET>

```

从上边打印的结果看，我们已经成功的将两个游标 `ref_cur  `和`ref_cur2  `中我们需要的列信息合并到了一个xml文档中。那么接下了，我们就需要通过解析这个xml并返回一个新的`sys_refcursor`,这里你有必要了解以下oracle `xmltable`的用法(https://docs.oracle.com/cd/B19306_01/server.102/b14200/functions228.htm)接上边代码

```sql
Dbms_Output.put_line(mergeXml);
open ref_cur3 for
    select *
      from xmltable('/ROWSET/ROW' Passing xmltype(mergeXml) Columns
                    F_USERNAME varchar2(100) path 'F_USERNAME',
                    F_USERCODE varchar2(100) path 'F_USERCODE');
```

简单说明下`xmltable`构造函数
+ 声明xpath，指明你需要解析的dom在哪里，比如从根找到ROW `/ROWSET/ROW`
+ 指明你要查询的xmltype
+ 定义转换列，比如把ROW下边的F\_USERNAME这个节点值，映射到游标列F\_USERNAME 这个列中


四、总结
---
xml作为早期数据传输，序列化和反序列化的文件格式，在oracle中也有良好的支持。所以，对于基于语言之上的知识，各个语言实现方式基本相识。基础终究是重要的。



