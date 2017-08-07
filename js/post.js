$(document).ready(function () {
    if (JSON.parse(sessionStorage.getItem('userInfo')) == undefined) {
        window.location.href = "error.html";
    }

    var t, $tag_box;
    t = $("#tag").tagging();
});