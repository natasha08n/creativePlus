var parentCommentId = 0;
var parentCommentLogin = "";

//one post
$(document).ready(function () {
    //write "" so that when the page is loading, there is no {{title}}
    var app = new Vue({
        el: '#app',
        data: {
            show: true,
            title: "",
            subscribe: "",
            subtitle: "",
            text: "",
            photo: "",
            authorId: "",
            tags: ""
            //tags: []
        },
        methods: {
            newPath: function () {
                window.location.href = "post.html?postId=" + creativeConsts.findPostId;
            },
            identityPost: creativeFunctions.identityPost,
            editOrCreate: function () {
                if (creativeFunctions.getParameterByName('postId') != null) {
                    return true;
                } else {
                    return false;
                }
            },
            redirect: function () {
                window.history.back();
            }
        }
    });

    jQuery.get(
        //get the post and its author
        creativeConsts.baseUrl + "posts/" + creativeConsts.findPostId + "?_expand=user", {},
        //this function will be called only after the result returns from http://localhost:3000/posts
        function (findPost) {

            var formattedDate = creativeFunctions.dateFormat(findPost.datePostUpdate);

            app.title = findPost.title;
            app.subtitle = findPost.subtitle;
            app.text = findPost.text;
            app.subscribe = formattedDate + " by " + findPost.user.login;
            app.photo = findPost.photoPost;
            app.authorId = findPost.user.id;
        }
    );

    jQuery.get(
        creativeConsts.baseUrl + "postsTags?postId=" + creativeConsts.findPostId, {},
        function (foundedTags) {
            if (foundedTags.length > 0) {
                var newStringTags = "";
                var tagsArray = [];

                foundedTags.forEach(function (item) {
                    tagsArray.push(item.nameTag);
                });
                app.tags=tagsArray;

                var t, $tag_box;
                $("#tag").tagging("add", app.tags);
            }
        }
    );

    //show comments to the post
    jQuery.get(
        creativeConsts.baseUrl + "comments/?postId=" + creativeConsts.findPostId + "&_expand=user", {},
        function (comments) {
            if (comments.length > 0) {
                for (var i = 0; i < comments.length; i++) {
                    //create a new field for the username
                    comments[i].loginUser = comments[i].user.login;
                    
                    comments[i].dateCommentCreate = creativeFunctions.dateFormat(comments[i].dateCommentCreate, 1);
                    
                    comments[i].dateCommentCreate = moment(comments[i].dateCommentCreate, "DD.MM.YYYY, h:mm:ss").fromNow();

                    comments[i].userAuthor = "";
                    (function (oneComment) {
                        $.getJSON(creativeConsts.baseUrl + "comments/" + oneComment.Parent, function (findComment) {
                            if (findComment.length > 1) {
                                oneComment.userAuthor = "";
                            } else {
                                $.getJSON(creativeConsts.baseUrl + "users/" + findComment.userId, function (findUser) {
                                    oneComment.userAuthor = "to " + findUser.login;
                                });
                            }
                        });
                    })(comments[i]);
                }

                //form the object to transfer to the vue tree
                var data = {
                    value: {
                        id: 0
                    },
                    children: postFunctions.buildHierarchy(comments)
                };

                //building a tree with vue.js
                Vue.component('item', {
                    template: '#item-template',
                    props: {
                        model: Object
                    },
                    data: function () {
                        return {
                            open: true
                        }
                    },
                    //change every time when any variable that enters here is changed
                    computed: {
                        isFolder: function () {
                            return this.model.children &&
                                this.model.children.length
                        }
                    },
                    methods: {
                        toggle: function () {
                            if (this.isFolder) {
                                this.open = !this.open
                            }
                        },
                        addChild: function () {
                            //save comment id in parentCommentId
                            parentCommentId = this.model.value.id;
                            this.userAnswered();
                            $(this).addClass('active');
                            $('body,html').animate({
                                scrollTop: $('#appIsLogged').position().top + 70
                            }, 400);

                        },
                        //function only replace the main text of the comment with the text "This comment has been removed."
                        deleteComment: function () {
                            //save comment id in the variable commentId
                            var commentId = this.model.value.id;
                            $.ajax({
                                url: creativeConsts.baseUrl + "comments/" + commentId,
                                type: 'PATCH',
                                success: function (result) {
                                    window.location.reload();
                                },
                                data: {
                                    "text": "This comment has been removed."
                                }
                            });
                        },
                        userAnswered: function () {
                            //save the comment's author login in the variable parentCommentLogin 
                            return parentCommentLogin = this.model.value.loginUser;
                        }
                    }
                })

                // boot up the demo
                var demo = new Vue({
                    el: '#commentTree',
                    data: {
                        show: true,
                        userInfo: {
                            id: 0
                        },
                        treeData: data
                    },
                    mounted: function () {
                        this.userInfo = this.getUserInfo();
                    },
                    methods: {
                        getUserInfo: function () {
                            var userName = JSON.parse(sessionStorage.getItem('userInfo'));
                            if (userName[0] != null) {
                                return userName[0];
                            } else {
                                return {
                                    id: 0
                                };
                            }
                        }
                    }
                });


            }
        });
});

//check whether the user is authorized and if so show form "create comment"
var appIsLogged = new Vue({
    el: '#appIsLogged',
    data: {
        show: true
    },
    methods: {
        isUserLogged: function () {
            if (JSON.parse(sessionStorage.getItem('userInfo')) != null) {
                return true;
            } else {
                return false;
            }
        }
    }
});