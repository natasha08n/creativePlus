window.postFunctions = window.postFunctions || {
    //function for hierarchical comments
    buildHierarchy: function buildHierarchy(arry) {
        var roots = [],
            children = {};

        // find the top level nodes and hash the children based on parent
        for (var i = 0, len = arry.length; i < len; ++i) {
            var item = arry[i],
                p = item.Parent,
                target = !p ? roots : (children[p] || (children[p] = []));

            target.push({
                value: item
            });
        }

        // function to recursively build the tree
        var findChildren = function (parent) {
            if (children[parent.value.id]) {
                parent.children = children[parent.value.id];
                for (var i = 0, len = parent.children.length; i < len; ++i) {
                    findChildren(parent.children[i]);
                }
            }
        };

        // enumerate through to handle the case where there are multiple roots
        for (var i = 0, len = roots.length; i < len; ++i) {
            findChildren(roots[i]);
        }

        return roots;
    },

    makePost: function makePost() {
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
            jQuery.post(creativeConsts.baseUrl + "posts", {
                "userId": JSON.parse(sessionStorage.getItem('userInfo'))[0].id,
                "title": title,
                "subtitle": subtitle,
                "text": text,
                "datePostCreate": date,
                "datePostUpdate": date,
                "photoPost": creativeConsts.photo
            }, function (postdata) { //write the data about new post in SessionStorage
                postFunctions.saveTags(postdata.id, newTags, function (index) {
                    window.location.href = "indexOnePost.html?postId=" + index;
                });
            });
        }
    },

    editPost: function editPost() {
        //read the data from inputs
        var title = jQuery("#title").val();
        var subtitle = jQuery("#subtitle").val();
        
        var text = jQuery("#text").val();
        
        var date = new Date();
        date = date.valueOf();
        
        var newTags = $("#tag").tagging("getTags");
        
        var photoOld;

        $.ajax({
            url: "http://localhost:3000/posts/" + creativeConsts.findPostId,
            type: 'GET',
            success: function (findPostForPhoto) {
                photoOld = findPostForPhoto.photo;
            }
        });

        if (title == "" || subtitle == "" || text == "" || newTags == "") {
            alert("Fill in all fields!");
        } else {
            if (creativeConsts.photo == "https://res.cloudinary.com/creativeplus/image/upload/v1500449234/oek3puuce6nt0i3xsj2h.png") {
                creativeConsts.photo = photoOld;
            }
            //rewrite the post
            $.ajax({
                url: creativeConsts.baseUrl + "posts/" + creativeConsts.findPostId,
                type: 'PATCH',
                success: function (result) {},
                data: {
                    "title": title,
                    "subtitle": subtitle,
                    "text": text,
                    "datePostUpdate": date,
                    "photoPost": creativeConsts.photo
                }
            });

            deleteTags.deleteTags(creativeConsts.findPostId, function () {
                postFunctions.saveTags(creativeConsts.findPostId, newTags, function (index) {
                    window.location.href = "indexOnePost.html?postId=" + index;
                });
            })

        }
    },

    //delete post and all the dependencies to it
    deletePost: function deletePost() {
        $.ajax({
            url: creativeConsts.baseUrl + "posts/" + creativeConsts.findPostId,
            type: "DELETE",
            success: function (result) {
                window.location.href = "index.html";
            }
        });
    },

    //delete tags
   deleteTags: function deleteTags(postId, callback) {
        var check = 0;
        $.ajax({
            url: creativeConsts.baseUrl + "postsTags?postId=" + postId,
            type: 'GET',
            data: {},
            success: function (tags) {
                for (var i = 0; i < tags.length; i++) {
                    (function (tagDelete) {
                        $.ajax({
                            url: creativeConsts.baseUrl + "postsTags/" + tagDelete.id,
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
    },
    
    //create or edit tags
    saveTags: function saveTags(postIndex, arrayTags, callback) {
        var check = 0;
        for (var i = 0; i < arrayTags.length; i++) {
            $.ajax({
                type: 'POST',
                url: creativeConsts.baseUrl + "postsTags",
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
    },

    createNewComment: function createNewComment() {
        var text = $('#textComment').val();
        var userCurrentId = JSON.parse(sessionStorage.getItem('userInfo'));
        userCurrentId = userCurrentId.id;

        var dateComment = new Date();
        dateComment = dateComment.valueOf();

        if (text == "") {
            alert("Fill in textarea!");
        } else {
            $.postJson(
                creativeConsts.baseUrl + "comments", {
                    "userId": userCurrentId,
                    "postId": creativeConsts.findPostId,
                    "Parent": parentCommentId,
                    "text": text,
                    "dateCommentCreate": dateComment
                },
                function (commentNew) {
                    window.location.reload();
                }
            );
        }
    }
}
