import consumer from "../channels/consumer";
import send_request from "./forms";

const el = document.getElementById("messages-body");
let total;
consumer.subscriptions.create({channel: "ChatChannel", token: localStorage.getItem("Authorization")}, {
    received(data) {
        el.insertAdjacentHTML("beforeend", print_message(data.message));
        el.scrollTop = el.scrollHeight;
    },
    connected() {
        send_request("/v1/message/list", "GET")
            .then((resp) => {
                print_messages(resp['messages'])
                el.scrollTop = el.scrollHeight;
                total = resp['total'];
            }).catch((status, err) => {

        });
    },
    rejected(data) {
        localStorage.removeItem("user_id");
        localStorage.removeItem("Authorization");
        window.open("/", "_self");
    }

});

function print_message(message) {
    let classes = "message-article";
    if (parseInt(message.user_id) === parseInt(localStorage.getItem("user_id"))) {
        classes = "message-me";
    }
    return `<article class="${classes}">
    <p class="message-sender">${message.user.login}</p>
    <p class="message-text">${message.message.replace(/(?:\r\n|\r|\n)/g, '<br/>')}</p>
    <p class="message-time">${message.created_at}</p>
</article>`;
}

function print_messages(messages = []) {
    for (let i = 0; i < messages.length; ++i) {
        el.insertAdjacentHTML("afterbegin", print_message(messages[i]));
    }
}

const textarea = document.getElementById("message_text");

document.getElementById("send_message").addEventListener("click", (event) => {
    if (textarea.value.length > 0) {
        send_request("/v1/message/send", "POST", {message: textarea.value});
        textarea.value = "";
    }
});

document.getElementById("logout").addEventListener("click", (event) => {
    send_request("/v1/user/logout", "POST").then((res) => {
        localStorage.removeItem("Authorization");
        localStorage.removeItem("user_id");
        window.open("/", "_self");
    }).catch(err => {
        localStorage.removeItem("Authorization");
        localStorage.removeItem("user_id");
        window.open("/", "_self");
    })
});
let current_offset = 0;
const per_page = 20;


el.addEventListener("scroll", (event) => {
    let pos = el.scrollTop;
    let height = el.scrollHeight;
    if (pos === 0 && current_offset < total) {
        current_offset += per_page;
        send_request("/v1/message/list", "GET", {offset: current_offset, limit: per_page})
            .then((resp) => {
                print_messages(resp['messages']);
            }).catch((status, err) => {
        });
    }
});

textarea.addEventListener("keypress", (e) => {
    if (e.keyCode === 13) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (textarea.value.length > 0) {
            send_request("/v1/message/send", "POST", {message: textarea.value});
            textarea.value = "";
        }
    }
});