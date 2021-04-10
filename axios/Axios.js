//构造函数

function Axios(config) {
    //初始化
    this.defaults = config;

    this.intercepters = {

        request: new InterceptorManger(),
        reponse: new InterceptorManger(),

    }



}

//拦截器 类
function InterceptorManger() {
    this.handlers = [];
}




//CancelToken 构造函数
Axios.prototype.cancelToken = function (executor) {
    //声明变量
    let resolvePromise;

    this.promise = new Promise((resolve, reject) => {

        //引用
        resolvePromise = resolve;

    });

    //调用 executor 函数
    executor(function () {

        resolvePromise();
    });


}


/**
 * 拦截器 use 方法
 * @param {*} fulfilled 
 * @param {*} rejected 
 */
InterceptorManger.prototype.use = function (fulfilled, rejected) {
    this.handlers.push({ fulfilled, rejected });
}


/**
 *  请求往这里走------->>>>>>>
 * @param {*} config 
 * @returns 
 */
Axios.prototype.request = function (config) {

    // console.log("send----->" + config.method);
    //使用 成功的 promise 
    let promise = Promise.resolve(config);
    // chains 数组  为偶数
    let chains = [dispatchRequest, undefined];
    //请求拦截器 放入前面
    this.intercepters.request.handlers.forEach(item => {
        chains.unshift(item.fulfilled, item.rejected);

    });
    //响应 拦截器
    this.intercepters.reponse.handlers.forEach(item => {
        chains.push(item.fulfilled, item.rejected);

    });


    //拦截器 链式 调用
    while (chains.length > 0) {
        promise = promise.then(chains[0], chains[1]);
    }


    return promise;


}

/**
 *   分发器
 * @param {*} config 
 * @returns 
 */
function dispatchRequest(config) {

    return xhrAdapter(config).then(response => {
        return response;
    }, error => {
        throw error;
    });


}

/**
 *   适配器
 * @param {
 * } config 
 * @returns 
 */
function xhrAdapter(config) {


    return new Promise((resolve, reject) => {

        let xhr = new XMLHttpRequest();

        xhr.open(config.method, config.url);

        xhr.send();

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    //返回对象
                    resolve({
                        //配置对象
                        config: config,
                        //响应体
                        data: xhr.response,
                        //响应头
                        headers: xhr.getAllResponseHeaders(),
                        //请求对象
                        request: xhr,
                        //响应码
                        status: xhr.status,
                        //相应状态字符串
                        statusText: xhr.statusText
                    })
                } else {
                    reject(new Error('请求失败 失败的状态是' + xhr.status))
                }
            }

        }

        //取消请求
        if (config.cancelToken) {
            //调用 身上的promise 
            config.cancelToken.promise.then(value => {
                xhr.abort;

            });

        }

    })

}





//get请求
Axios.prototype.get = function (config) {

    return this.request({ method: 'GET' });

}

//post请求
Axios.prototype.post = function (config) {

    return this.request({ method: 'POST' });

}


//todo.........请求

/**
 *  初始化 
 * @param {*} config 
 * @returns 
 */
function createInstance(config) {

    let context = new Axios(config);

    // 使用 axios() 调用
    let instance = Axios.prototype.request.bind(context);

    //使用 axios.get() .post() 调用
    Object.keys(Axios.prototype).forEach(key => {

        instance[key] = Axios.prototype[key].bind(context);

    });


    //拦截器 默认配置
    Object.keys(context).forEach(key => {

        instance[key] = context[key];

    });

    return instance;

}


const axios = createInstance();

//直接暴露
window.axios = axios;