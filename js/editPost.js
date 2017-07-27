$(document).ready(function(){
    if (JSON.parse(sessionStorage.getItem('userInfo')) == null) {
        window.location.href="error.html";
    }
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
    var tags = jQuery("#tags").val();
    var photoOld;
    
    $.ajax({
            url: "http://localhost:3000/posts/" + findPostId,
            type: 'GET',
            success: function (findPostForPhoto) {
                photoOld = findPostForPhoto.photo;
            }
        });

    if (title == "" || subtitle == "" || text == "" || tags == "") {
        alert("Fill in all fields!");
    } else {
        if(photo=="https://res.cloudinary.com/creativeplus/image/upload/v1500449234/oek3puuce6nt0i3xsj2h.png"){
            photo=photoOld;
        }
        //rewrite thepost
        $.ajax({
            url: "http://localhost:3000/posts/" + findPostId,
            type: 'PATCH',
            success: function (result) {
            },
            data: {
                "title": title,
                "subtitle": subtitle,
                "text": text,
                "datePostUpdate": date,
                "photoPost": photo
            }
        });

        //delete tags
        $.ajax({
            url: "http://localhost:3000/postsTags?postId=" + findPostId,
            type: 'GET',
            data: {},
            success: function (tags) {
                for (var i = 0; i < tags.length; i++) {
                    (function (tagDelete) {
                        $.ajax({
                            url: "http://localhost:3000/postsTags/" + tagDelete.id,
                            type: 'DELETE',
                            success: function (result) {
                                window.location.href = "indexOnePost.html?postId=" + findPostId;
                            }
                        });
                    })(tags[i]);
                }
                editTags();
            }
        });
        
        
    }
}

function editTags(){
        //read tags frominput      
        var tags = jQuery("#tags").val();
        //divide the array into tags
        var re = /\s*,\s*/;
        var tagList = tags.split(re);
        
        for (var i = 0; i < tagList.length; i++) {
            //writetags knowing id post
            jQuery.post("http://localhost:3000/postsTags", {
                "postId": findPostId,
                "nameTag": tagList[i],
            }, function (data) {
            });
        }
}