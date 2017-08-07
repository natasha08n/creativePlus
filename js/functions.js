//delete "" in int value (used in js.js)
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

window.creativeFunctions = window.creativeFunctions || {

    //create new url and get url-parameters
    getParameterByName: function getParameterByName(name, url) {
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
    },

    //used in vue-application in allPosts.js
    identityPost: function identityPost() {
        var findUserId = JSON.parse(sessionStorage.getItem('userInfo'));
        if (findUserId == undefined) {
            return false;
        } else {
            //check whether the current post belongs to an authorized user in order to either show/hide the delete/edit buttons
            return this.authorId == findUserId[0].id;
        }
    },
    
    cropText: function cropText(text, length){
        if(text.length <= length)
            return text;
        else
            return text.substring(0, length) + '. . .';
    },
    
    //change date format
    dateFormat: function dateFormat(dateUpdate, parameter=0){
        var formattedDate = new Date(parseInt(dateUpdate));
        if(parameter==0){
            return moment(formattedDate).format('Do MMMM YYYY');
        }
        else
            return moment(formattedDate).format('DD.MM.YYYY, h:mm:ss');
    }
}
