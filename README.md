### 版本号：1.0.0

### 简介：
基于MVC的理念构建的一个前端单页应用框架，追求轻巧、快速、可复用、不脱离原生写法的前端框架。
目前angular、react等流行的前端框架，虽然功能强大但有几个明显的缺陷：
1. 在JS以及HTML中创建了非常多用于双向绑定的语法，过于抽象并且脱离了原生JS的一些基本逻辑，导致许多前端工程师需要花费大量时间去学习和理解。
2. 强调双向数据绑定导致了代码的调试非常麻烦。
3. API变化太快，例如angular v1.0 和 v2.0根本就是两个框架，这对于花费大量时间学会了angular v1.0的人来说绝对是噩梦。

所以本着学习和研究的目的以及更加稳定可靠 在借鉴了这些框架的优点后 构建了一套前端框架，力求根据公司业务灵活的调整、快速开发、简单上手。

### 目录分类：
	dev/ 前端自动构建工具生成文件夹，存储编译过后的文件
	src/ 前端资源文件夹
		icons/ 图标
		images/ 公用图片
		pages/ html模板
		sass/ CSS
		js/ 脚本
			lib/ 底层依赖插件
			plugin/ 业务插件
			core/ 核心模块
				engine.js 底层框架核心
				route.js 路由模块
				watch.js 数据监听模块
				widget.js Model基类
			app.js 项目入口文件
			router.js 路由定义模块

### 前端开发环境配置：
1. 安装Nodejs
2. 在当前路径下，在命令行里执行npm install载入依赖包
3. 在命令行里执行：
```javascript
gulp //开始工作
```
4. 开发结束后执行一下命令，并从dev目录里获取发布版本
```javascript
gulp release //发布线上版本
```

### API文档：
文档根据jsdoc的规则编写，请执行docs/index.html获取api信息。
当更新了js备注后，在命令行里执行下面的命令更新文档
```javascript
gulp apidoc
```

### 任何疑问：
QQ: 3427495853
mail: mr.jiangxue@hotmail.com