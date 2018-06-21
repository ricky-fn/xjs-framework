### 版本号：1.0.0

### 简介：
个人使用前端开发集成框架，集成了单页应用框架以及前端项目自动构建工具，适用于中小型项目的快速开发。

### API文档：
[link](https://a2604882741z.github.io/xjs-framework/)

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
2. 在当前路径下，在命令行里执行`npm install`载入依赖包再执行`npm install -g gulp`
3. 在命令行里执行：
```javascript
gulp //开始工作
```
4. 开发结束后执行一下命令，并从dev目录里获取发布版本
```javascript
gulp release //发布线上版本
```

### 任何疑问:
QQ: 3427495853<br>
mail: mr.jiangxue@hotmail.com
