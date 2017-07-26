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

$(document).ready(function () {
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

    /*вывод всех постов*/
    var appAllPosts = new Vue({
        el: '#appAllPosts',
        data: {
            show: true,
            items: [], //переменная для вывода всех постов
            itemsAccount: [], //переменная для вывода постов конкретного пользователя
            accountActive: false,
        },
        methods: {
            //функция, которая вызываектся при нажатии на заголовок поста, она запоминается id поста и прописывает url для новой страницы просмотра этого поста
            custom_alert: function (index) {
                //сохраняем id поста в переменную postId
                var postId = this.items[index].id;
                //не заменяем страницу новой, а переходим дальше, новый путь прописывая
                window.location.href = "indexOnePost.html?postId=" + postId;
            },
            identityPost: function () {
                var findUserId = JSON.parse(sessionStorage.getItem('userInfo'));
                if (findUserId == null) {
                    return false;
                } else {
                    //проверяем принадлежит ли текущий пост авторизированному пользователю для того, чтобы либо показать, либо скрыть кнопки удаления/редактирования
                    return this.authorId == findUserId.id;
                }
            }
        }
    });

    var url;
    if (getParameterByName('userId') == null) {
        url = "http://localhost:3000/posts?_sort=datePostUpdate&_order=desc"; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } else {
        url = "http://localhost:3000/posts?userId=" + getParameterByName('userId');
        appAllPosts.accountActive = true;
    }

    $.getJSON(url, function (allPostsFromDB) {
        if (allPostsFromDB.length > 0) {
            console.log("All", allPostsFromDB.length);
            var userCurrent = JSON.parse(sessionStorage.getItem('userInfo')); //содрежит инфу о текущем юзере
            var j = 0; //для циклического добавления постов конкретного пользователя
            var accountPosts = []; //переменная для постов текущего пользователя
            //все посты запоминаем 
            for (var i = 0; i < allPostsFromDB.length; i++) {
                //обрезание текста для предпросмотра 
                var maxSizeText = 400;
                allPostsFromDB[i].text = allPostsFromDB[i].text.substring(0, maxSizeText) + '...';

                //изменение формата даты 
                var formattedDate = new Date(parseInt(allPostsFromDB[i].datePostUpdate));
                allPostsFromDB[i].datePostUpdate = formattedDate.getDate() + "th " + month[formattedDate.getMonth()] + " " + formattedDate.getFullYear();

                allPostsFromDB[i].commentsCount = 0; // можно присвоить null 

                //количество комментариев к посту 
                //!!!!!!!!!!!!!!!!!!первая немедленно вызываемая функция 
                (function (onePost) {
                    $.getJSON("http://localhost:3000/comments/?postId=" + onePost.id, function (findCommentsCount) {
                        onePost.commentsCount = findCommentsCount.length;
                    });
                })(allPostsFromDB[i]);

                //если кто-то авторизирован
                if (userCurrent != null) {
                    //если ид авториз. пользователя = userId поста
                    if (userCurrent.id == allPostsFromDB[i].userId) {
                        //записываем в массив этот пост
                        accountPosts[j] = allPostsFromDB[i];
                        j++;
                    }
                }
            }
        }
        appAllPosts.items = allPostsFromDB;
        appAllPosts.itemsAccount = accountPosts; //добавление в приложение vue инфу о постах текущего юзера
    });


    /*вывод недавних постов*/
    var appRecentPosts = new Vue({
        el: '#appRecentPosts',
        data: {
            items: []
        },
        methods: {
            //функция, которая вызывается при нажатии на заголовок поста, она запоминается id поста и прописывает url для новой страницы просмотра этого поста
            custom_alert: function (index) {
                //сохраняем id поста в переменную postId
                var postId = this.items[index].id;
                //не заменяем страницу новой, а переходим дальше, новый путь прописывая
                window.location.href = "indexOnePost.html?postId=" + postId;
            }
        }
    });

    $.getJSON("http://localhost:3000/posts?_sort=datePostUpdate&_order=desc&_limit=3", function (allSortedPosts) {
        if (allSortedPosts.length > 0) {
            //все посты запоминаем
            for (var i = 0; i < allSortedPosts.length; i++) {
                //обрезание текста для предпросмотра
                var maxSizeText = 100;
                allSortedPosts[i].text = allSortedPosts[i].text.substring(0, maxSizeText) + '...';

                //изменение формата даты
                var formattedDate = new Date(parseInt(allSortedPosts[i].datePostUpdate));
                allSortedPosts[i].datePostUpdate = formattedDate.getDate() + "th " + month[formattedDate.getMonth()] + " " + formattedDate.getFullYear();
            }
            appRecentPosts.items = allSortedPosts;
        }
    });

    /*популярные теги*/
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


    //популярность тега определяется по количеству встречаемости этого тега в постах
    //то есть становится популярным тогда, когда сравнивается кол - во встречаемость этого тега во всех постах
    //1. сначала сколько раз тег встречался
    //2. сортировка от наибольшей встречаемости до наименьшей
    //3. обрезается ассоциативный массив(тег, кол - во встречаемости)
    //4. то есть исходя из сортировки вверху будут макс встречаемость, а внизу наоборот
    //5. обрезаем первых 10 тегов и их выводим
    
    //выборка популярных тегов
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

            //topTags = topTags.slice(0, 10);
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
