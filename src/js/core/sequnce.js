import axios from "axios";

function dataQueue(queue) {
    queue = queue instanceof Array ? queue : [queue];

    let data = {
        length: queue.length
    };
    let times = 0;

    return new Promise((resolve, reject) => {
        postRequest(queue, data, resolve, reject, times);
    })
}

function postRequest(queue, data, resolve, reject, times) {
    let params = [];
    let args = [].slice.call(arguments);
    queue.forEach(element => {
        params.push(axios(element).catch(error => {
            if (times > 2) {
                return reject(error);
            } else {
                times += 1;
            }
            queue = [error.config];
            args.shift() && args.pop();
            args.unshift(queue) && args.push(times);
            postRequest.apply(null, args);
        }));
    });

    axios.all(params)
        .then(axios.spread(function() {
            let result = [].slice.call(arguments);
            result.forEach(element => {
                if (element !== undefined) {
                    insertRes(data, element);
                }
            });
            if (Object.keys(data).length == data.length + 1) {
                resolve(data);
            }
        }));
}

function insertRes(data, result) {
    data[result.config.app] = result.data;
}

export default dataQueue;