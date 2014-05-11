schema.js
=========

转换JSON数据结构。

该模块最初是template.js的一部分，负责对来自后端的原始JSON数据进行标准化。在template.js的设计过程中，为了提高模板的可复用性，面临的最大问题就是：如何适配结构不同的JSON数据。Schema.js所做的，就是在一个架构模板的指导下，将后端数据转换为模板所使用的数据架构，实现一套模板多处使用。而剩下的工作，就是如何对架构模板进行管理了。

### 键对照表

键对照表通过一个简单的对照字典，重组原始数据。

    var data = [{ id : 1, title : 'title1' }, { id : 2, title : 'title2' }];
    var sch = { ID : 'id', TITLE : 'title' };
    var r = schema.convert(data, sch);
    // r = [{ID:1,TITLE:'title1'},{ID:2,TITLE:'title2'}]
    
可以通过一个多层的对照架构，将一个单层数据转换为复杂的多层数据。

    var data = { id : 1, title : 'title1', sub : { title : 'subtitle1' } };
    var sch = {
    	sub_title : 'sub.title',
    	level1 : {
    		title : 'title',
    		level2 : {
    			id : 'id'
    		}
    	}
    }
    var r = schema.convert(data, sch);
    r = {sub_title:'subtitle1',level1:{title:'title1',level2:{id:1}}} 

### 函数模板

    var data = { id : 1 };
    var sch = function(d){ return d.id; }
    var r = schema.convert(data, sch);
    // r = 1
    
### 架构模板

架构模板本身是个JS对象，有两个必须的键：key和schema。key负责从原始数据中提取值，形成新的数据传递给schema，schema通过各种类型设定，将这些值转为最终结果。

    var data = [
    	{ id : 1, title : 'title1', sub : { title : 'subtitle1' } },
    	{ id : 2, title : 'title2', sub : { title : 'subtitle2' } }
    ];
    var sch = {
    	ID : {
    		key : 'id',
    		schema : function(id){
    			return id;
    		}
    	},
    	TITLE : {
    		key : ['title', 'sub.title'],
    		schema : function(args){
    			return args.join('-');			
    		}
    	}
    };
    var r = schema.convert(data, sch);
    // r = [{ID:1,TITLE:'title1-subtitle1'},{ID:2,TITLE:'title2-subtitle2'}] 

