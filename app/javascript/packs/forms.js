export default function send_request(url, method, body = {}, headers = {}) {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
    headers["Authorization"] = localStorage.getItem("Authorization");
    let bd = null;
    let ur = url;
    console.log("METHOD:  ", method, "body: ", JSON.stringify(body));
    if (method === "GET" && Object.keys(body).length > 0) {
        ur += "?";
        Object.entries(body).forEach(([key, val]) => {
            ur += key + "=" + val + "&";
            console.log("UR: " + ur);
        });
        ur = ur.substr(0, ur.lastIndexOf("&"));
    } else {
        bd = JSON.stringify(body);
    }
    console.log("URL " + url);
    return new Promise((resolve, reject) => {
        let pr;
        if (method === "GET") {
            pr = fetch(ur, {
                method: method.toUpperCase(),
                headers: headers
            });
        } else {
            pr = fetch(url, {
                method: method.toUpperCase(),
                body: bd,
                headers: headers
            })
        }
        pr.then(res => {
            res.json().then(json => {
                if (res.status === 200 || res.status === 201) {
                    return resolve(json);
                } else {
                    return reject({status: res.status, json: json});
                }
            })
        })
    });
}

function send_ajax(url, form, success, fail) {
    const data = new FormData(form);

    const val = Object.fromEntries(data.entries());
    send_request(url, form.getAttribute("method"), val).then(json => {
        success(json);
    }, (err) => {
        fail(err.json["error"]);
    });
}

function add_error_to_input(name) {
    const fields = document.getElementsByName(name);
    if (fields) {
        for (let i = 0; i < fields.length; ++i) {
            const field = fields[i];
            if (field) {
                field.classList.add("input-errored");
            }
        }
    }
}

function reset_input_states(names = []) {
    for (let i = 0; i < names.length; ++i) {
        const fields = document.getElementsByName(names[i]);
        if (fields) {

            for (let j = 0; j < fields.length; ++j) {
                const field = fields[j];
                if (field) {
                    field.classList.remove("input-errored");
                }
            }
        }
    }
}

const reg = document.getElementById("register-form");
const login = document.getElementById("login-form");
if (reg) {
    console.log("REG FOUNDED");
    reg.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        reset_input_states(["login", "password"]);
        send_ajax("/v1/user/register", event.target,
            function (data) {
                localStorage.setItem("Authorization", data["token"]);
                localStorage.setItem("user_id", data["id"]);
                window.open("/v1/message", "_self");
            },
            function (data) {
                const obj = translate_error_message(data);
                switch (obj.flag) {
                    case 0:
                        add_error_to_input("password");
                        show_error_modal(obj.text);
                        break;
                    case 1:
                        show_error_modal(obj.text);
                        add_error_to_input("login");
                        break;
                    case -1:
                        show_error_modal("Неизсветная ошибка");
                        break;
                }
            }
        );
    }, false);

}


if (login) {
    login.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        reset_input_states(["login", "password"]);
        send_ajax("/v1/user/login", event.target,
            function (data) {
                localStorage.setItem("Authorization", data["token"]);
                localStorage.setItem("user_id", data["id"]);
                window.open("/v1/message", "_self");
            },
            function (data) {
                const obj = translate_error_message(data);
                switch (obj.flag) {
                    case 0:
                        add_error_to_input("password");
                        show_error_modal(obj.text);
                        break;
                    case 1:
                        add_error_to_input("login");
                        show_error_modal(obj.text);
                        break;
                    case -1:
                        show_error_modal(obj.text);
                        break;

                }
            }
        );
    }, false);
}


function show_error_modal(message) {
    let element = document.createElement("div");
    element.classList.add("error-div");
    element.innerText = message;
    document.body.appendChild(element);
    setTimeout(() => {
        requestAnimationFrame(() => {
            element.classList.add("error-div-out");
        });
        setTimeout(() => {
            document.body.removeChild(element);
        }, 2000);
    }, 5000);

}

function translate_error_message(message) {
    console.log("Proceed error: " + message);
    if (message.startsWith('["Password is too long')) {
        return {text: "Пароль не должен превышать 16 символов", flag: 0};
    }
    if (message.startsWith('["Password is too short')) {
        return {text: "Пароль должен быть не менее 3 символов", flag: 0};
    }
    if (message.startsWith("Login already used")) {
        return {text: "Данное имя пользователя уже используется.", flag: 1};
    }
    if (message.startsWith("Password is incorrect")) {
        return {text: "Неверный пароль", flag: 0}
    }
    if (message.startsWith("User is not found")) {
        return {text: "Пользователь с таким логином не найден.", flag: 1};
    }
    return {text: "", flag: -1}
}
