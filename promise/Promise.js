//构造函数
function Promise(executor) {
    //添加属性
    this.promiseState = 'pending';
    this.promiseResult = null;
    //异步回调 保存属性
    this.callbacks = [];

    const self = this;
    //resolve 函数
    function resolve(data) {
        //判断状态
        if (self.promiseState !== 'pending') return;
        // 修改状态 (promiseState)
        self.promiseState = 'fulfilled';
        //  结果值 (promiseResult)
        self.promiseResult = data;
        //调用成功的回调

        //异步
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onResoled(data);
            });
        });

    }

    //reject 函数
    function reject(data) {
        //判断状态
        if (self.promiseState !== 'pending') return;
        // 修改状态 (promiseState)
        self.promiseState = 'rejected';
        //  结果值 (promiseResult)
        self.promiseResult = data;
        //调用成功的回调

        //异步
        setTimeout(() => {
            self.callbacks.forEach(item => {
                item.onRejected(data);
            });
        });

    }

    //同步调用
    try {
        executor(resolve, reject);
    } catch (e) {
        //状态为失败
        reject(e);
    }

}



Promise.prototype.then = function (onResoled, onRejected) {

    const self = this;


    //异常穿透
    if (typeof onRejected !== 'function') {
        onRejected = reason => {
            throw reason;
        }
    }


    //值传递
    if (typeof onResoled !== 'function') {
        onResoled = value => value;
    }


    //使用箭头函数 为外围的this
    return new Promise((resolve, reject) => {

        //抽取函数
        function callback(type) {
            //报错的情况
            try {
                //判断结果 函数内部直接调用
                let result = type(self.promiseResult);
                //如果是promise 对象
                if (result instanceof Promise) {
                    result.then(v => {
                        //返回自身成功
                        resolve(v);
                        //返回自身失败
                    }, r => {
                        reject(r);
                    });

                } else {
                    //状态直接为成功
                    resolve(result);
                }
            } catch (error) {
                //throw 抛出错误
                reject(r);

            }
        }



        //调用回调方法
        if (this.promiseState === 'fulfilled') {
            setTimeout(() => {
                callback(onResoled)

            });
        }
        if (this.promiseState === 'rejected') {

            setTimeout(() => {
                callback(onRejected)
            });

        }
        //保存回调函数
        if (this.promiseState === 'pending') {
            this.callbacks.push({
                //保存回调函数 成功结果
                onResoled: function () {

                    callback(onResoled)

                    //错误结果
                }, onRejected: function () {

                    callback(onRejected)

                }
            });
        }
    })

}


//catch 方法 
Promise.promiseState.catch = function (onRejected) {

    return this.then(undefined, onRejected);

}


//resolve 方法
Promise.resolve = function (value) {

    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then((result) => {
                resolve(result);
            }, (err) => {
                reject(err);
            });

        } else {
            resolve(value);
        }

    })

}

//resolve 方法
Promise.reject = function (value) {

    return new Promise((resolve, reject) => {
        reject(value);
    })
}

//all方法
Promise.all = function (promises) {

    return new Promise((resolve, reject) => {

        let count = 0;
        let arr = [];

        for (let i = 0; i < promises; i++) {
            promises[i].then(
                v => {
                    count++;
                    //成功结果存入
                    arr[i] = v;
                    if (count == promises.length) {
                        //修改状态
                        resolve(arr);
                    }
                },
                r => {
                    reject(r)
                }
            )
        }
    })
}

//race 方法
Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promise.length; i++) {
            promise[i].then(
                v => { resolve(v) },
                r => { reject(r) })
        }


    })

}

