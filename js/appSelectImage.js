var photo = "https://res.cloudinary.com/creativeplus/image/upload/v1500449234/oek3puuce6nt0i3xsj2h.png";

$(document).ready(function(){
    var CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/creativeplus/upload';
    var CLOUDINARY_UPLOAD_PRESET = 'g6efihdk';

    var imgPreview = document.getElementById('img-preview');
    var fileUpload = document.getElementById('file-upload');

    fileUpload.addEventListener('change', function(event){
        var file = event.target.files[0];
        var formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        axios({
            url: CLOUDINARY_URL,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData
        }).then(function(res){
            console.log(res);
            imgPreview.src=res.data.secure_url;
            photo=res.data.secure_url;
        }).catch(function(err){
            console.error(err);
        });
    });
});