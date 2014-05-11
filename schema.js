/*
 * Apache License Version 2.0
 * schema.js
 * version 1.1
 * 
 * by MK
 * email: mk31415926535@gmail.com
 * blog: mkjs.net
 *
 * */

(function(w){
	/*
	 * 类型判断
	 * */
	function isType(v, t){ return Object.prototype.toString.call(v) == '[object ' + t + ']'; }
	function isObject(v){ return isType(v, 'Object'); }
	function isString(v){ return typeof(v) == 'string'; }
	function isArray(v){ return isType(v, 'Array'); }
	/*
	 * 元素全为字符串的数组
	 * */
	function isStringArray(v){ return isArray(v) && EVERY(v, isString); }
	function isFunction(v){ return typeof(v) == 'function'; }
	/*
	 * 架构对象
	 * 应包含 key 和 schema 两个键
	 * */
	function isSchema(v){ return isObject(v) && (isString(v.key) || isObject(v.key) || isStringArray(v.key)) && (isObject(v.schema) || isFunction(v.schema)); }

	/*
	 * 遍历对象
	 * @o 目标对象
	 * @m 回调函数。当该函数返回true时，遍历循环终止。
	 * */
	function each(o, m){
		for(var p in o)
			if(m(o[p], p, o))
				return;
	}

	/*
	 * 遍历数组
	 * @a 目标数组
	 * @m 回调函数。当该函数返回true时，遍历循环终止。
	 * */
	function EACH(a, m){
		var i = 0, len = a.length;
		while(i < len){
			if(m(a[i], i, a))
				return;
			i++;
		}
	}

	/*
	 * 数组的every函数
	 * */i
	function EVERY(a, m){
		var i = 0, len = a.length;
		while(i < len){
			if(!m(a[i], i, a))
				return false;
			i++;
		}
		return true;
	}

	/*
	 * 在ctx中查找ns域值
	 * @ns namespace字符串
	 * @ctx 上下文对象
	 * */
	function domain(ns, ctx){
		if(!ctx) return;
		var i = ns.indexOf('.');
		return i < 0
			? ctx[ns]
			: domain(ns.substr(i + 1), ctx[ns.substr(0, i)]);
	}

	/*
	 * 转换JSON数据
	 * @data 原始数据
	 * @schema 转换架构
	 * @index 所在数组的索引
	 * */
	function convert(data, schema, index){
		if(isFunction(schema)){
			return schema(data, index);
		} else if(isString(schema)){
			return domain(schema, data);
		} else if(isSchema(schema)){
			var d;
			if(isArray(schema.key)){
				d = [];
				EACH(schema.key, function(k){
					d.push(domain(k, data));
				});
			} else if(isObject(schema.key)) {
				d = convert(data, schema.key);
			} else {
				d = domain(schema.key, data);
			}
			return convert(d, schema.schema, index);
		} else if(isObject(schema)){
			if(isObject(data)){
				var target = {};
				each(schema, function(v, p){
					target[p] = convert(data, v);
				});
				return target;
			} else if(isArray(data)){
				var target = [];
				EACH(data, function(v, i){
					target.push(convert(v, schema, i));
				});
				return target;
			}
		}
		return null;
	}

	/*
	 * 将JS对象格式化为字符串
	 * @o 目标变量
	 * @indent 缩进层级
	 * @ind 缩进字符串，默认为1个指标符
	 * @noformat 不格式化。当该参数为true时，将不插入任何换行或制表符。
	 * */
	function obj2str(o, indent, ind, noformat){
		indent = (indent || 0);
		noformat = !!noformat;

		var line;
		if(!!noformat){
			line = ind = '';
		} else {
			line = '\n';
			ind = ind || '\t';
		}
		var inds = Array(indent + 2).join(ind);
		if(o === null){
			return 'null';
		} else if(typeof(o) == 'undefined'){
			return 'undefined';
		} else if(isObject(o)){
			var s = '{' + line;
			each(o, function(v, p){
				s += inds + p + ':' + obj2str(v, indent + 1, ind, noformat) + ',' + line;
			});
			s = s.replace(/,+\s?$/, line);
			s += Array(indent + 1).join(ind) + '}';
			return s;

		} else if(isArray(o)){
			var s = '[' + line;
			EACH(o, function(v){
				s += inds + obj2str(v, indent + 1, ind, noformat) + ',' + line;
			});
			s = s.replace(/,+\s?$/, line);
			s += Array(indent + 1).join(ind) + ']';
			return s;
		} else {
			if(isString(o)){
				return "'" + o.replace(/'/g, '\\\'').replace('\r', '\\r').replace('\n', '\\n') + "'";
			} else {
				return o + '';
			}
		}
	}
		
	var schema = {
		convert : convert,
		obj2str : obj2str
	}

	if(isFunction(w.define)){
		w.define(schema);
	} else {
		w.schema = schema;
	}

})(window);

			
