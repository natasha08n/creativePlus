//валидация регистрации
$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    Vue.use(VeeValidate);
    var appReg = new Vue({
        el: '#appReg',
        name: 'form-example',
        data: () => ({
            login: '',
            email: '',
            name: '',
            surname: '',
            password: '',
            photo: ''
        }),
        methods: {
            reg: function () {
                var login = jQuery("#loginReg").val();
                var name = jQuery("#nameReg").val();
                var surname = jQuery("#surnameReg").val();
                var email = jQuery("#emailReg").val();
                var password = jQuery("#passwordReg").val(); //считываем пароль, введённый пользователем (asdqwe)
                var passwordConfirm = jQuery("#passwordRegConfirm").val(); //считываем пароль, введённый пользователем (asdqwe)
                if (password === passwordConfirm) {
                    var hash = jQuery.md5(password); // хэшируем считанный пароль, получаем (qazwsxedcrfv123456)
                    $.ajax({
                        url: "http://localhost:3000/users?email=" + email,
                        type: "GET",
                        success: function (data) {
                            if (data.length == 0) {
                                $.ajax({
                                    url: "http://localhost:3000/users",
                                    type: "POST",
                                    data: {
                                        "login": login,
                                        "name": name,
                                        "surname": surname,
                                        "email": email,
                                        "hash": hash, // записываем наш полученный хэш (qazwsxedcrfv123456) в БД в поле hash
                                        "photo": "none",
                                        "isAdmin": true
                                    },
                                    success: function (userReg) {
                                        window.location.reload();
                                    }
                                });
                            } else {
                                alert("Sorry, this email already exists!");
                            }
                        }
                    });
                } else {
                    alert("Passwords do not match! Be careful! Try again, please.")
                }
            },
            validateBeforeSubmit() {
                this.$validator.validateAll().then(result => {
                    if (result) {
                        // eslint-disable-next-line
                        //alert('From Submitted!');
                        appReg.reg();
                    }
                    //alert('Correct them errors!');
                });
            }
        }
    });
});
