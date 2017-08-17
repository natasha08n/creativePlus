//валидация авторизации
$(document).ready(function () {
    Vue.use(VeeValidate);
    var appLog = new Vue({
        el: '#appLog',
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
            log: function () {
                var email = jQuery("#email").val();
                var password = jQuery("#password").val(); //считываем пароль, введённый пользователем (asdqwe)
                var hash = jQuery.md5(password); // хэшируем считанный пароль, получаем (qazwsxedcrfv123456)
                if (email == "" || password == "") {
                    alert("Fill in all fields!");
                } else {
                    jQuery.get(
                        "http://localhost:3000/users", {
                            "email": email,
                            "hash": hash //обращаемся к БД и проверяем совпадает ли хэш от только что введенного пользователем пароля с хэшем пароля в БД
                        },
                        function (data) {
                            if (data.length > 0) {
                                var userInfo = {};
                                userInfo={
                                    id: data[0].id,
                                    login: data[0].login
                                };
                                //userInfo=session_decode(userInfo);
                                
                                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                                location.reload();
                            }
                            else{
                                alert("There is no such user in the database!")
                            }
                        }
                    );
                }
            },
            validateBeforeSubmit() {
                this.$validator.validateAll().then(result => {
                    if (result) {
                        // eslint-disable-next-line
                        // alert('From Submitted!');
                        appLog.log();
                    }
                    //alert('Correct them errors!');
                });
            }
        }
    });
});
