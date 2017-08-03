$(document).ready(function () {
    if (JSON.parse(sessionStorage.getItem('userInfo')) == null) {
        window.location.href = "error.html";
    }
    //setTimeout(function () {
    //    jQuery(function ($) {
    //        var t, $tag_box;
    //        t = $("#tag").tagging();
    //        console.log("11111");
    //        $("#tag").tagging("add", app.tags);
    //    });
    //}, 5000);



    var t, $tag_box;
    t = $("#tag").tagging();
    //$("#tag").tagging("add", app.tags);
});

var findPostId = getParameterByName('postId');

function editPost() {
    var GLOBAL_ID_USER = 0;
    GLOBAL_ID_USER = JSON.parse(sessionStorage.getItem('userInfo'));

    //read the data from inputs
    var title = jQuery("#title").val();
    var subtitle = jQuery("#subtitle").val();
    var text = jQuery("#text").val();
    var date = new Date();
    date = date.valueOf();
    var newTags = $("#tag").tagging("getTags");
    var photoOld;

    $.ajax({
        url: "http://localhost:3000/posts/" + findPostId,
        type: 'GET',
        success: function (findPostForPhoto) {
            photoOld = findPostForPhoto.photo;
        }
    });

    if (title == "" || subtitle == "" || text == "" || newTags == "") {
        alert("Fill in all fields!");
    } else {
        if (photo == "https://res.cloudinary.com/creativeplus/image/upload/v1500449234/oek3puuce6nt0i3xsj2h.png") {
            photo = photoOld;
        }
        //rewrite thepost
        $.ajax({
            url: "http://localhost:3000/posts/" + findPostId,
            type: 'PATCH',
            success: function (result) {},
            data: {
                "title": title,
                "subtitle": subtitle,
                "text": text,
                "datePostUpdate": date,
                "photoPost": photo
            }
        });

        deleteTags(findPostId, function () {
            editTags(findPostId, newTags, function (index) {
                window.location.href = "indexOnePost.html?postId=" + index;
            });
        })

    }
}

//delete tags
function deleteTags(postId, callback) {
    var check = 0;
    $.ajax({
        url: "http://localhost:3000/postsTags?postId=" + postId,
        type: 'GET',
        data: {},
        success: function (tags) {
            for (var i = 0; i < tags.length; i++) {
                (function (tagDelete) {
                    $.ajax({
                        url: "http://localhost:3000/postsTags/" + tagDelete.id,
                        type: 'DELETE',
                        success: function (success) {
                            check++;
                            if (check == tags.length) {
                                callback();
                            }
                        }
                    });
                })(tags[i]);
            }
        }
    });

}

function editTags(postIndex, arrayTags, callback) {
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
