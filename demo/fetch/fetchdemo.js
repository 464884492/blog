let controller = new AbortController();
let signal = controller.signal;

let timeoutPromise = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
            // reject(new Error(''请求超时))
            controller.abort();
        }, timeout);
    });
}
let requestPromise = (url) => {
    return fetch(url, {
        signal: signal
    });
};
Promise.race([timeoutPromise(1000), requestPromise("https://www.baidu.com")])
    .then(resp => {
        console.log(resp);
    })
    .catch(error => {
        console.log(error);
    });