$(document).ready(function () {
    if (userInfoFunctions.getUserInfo() == null) {
        window.location.href = "error.html";
    }

    var t, $tag_box;
    t = $("#tag").tagging();
});