###背景
   在处理网页中的表格导出Excel时，表格的多表头需要具体的位置。而网页中的多表头，都是采用 colspan 和 rowspan 表示。因为我在平常开发中多使用easyui，所以我代码中的headrows是遵循easyuidatagrid的定义方式，采用二维数组表示多表头。
###思路
- 根据属性 `colspan` 得到单元格相对于当前行的相对位置 **X** ，后一行的位置等于 `prevRow.X +prevRow.colspan`
- 根据属性 `rowspan` 计算跨行导致，纠正某些单元格被覆盖的情况,既 **X** 相等的单元格 ，需要向后移动当前单元格的 `colspan` 个单位。

###原始表格
<table width=550 ><tbody><tr><td colspan=3>A(0,0)</td><td rowspan=3>B(3,0)</td><td rowspan=2 colspan=2>C(4,0)</td><td>D(6,0)</td></tr><tr><td colspan=2>E</td><td rowspan=2>F</td><td>G</td></tr><tr><td>H</td><td>I</td><td>J</td><td>K</td><td>L</td></tr></tbody></table>
###根据`colspan`计算相对位置 `x` `Y` 
  根据原始表格可知，当前**3X7**的表格，x坐标的取值范围【0~6】y的取值范围【0~2】，经过第一次计算，得到如下表格
<table  width=550><tr><td>(0,0)**A**</td><td>(1,0)</td><td>(2,0)</td><td>(3,0)**B**</td><td>(4,0)**C**</td><td>(5,0)</td><td>(6,0)**D**</td></tr><tr><td>(0,1)**E**</td><td>(1,1)</td><td>(2,1)**F**</td><td>(3,1)**G**</td><td>(4,1)</td><td>(5,1)</td><td>(6,1)</td></tr><tr><td>(0,2)**H**</td><td>(1,2)**I**</td><td>(2,2)**J**</td><td>(3,2)**K**</td><td>(4,2)**L**</td><td>(5,2)</td><td>(6,2)</td></tr></table>
同原始表格个对比，得到如下结果
- 第二行，**G**列位置本来应该是**(5,1)**，结果经过第一计算,它跑到了**（3,1）**这个位置
- 第三行，** J K L **三列的位置都分别提前了2个单位。

造成位置提前的原因，主要就是`rowspan`,跨列导致。
- 第二行 G 的位置提前，受第一行 B C存在行合并
- 第三行 J K L 位置提前，受到 第一行 B 第二行 F 存在行合并

由此可知行合并影响的的行，受 `rowspan` 的跨度确定，即需要移动的单元个需满足两个条件 
1. 移动单元格 存在 `rowspan` 单元格的后边 `cur.pos.x>=nextcur.pos.x`
2. 移动单元格 两个单元格的Y之差，小于合并行的跨度， `nextcur.pos.y-cur.pos.y<cur.rowspan` 

###根据`rowspan`计算正确的 X
  知道计算逻辑后，还有一个需要注意的地方，行遍历需要从**最后一行开始**遍历。因为在第一行 **B**这一列这种情况。
- B 在第一次计算后，在当前行的位置X=3
- 与之后边的行中X=3的列分别是第二列的 G 和第三列的 K，而我们想要与之对应的 J

这主要是因为，在第二行的F 列存在行合并，导致 J 的位置提前了。所以，如果从正向开始遍历，J这列的位置 X 始终少了一个单位。
```javascript
 // author:Herbert 
 // QQ:464884492
 function (headRows) {
            var findFieldRows = void 0;
            //计算同一行x的位置
            headRows.forEach(function (rowCols, y) {
                var nextPosx = 0;
                rowCols.forEach(function (col, x) {
                    col.pos = {};
                    col.pos.x = nextPosx;
                    col.pos.y = y;
                    col.colspan = col.colspan || 1;
                    nextPosx = nextPosx + col.colspan;
                });
            });
            //计算 rowspan对后边行的影响
            for (var rowIndex = headRows.length - 1; rowIndex >= 0; rowIndex--) {
                var curRow = headRows[rowIndex];
                for (var cellIndex = 0; cellIndex < curRow.length; cellIndex++) {
                    var curCell = curRow[cellIndex];
                    console.log("正在处理的行：=》", curCell);
                    curCell.rowspan = curCell.rowspan || 1;
                    if (curCell.rowspan > 1) {
                        //将后边行中所有与当前cell相同位置的单元格依次后移当前单元格x相等的单元格后移当前单元格clospan个单位
                        //当前行影响下一行
                        for (var nextRowindex = rowIndex + 1; nextRowindex < headRows.length && curCell.rowspan > nextRowindex - rowIndex; nextRowindex++) {
                            //判断是否存在合并信息
                            var nextRow = headRows[nextRowindex];
                            for (var nextCellIndex = 0; nextCellIndex < nextRow.length; nextCellIndex++) {
                                var nextCell = nextRow[nextCellIndex];
                                if (nextCell.pos.x >= curCell.pos.x) {
                                    nextCell.pos.x += curCell.colspan;
                                    console.log("需要移动的列：=》", nextCell);
                                }
                            }
                        }
                    }
                }
        }
    }
```
###测试结果：

