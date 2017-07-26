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

//id родительского комментария
var parentCommentId = "";
//login родительского комментария
var parentCommentLogin = "";

//функция для создания url с индексом поста
function getParameterByName(name, url) {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function buildHierarchy(arry) {

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
}


//просмотр поста
$(document).ready(function () {
    //записываемя id необходимого с помощью функции построения url -> getParameterByName() - она выше определена
    var findPostId = getParameterByName('postId');

    var month = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    //пишем "", чтобы при загрузке страницы не было {{title}} и так далее
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
        },
        methods: {
            newPath: function () {
                window.location.href = "post.html?postId=" + findPostId;
            },
            identityPost: function () {
                var findUserId = JSON.parse(sessionStorage.getItem('userInfo'));
                if (findUserId == null) {
                    return false;
                } else {
                    //проверяем принадлежит ли текущий пост авторизированному пользователю для того, чтобы либо показать, либо скрыть кнопки удаления/редактирования
                    return this.authorId == findUserId.id;
                }
            },
            editOrCreate: function () {
                if (getParameterByName('postId') != null) {
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
        //получаем пост и его автора
        "http://localhost:3000/posts/" + findPostId + "?_expand=user", {},
        //вызывется только после того как вернется результат от http://localhost:3000/posts
        function (findPost) {

            var formattedDate = new Date(parseInt(findPost.datePostUpdate));
            formattedDate = formattedDate.getDate() + "th " + month[formattedDate.getMonth()] + " " + formattedDate.getFullYear();

            app.title = findPost.title;
            app.subtitle = findPost.subtitle;
            app.text = findPost.text;
            app.subscribe = formattedDate + " by " + findPost.user.login;
            app.photo = findPost.photoPost;
            app.authorId = findPost.user.id;
        }
    );

    jQuery.get(
        "http://localhost:3000/postsTags?postId=" + findPostId, {},
        function (foundedTags) {
            if (foundedTags.length > 0) {
                var newStringTags = "";
                for (var i = 0; i < foundedTags.length; i++) {
                    newStringTags += foundedTags[i].nameTag + ", ";
                }
                newStringTags = newStringTags.substring(0, newStringTags.length - 2);
                app.tags = newStringTags;
            }
        }
    );

    var monthNumber = [01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12];

    //вывод комментариев к посту
    jQuery.get(
        "http://localhost:3000/comments/?postId=" + findPostId + "&_expand=user", {},
        function (comments) {
            if (comments.length > 0) {
                for (var i = 0; i < comments.length; i++) {
                    //создадим новое поля для логина юзера
                    comments[i].loginUser = comments[i].user.login;
                    var formattedDate = new Date(parseInt(comments[i].dateCommentCreate));
                    comments[i].dateCommentCreate = formattedDate.getDate() + "." + monthNumber[formattedDate.getMonth()] + "." + formattedDate.getFullYear() + ", " + formattedDate.getHours() + ":" + formattedDate.getMinutes() + ":" + formattedDate.getSeconds();
                    comments[i].dateCommentCreate = moment(comments[i].dateCommentCreate, "DD.MM.YYYY, h:mm:ss").fromNow();

                    comments[i].userAuthor = "";
                    (function (oneComment) {
                        $.getJSON("http://localhost:3000/comments/" + oneComment.Parent, function (findComment) {
                            if (findComment.length > 1) {
                                oneComment.userAuthor = "";
                            } else {
                                $.getJSON("http://localhost:3000/users/" + findComment.userId, function (findUser) {
                                    oneComment.userAuthor = "to " + findUser.login;
                                    console.log(oneComment.userAuthor);
                                });
                            }
                        });
                    })(comments[i]);
                }

                //формируем объект для передачи в дерево Vue
                var data = {
                    value: {
                        id: 0
                    },
                    children: buildHierarchy(comments)
                };

                //построение дерева с помощью Vue.js
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
                    //меняются каждый раз когда меняется любая переменная входящая сюда
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
                            //сохраняем id комментария в переменную parentCommentId
                            parentCommentId = this.model.value.id;
                            this.userAnswered();
                            $(this).addClass('active');
                            $('body,html').animate({
                                scrollTop: $('#appIsLogged').position().top + 70
                                // Скорость подъема
                            }, 400);

                        },
                        //удаление комментария,точнее замена основного текста комментария на текст о том,что комментарий удалён
                        deleteComment: function () {
                            //сохраняем id комментария в переменную commentId
                            var commentId = this.model.value.id;
                            $.ajax({
                                url: "http://localhost:3000/comments/" + commentId,
                                type: 'PATCH',
                                success: function (result) {
                                    window.location.reload();
                                },
                                data: {
                                    "text": "This comment has been removed."
                                }
                            });
                        },
                        userAnswered: function(){
                            //сохраняем login автора комментария в переменную parentCommentLogin
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
                            if (userName != null) {
                                return userName;
                            } else {
                                return { id: 0 };
                            }
                        }
                    }
                });


            }
        });
});

//проверяем зарегистрирован ли пользователь и если да, то отображаем форму добавления комментария
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

//удаление поста и всех зависимостей к нему
function deletePost() {
    var findPostId = getParameterByName('postId');
    $.ajax({
        url: "http://localhost:3000/posts/" + findPostId,
        type: "DELETE",
        success: function (result) {
            window.location.href = "index.html";
        }
    });
}

function createNewComment() {
    var text = $('#textComment').val();
    var userCurrentId = JSON.parse(sessionStorage.getItem('userInfo'));
    userCurrentId = userCurrentId.id;

    var findPostId = +getParameterByName('postId');

    var dateComment = new Date();
    dateComment = dateComment.valueOf();

    if (text == "") {
        alert("Fill in textarea!");
    } else {
        $.postJson(
            "http://localhost:3000/comments", {
                "userId": userCurrentId,
                "postId": findPostId,
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