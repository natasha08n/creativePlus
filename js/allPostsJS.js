$(document).on("click", ".modalDeletePostIndex", function () {
    creativeConsts.findPostId = $(this).data('id');
});

$(document).ready(function () {
    if (userInfoFunctions.getUserInfo() == null && creativeFunctions.getParameterByName('userId')) {
        window.location.href = "error.html";
    }

    var url = "";

    //show all posts from DB with vue-pagination
    new Vue({
        el: '#appPosts',
        data: {
            show: true,
            posts: [], //variable for showing all posts
            totalPosts: 0,
            perPage: 10,
            currentPage: 1,
            accountActive: false,
        },
        mounted: function () {
            this.getTotalPages();
        },
        methods: {
            //function that called after click on post title, it remembers post id and write the url for the new page for viewing this post
            custom_alert: function (index) {
                //save post id in the variable postId
                var postId = this.posts[index].id;
                //don't replace page for a new one, we build new url
                window.location.href = "indexOnePost.html?postId=" + postId;
            },
            identityPost: creativeFunctions.identityPost,
            newPath: creativeFunctions.newPath,
            postsExist: function () {
                return this.posts.length;
            },
            //functions for pagination
            fetchPosts: function (page) {
                if (creativeFunctions.getParameterByName('userId') == null) {
                    url = creativeConsts.baseUrl + "posts?_sort=datePostCreate&_order=desc&_page=" + page + "&_limit=" + this.perPage;
                } else {
                    url = creativeConsts.baseUrl + "posts?_sort=datePostCreate&_order=desc&userId=" + creativeFunctions.getParameterByName('userId') + "&_page=" + page + "&_limit=" + this.perPage;
                    this.accountActive = true;
                }

                //vue object id assinged to a new variable
                var that = this;

                $.getJSON(url, function (allPostsFromDB) {
                    if (allPostsFromDB.length > 0) {
                        //remember all the posts
                        for (var i = 0; i < allPostsFromDB.length; i++) {

                            allPostsFromDB[i].text = creativeFunctions.cropText(allPostsFromDB[i].text, creativeConsts.allTextMaxSize);

                            //change date format
                            allPostsFromDB[i].datePostUpdate = creativeFunctions.dateFormat(allPostsFromDB[i].datePostUpdate);

                            allPostsFromDB[i].commentsCount = 0; // we can assign null

                            //count comments to every post
                            (function (onePost) {
                                $.getJSON(creativeConsts.baseUrl + "comments/?postId=" + onePost.id, function (findCommentsCount) {
                                    onePost.commentsCount = findCommentsCount.length;
                                });
                            })(allPostsFromDB[i]);
                        }
                    }
                    that.posts = allPostsFromDB;
                });


                this.currentPage = page;


            },
            getTotalPages: function () {
                if (creativeFunctions.getParameterByName('userId') == undefined) {
                    url = creativeConsts.baseUrl + "posts";
                } else {
                    url = creativeConsts.baseUrl + "posts?userId=" + creativeFunctions.getParameterByName('userId');
                    this.accountActive = true;
                }
                var that = this;
                $.getJSON(url, function (allPostsFromDB) {
                    that.totalPosts = allPostsFromDB.length;
                });
            }
        },
        created: function () {
            this.fetchPosts(this.currentPage);
        }
    });

    //show all the recent posts
    var appRecentPosts = new Vue({
        el: '#appRecentPosts',
        data: {
            items: []
        },
        methods: {
            custom_alert: function (index) {
                var postId = this.items[index].id;
                window.location.href = "indexOnePost.html?postId=" + postId;
            }
        }
    });

    $.getJSON(creativeConsts.baseUrl + "posts?_sort=datePostUpdate&_order=desc&_limit=3", function (allSortedPosts) {
        if (allSortedPosts.length > 0) {
            //remember all theposts
            for (var i = 0; i < allSortedPosts.length; i++) {

                allSortedPosts[i].text = creativeFunctions.cropText(allSortedPosts[i].text, creativeConsts.recentTextMaxSize);

                //change date format
                allSortedPosts[i].datePostUpdate = creativeFunctions.dateFormat(allSortedPosts[i].datePostUpdate);
            }
            appRecentPosts.items = allSortedPosts;
        }
    });

    //popular tags
    var appTags = new Vue({
        el: '#appTags',
        data: {
            itemsTags: {}
        },
        methods: {
            custom_alert: function (index) {
                var nameTag = this.itemsTags[index].title;
                window.location.href = "?postTag=" + nameTag;
            }
        }
    });

    //selection of popular tags
    $.getJSON(creativeConsts.baseUrl + "postsTags", function (allTags) {
        if (allTags.length > 0) {
            let frequencies = {};
            let topTags = [];

            allTags.forEach(function (item, i, arr) {
                if (item.nameTag) {
                    if (frequencies[item.nameTag]) {
                        frequencies[item.nameTag]++;
                    } else {
                        frequencies[item.nameTag] = 1;
                    }
                }
            });

            for (let title in frequencies) {
                topTags.push({
                    title: title,
                    frequency: frequencies[title]
                });
            }
            topTags.sort(function (a, b) {
                return b.frequency - a.frequency;
            });

            topTags = topTags.slice(0, 10);
            var j = 10;
            for (var i = 0; i < topTags.length; i++) {
                if (i < topTags.length - 1) {
                    if (topTags[i].frequency == topTags[i + 1].frequency) {
                        topTags[i].font = j;
                    } else {
                        topTags[i].font = j;
                        j--;
                    }
                }
            }
            appTags.itemsTags = topTags;
        }
    });
});
