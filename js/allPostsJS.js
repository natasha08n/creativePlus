//create new url and get url-parameters
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

$(document).ready(function () {
    var url = "";

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

    /*show all posts from DB with vue-pagination*/
    new Vue({
        el: '#appPosts',
        data: {
            show: true,
            posts: [], //variable for showing all posts
            totalPosts: 0,
            perPage: 2,
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
            identityPost: function () {
                var findUserId = JSON.parse(sessionStorage.getItem('userInfo'));
                if (findUserId == null) {
                    return false;
                } else {
                    //check whether the current post belongs to an authorized user in order to either show/hide the delete/edit buttons
                    return this.authorId == findUserId.id;
                }
            },
            postsExist: function () {
                return this.posts.length;
            },
            //functions for pagination
            fetchPosts: function (page) {
                if (getParameterByName('userId') == null) {
                    url = "http://localhost:3000/posts?_page=" + page + "&_limit=2"; 
                } else {
                    url = "http://localhost:3000/posts?userId=" + getParameterByName('userId') + "&_page=" + page + "&_limit=2";
                    this.accountActive = true;
                }

                //vue object id assinged to a new variable
                var that = this;

                $.getJSON(url, function (allPostsFromDB) {
                    if (allPostsFromDB.length > 0) {
                        //remember all the posts
                        for (var i = 0; i < allPostsFromDB.length; i++) {
                            var maxSizeText = 400;
                            allPostsFromDB[i].text = allPostsFromDB[i].text.substring(0, maxSizeText) + '...';

                            //change date format
                            var formattedDate = new Date(parseInt(allPostsFromDB[i].datePostUpdate));
                            allPostsFromDB[i].datePostUpdate = formattedDate.getDate() + "th " + month[formattedDate.getMonth()] + " " + formattedDate.getFullYear();

                            allPostsFromDB[i].commentsCount = 0; // we can assign null

                            //count comments to every post
                            (function (onePost) {
                                $.getJSON("http://localhost:3000/comments/?postId=" + onePost.id, function (findCommentsCount) {
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
                var that = this;
                $.getJSON("http://localhost:3000/posts", function (allPostsFromDB) {
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

    $.getJSON("http://localhost:3000/posts?_sort=datePostUpdate&_order=desc&_limit=3", function (allSortedPosts) {
        if (allSortedPosts.length > 0) {
            //remember all theposts
            for (var i = 0; i < allSortedPosts.length; i++) {
                var maxSizeText = 100;
                allSortedPosts[i].text = allSortedPosts[i].text.substring(0, maxSizeText) + '...';

                //change date format
                var formattedDate = new Date(parseInt(allSortedPosts[i].datePostUpdate));
                allSortedPosts[i].datePostUpdate = formattedDate.getDate() + "th " + month[formattedDate.getMonth()] + " " + formattedDate.getFullYear();
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
    $.getJSON("http://localhost:3000/postsTags", function (allTags) {
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
                //console.log(title + ': ' + frequencies[title]);
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
