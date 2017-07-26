var GLOBAL_ID_USER = 0;
//var post = 0;

$["postJson"] = function( url, data, callback ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
        callback = data;
        data = undefined;
    }

    return jQuery.ajax({
        url: url,
        type: "POST",
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(data),
        success: callback
    });
};

//создание поста
function makePost(){
    GLOBAL_ID_USER = JSON.parse(sessionStorage.getItem('userInfo'));

    //считываем данные
    var title = jQuery("#title").val();
    var subtitle = jQuery("#subtitle").val();

    var text = jQuery("#text").val();

    var date = new Date();
    date = date.valueOf();
    
    var tags = jQuery("#tags").val();

    if (title == "" || subtitle == "" || text == "" || tags == "") {
        alert("Fill in all fields!");
    } else {
        //записваем пост
        jQuery.post("http://localhost:3000/posts", {
            "userId": GLOBAL_ID_USER.id,
            "title": title,
            "subtitle": subtitle,
            "text": text,
            "datePostCreate": date,
            "datePostUpdate": date,
            "photoPost": photo
        });

        //узнаем id поста
        jQuery.get(
            "http://localhost:3000/posts", {
                //проверяем эти два поля, так как считаем их уникальными, то есть id поста должно быть одно
                "title": title,
                "subtitle": subtitle
            },
            function (postdata) {
                if (postdata.length > 0) {
                    sessionStorage.setItem('postdata', JSON.stringify(postdata[0]));
                    createTag();
                    
                }
            }
        );

    }
}

//создание тегов
function createTag() {
            //записываем теги        
        var tags = jQuery("#tags").val();
        //разделяем массив на теги
        var re = /\s*,\s*/;
        var tagList = tags.split(re);
        post = JSON.parse(sessionStorage.getItem('postdata'));
    
        for (var i = 0; i < tagList.length; i++) {
            //записываем теги, зная id поста
            jQuery.post("http://localhost:3000/postsTags", {
                "postId": post.id,
                "nameTag": tagList[i],
            }, function (data) {
                //console.log("created", i);
            });
        }
    window.location.href = "indexOnePost.html?postId=" + post.id;
}