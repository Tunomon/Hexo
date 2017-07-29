---
title: Redux初步学习
date: 2017-07-30 00:37:17
tags:Redux
---

# Redux初步学习

[TOC]

## 一、初步概念

Redux 是用来进行React 数据流管理的架构，进行状态管理，管理整个应用的State。

- State
  state是应用的状态。

- Action
  action（动作）实质上是包含 type 属性的普通对象，这个 type 是我们实现用户行为追踪的关键。action就是一个描述发生什么的对象。    

- Reducer

  reducer 的实质是一个函数，根据 action.type 来更新 state 并返回 nextState

  最后会用 reducer 的返回值 nextState 完全替换掉原来的 state 。

- Store

```
store 是应用状态 state 的管理者，负责把他们联系在一起，Store 有以下职责：
```

```
- 维持应用的 state；
- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。
```



## 二、三大基本原则

1. **单一数据源**

   整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。

2. **State是只读的**

   唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。利用dispatch方法触发。

3. **使用纯函数（Reducers）进行修改**

   为了描述 action 如何改变 state tree ，需要编写 reducers。Reducer 只是一些纯函数，它接收先前的 state 和 action，并返回新的 state。

> 注意事项：1. Reducer不允许直接更改State.
>
> 2.Redux 规定，一个应用只应有一个单一的 store，其管理着唯一的应用状态 state。应用中所有的 state 都以一个对象树的形式储存在一个单一的 *store* 中。
>
> 3.Redux 还规定，不能直接修改应用的状态 state



## 三、Redux中数据流向

**严格的单向数据流**是 Redux 架构的设计核心。

Redux 应用中数据的生命周期遵循下面 4 个步骤：

1. **调用** `store.dispatch(action)`。

   [Action](http://cn.redux.js.org/docs/basics/Actions.html) 就是一个描述“发生了什么”的普通对象。比如：

   ```jsx
    { type: 'LIKE_ARTICLE', articleId: 42 };
    { type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } };
    { type: 'ADD_TODO', text: 'Read the Redux docs.'};
   ```

2. **Redux store 调用传入的 reducer 函数。**

   Store 会把两个参数传入 reduce： 当前的 state 树和 action。

   reducer 是纯函数,仅仅用于计算下一个 state。它应该是完全可预测的：多次传入相同的输入必须产生相同的输出。

3. **根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。**

   Redux可以有一个根 reducer。Redux 原生提供`combineReducers()`辅助函数，来把根 reducer 拆分成多个函数，用于分别处理 state 树的一个分支。根reducer调用多个子 reducer 分别处理 state 中的一部分数据，然后再把这些数据合成一个大的单一对象。

   注意每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据。

   例如：

   ```jsx
   const initState =  {
     visibilityFilter : 'SHOW_ALL',
     todos : [{text:'这是一个初始化状态', completed:false, index: 0}]
   }

   function todos(state = [], action) {
      // 省略处理逻辑...
      return nextState;
    }

    function visibleTodoFilter(state = 'SHOW_ALL', action) {
      // 省略处理逻辑...
      return nextState;
    }

    const todoApp = combineReducers({
      todos,
      visibleTodoFilter
    })
    export default todoApp;
    // 上下两处写法完全等价
    export default function todoApp(state = {}, action) {
     return {
       visibilityFilter: visibilityFilter(state.visibilityFilter, action),
       todos: todos(state.todos, action)
     }
   }
   ```

   当你触发 action 后，`combineReducers` 返回的 `todoApp` 会负责调用两个 reducer：

   ```js
   let nextTodos = todos(state.todos, action);
   let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action);
   ```

   然后会把两个结果集合并成一个 state 树：

   ```js
   return {
      todos: nextTodos,
      visibleTodoFilter: nextVisibleTodoFilter
   };
   ```

4. **Redux store 保存了根 reducer 返回的完整 state 树。**

   这个新的树就是应用的下一个 state。

## 四、容器组件与展示组件

容器组件仅仅做数据提取，然后渲染对应的子组件.展示组件与容器组件分离，就有重用性高等优势。

TodoList是 UI 组件，VisibleTodoList就是由 React-Redux 通过connect方法自动生成的容器组件。

举个例子：

```js
//未区分容器和展示组件：
// CommentList.js
class CommentList extends React.Component {
  constructor() {
    super();
    this.state = { comments: [] }
  }
  componentDidMount() {
    $.ajax({
      url: "/my-comments.json",
      dataType: 'json',
      success: function(comments) {
        this.setState({comments: comments});
      }.bind(this)
    });
  }
  render() {
    return <ul> {this.state.comments.map(renderComment)} </ul>;
  }
  renderComment({body, author}) {
    return <li>{body}—{author}</li>;
  }
}






//区分的情况下
//容器组件
class CommentListContainer extends React.Component {
  constructor() {
    super();
    this.state = { comments: [] }
  }
  componentDidMount() {
    $.ajax({
      url: "/my-comments.json",
      dataType: 'json',
      success: function(comments) {
        this.setState({comments: comments});
      }.bind(this)
    });
  }
  render() {
    return <CommentList comments={this.state.comments} />;
  }
}


// CommentList.js展示组件
class CommentList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() { 
    return <ul> {this.props.comments.map(renderComment)} </ul>;
  }
  renderComment({body, author}) {
    return <li>{body}—{author}</li>;
  }
}
```

在React-Redux这个Redux 作者封装的 React 专用的库中有两个方法：

1. `mapStateToProps` 这个函数来指定如何把当前 Redux store state 映射到展示组件的 props 中。这个函数的主要功能是将`state`通过`props`属性传递给UI组件，它会订阅 Store，每当state更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。mapStateToProps函数返回一个对象，这个对象中的每一个键值对都会映射到UI组件的`props`上。

2. mapDispatchToProps是connect函数的第二个参数，用来建立 UI 组件的参数到store.dispatch方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。

   如果mapDispatchToProps是一个函数，会得到dispatch和ownProps（容器组件的props对象）两个参数，应该返回一个对象，该对象的每个键值对都是一个映射，定义了 UI 组件的参数怎样发出 Action。

   如果mapDispatchToProps是一个对象，它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，返回的 Action 会由 Redux 自动发出。

容器组件使用 connect() 方法连接 Redux，

|            | 展示组件           | 容器组件               |
| ---------- | -------------- | ------------------ |
| 作用         | 描述如何展现（骨架、样式）  | 描述如何运行（数据获取、状态更新）  |
| 直接使用 Redux | 否              | 是                  |
| 数据来源       | props          | 监听 Redux state     |
| 数据修改       | 从 props 调用回调函数 | 向 Redux 派发 actions |
| 调用方式       | 手动             | 通常由 React Redux 生成 |



> 参考文档:
>
> [Redux中文文档](http://cn.redux.js.org/docs/introduction/index.html)
>
> [React 之容器组件和展示组件相分离](https://segmentfault.com/a/1190000006845396)
>
> [Redux 入门教程（三）：React-Redux 的用法](https://yq.aliyun.com/articles/64906)
>
> [React-Redux-API中文](http://cn.redux.js.org/docs/react-redux/api.html)
>
> [原版Redux英文文档](http://redux.js.org/)

