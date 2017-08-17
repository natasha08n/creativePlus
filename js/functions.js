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
        success: callback,
        error: callback
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
    identityPost: function identityPost(i = 0) {
        var findUserId = userInfoFunctions.getUserInfo();

        if (findUserId == null) {
            return false;
        } else {
            findUserId = userInfoFunctions.decryptUserInfo(findUserId);
            //check whether the current post belongs to an authorized user in order to either show/hide the delete/edit buttons
            if (i != 0) {
                return i == findUserId.id;
            } else {
                return this.authorId == findUserId.id;
            }
        }
    },

    newPath: function newPath(id = 0) {
        if (id == 0) {
            window.location.href = "post.html?postId=" + creativeConsts.findPostId;
        } else {
            window.location.href = "post.html?postId=" + id;
        }
    },

    cropText: function cropText(text, length) {
        if (text.length <= length)
            return text;
        else
            return text.substring(0, length) + '. . .';
    },

    //change date format
    dateFormat: function dateFormat(dateUpdate) {
        var formattedDate = new Date(parseInt(dateUpdate));
        return moment(formattedDate).format('Do MMMM YYYY');
    }
}

window.userInfoFunctions = window.userInfoFunctions || {
    
    setUserInfo: function setUserInfo(userInfo){
        userInfo = CryptoJS.AES.encrypt(JSON.stringify(userInfo), creativeConsts.cypherPass);
        sessionStorage.setItem('userInfo', userInfo);
    },
    
    getUserInfo: function getUserInfo(){
        return sessionStorage.getItem('userInfo');
    },

    decryptUserInfo: function decryptUserInfo(userInfo) {
        var bytes = CryptoJS.AES.decrypt(userInfo.toString(), creativeConsts.cypherPass);
        var userInfoDecrypt = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return userInfoDecrypt;
    },
    
    removeUserInfo: function removeUserInfo(){
        sessionStorage.removeItem('userInfo');
    } 
}