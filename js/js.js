var GLOBAL_ID_USER = 0;

$["postJson"] = function (url, data, callback) {
    // shift arguments if data argument was omitted
    if (jQuery.isFunction(data)) {
        callback = data;
        data = undefined;
    }

    return jQuery.ajax({
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data),
        success: callback
    });
};

function makePost() {
    GLOBAL_ID_USER = JSON.parse(sessionStorage.getItem('userInfo'));

    //read the data from inputs
    var title = jQuery("#title").val();
    var subtitle = jQuery("#subtitle").val();

    var text = jQuery("#text").val();

    var date = new Date();
    date = date.valueOf();

    var newTags = $("#tag").tagging("getTags");

    if (title == "" || subtitle == "" || text == "" || newTags == "") {
        alert("Fill in all fields!");
    } else {
        //write the post
        jQuery.post("http://localhost:3000/posts", {
            "userId": GLOBAL_ID_USER.id,
            "title": title,
            "subtitle": subtitle,
            "text": text,
            "datePostCreate": date,
            "datePostUpdate": date,
            "photoPost": photo
        }, function (postdata) { //write the data about new post in SessionStorage
            createTags(postdata.id, newTags, function (index) {
                window.location.href = "indexOnePost.html?postId=" + index;
            });
        });
    }
}

function createTags(postIndex, arrayTags, callback) {
    var check = 0;
    for (var i = 0; i < arrayTags.length; i++) {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/postsTags',
            data: {
                "postId": postIndex,
                "nameTag": arrayTags[i],
            },
            error: function (error) {
                alert("Sorry, tags didn't write in the database. Please, delete your post and try again.");
            },
            success: function (success) {
                check++;
                if (check == arrayTags.length) {
                    callback(postIndex);
                }
            }
        });
    }
}