1.  rowspan 移动过程
正在处理的行：=》 { title: 'H', pos: { x: 0, y: 2 }, colspan: 1 }
正在处理的行：=》 { title: 'I', pos: { x: 1, y: 2 }, colspan: 1 }
正在处理的行：=》 { title: 'J', pos: { x: 2, y: 2 }, colspan: 1 }
正在处理的行：=》 { title: 'K', pos: { x: 3, y: 2 }, colspan: 1 }
正在处理的行：=》 { title: 'L', pos: { x: 4, y: 2 }, colspan: 1 }
正在处理的行：=》 { title: 'E', colspan: 2, pos: { x: 0, y: 1 } }
正在处理的行：=》 { title: 'F', rowspan: 2, pos: { x: 2, y: 1 }, colspan: 1 }
需要移动的列：=》 { title: 'J', pos: { x: 3, y: 2 }, colspan: 1, rowspan: 1 }
需要移动的列：=》 { title: 'K', pos: { x: 4, y: 2 }, colspan: 1, rowspan: 1 }
需要移动的列：=》 { title: 'L', pos: { x: 5, y: 2 }, colspan: 1, rowspan: 1 }
正在处理的行：=》 { title: 'G', pos: { x: 3, y: 1 }, colspan: 1 }
正在处理的行：=》 { title: 'A', colspan: 3, pos: { x: 0, y: 0 } }
正在处理的行：=》 { title: 'B', rowspan: 3, pos: { x: 3, y: 0 }, colspan: 1 }
需要移动的列：=》 { title: 'G', pos: { x: 4, y: 1 }, colspan: 1, rowspan: 1 }
需要移动的列：=》 { title: 'J', pos: { x: 4, y: 2 }, colspan: 1, rowspan: 1 }
需要移动的列：=》 { title: 'K', pos: { x: 5, y: 2 }, colspan: 1, rowspan: 1 }
需要移动的列：=》 { title: 'L', pos: { x: 6, y: 2 }, colspan: 1, rowspan: 1 }
正在处理的行：=》 { title: 'C', rowspan: 2, colspan: 2, pos: { x: 4, y: 0 } }
需要移动的列：=》 { title: 'G', pos: { x: 6, y: 1 }, colspan: 1, rowspan: 1 }
正在处理的行：=》 { title: 'D', pos: { x: 6, y: 0 }, colspan: 1 }

2. 移动完成后效果
当前列： {"title":"A","colspan":3,"pos":{"x":0,"y":0},"rowspan":1}
当前列： {"title":"B","rowspan":3,"pos":{"x":3,"y":0},"colspan":1}
当前列： {"title":"C","rowspan":2,"colspan":2,"pos":{"x":4,"y":0}}
当前列： {"title":"D","pos":{"x":6,"y":0},"colspan":1,"rowspan":1}
当前列： {"title":"E","colspan":2,"pos":{"x":0,"y":1},"rowspan":1}
当前列： {"title":"F","rowspan":2,"pos":{"x":2,"y":1},"colspan":1}
当前列： {"title":"G","pos":{"x":6,"y":1},"colspan":1,"rowspan":1}
当前列： {"title":"H","pos":{"x":0,"y":2},"colspan":1,"rowspan":1}
当前列： {"title":"I","pos":{"x":1,"y":2},"colspan":1,"rowspan":1}
当前列： {"title":"J","pos":{"x":4,"y":2},"colspan":1,"rowspan":1}
当前列： {"title":"K","pos":{"x":5,"y":2},"colspan":1,"rowspan":1}
当前列： {"title":"L","pos":{"x":6,"y":2},"colspan":1,"rowspan":1}