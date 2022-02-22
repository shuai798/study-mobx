import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import {makeAutoObservable} from 'mobx';
import {observer} from 'mobx-react';

/**
 * 1.初始化mobx容器仓库
 * 2.在组建中使用mobx容器状态
 * 3.在组件中发起action修改容器中的状态
 */

class Store {

    constructor() {
        makeAutoObservable(this)
    }

    count = 0

    increment = () => {
        debugger;
        this.count++
    }
}

@observer
class App extends React.Component {
    render() {
        const {store} = this.props;
        debugger;
        return (
            <div>
                <p>{store.count}</p>
                <p>
                    <button onClick={store.increment}>Increment</button>
                </p>
            </div>
        )
    }
}

ReactDOM.render(<App store={new Store()}/>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
