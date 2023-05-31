var email = "";

function forgUmailSend0() {
    var umail = document.getElementById("forgUmail").value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == "0") {
                var forgFailed = document.getElementById("forgFailed");
                forgFailed.classList.remove("d-none");

                if (forgFailed.classList.contains("animate__fadeOut")) {
                    forgFailed.classList.toggle("animate__fadeOut");
                }

                forgFailed.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgFailed.classList.toggle("animate__fadeIn");
                    forgFailed.classList.toggle("animate__fadeOut");
                }, 5000);
                setTimeout(function () {
                    forgFailed.classList.add("d-none");
                }, 5500);
            } else {
                email = this.responseText;
                document.getElementById("forgEmail").innerHTML = this.responseText;

                var forgSuccess = document.getElementById("forgSent");
                forgSuccess.classList.remove("d-none");

                document.getElementById("forgRCode").disabled = false;

                if (forgSuccess.classList.contains("animate__fadeOut")) {
                    forgSuccess.classList.toggle("animate__fadeOut");
                }

                forgSuccess.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgSuccess.classList.toggle("animate__fadeIn");
                    forgSuccess.classList.toggle("animate__fadeOut");
                }, 5000);
                setTimeout(function () {
                    forgSuccess.classList.add("d-none");
                }, 5500);
            }
        }
    };
    xhr.open("POST", "/auth/send_code", true);
    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8"
    );
    xhr.send("umail=" + umail);
}

function forgRCodeSend0() {
    var resetCode = document.getElementById("forgRCode").value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == "0") {
                var forgFailed = document.getElementById("forgFailed");
                forgFailed.classList.remove("d-none");

                if (forgFailed.classList.contains("animate__fadeOut")) {
                    forgFailed.classList.toggle("animate__fadeOut");
                }

                forgFailed.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgFailed.classList.toggle("animate__fadeIn");
                    forgFailed.classList.toggle("animate__fadeOut");
                }, 5000);
                setTimeout(function () {
                    forgFailed.classList.add("d-none");
                }, 5500);
            } else if (this.responseText == "2") {
                var forgFailed = document.getElementById("forgCodeFailed");
                forgFailed.classList.remove("d-none");

                if (forgFailed.classList.contains("animate__fadeOut")) {
                    forgFailed.classList.toggle("animate__fadeOut");
                }

                forgFailed.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgFailed.classList.toggle("animate__fadeIn");
                    forgFailed.classList.toggle("animate__fadeOut");
                }, 5000);
                setTimeout(function () {
                    forgFailed.classList.add("d-none");
                }, 5500);
            } else {
                var forgSuccess = document.getElementById("forgVerified");
                forgSuccess.classList.remove("d-none");

                document.getElementById("forgPword").disabled = false;
                document.getElementById("forgPass").disabled = false;

                if (forgSuccess.classList.contains("animate__fadeOut")) {
                    forgSuccess.classList.toggle("animate__fadeOut");
                }

                forgSuccess.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgSuccess.classList.toggle("animate__fadeIn");
                    forgSuccess.classList.toggle("animate__fadeOut");
                }, 2500);
                setTimeout(function () {
                    forgSuccess.classList.add("d-none");
                }, 3000);
            }
        }
    };
    xhr.open("POST", "/auth/verify_code_pass", true);
    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8"
    );
    xhr.send("email=" + email + "&rcode=" + resetCode);
}

function forgPass0() {
    var resetCode = document.getElementById("forgRCode").value;
    var pass = document.getElementById("forgPword").value;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == "0") {
                var forgFailed = document.getElementById("forgFailed");
                forgFailed.classList.remove("d-none");

                if (forgFailed.classList.contains("animate__fadeOut")) {
                    forgFailed.classList.toggle("animate__fadeOut");
                }

                forgFailed.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgFailed.classList.toggle("animate__fadeIn");
                    forgFailed.classList.toggle("animate__fadeOut");
                }, 5000);
                setTimeout(function () {
                    forgFailed.classList.add("d-none");
                }, 5500);
            } else {
                var forgSuccess = document.getElementById("forgSuccess");
                forgSuccess.classList.remove("d-none");

                document.getElementById("forgPword").disabled = false;

                if (forgSuccess.classList.contains("animate__fadeOut")) {
                    forgSuccess.classList.toggle("animate__fadeOut");
                }

                forgSuccess.classList.toggle("animate__fadeIn");

                setTimeout(function () {
                    forgSuccess.classList.toggle("animate__fadeIn");
                    forgSuccess.classList.toggle("animate__fadeOut");
                }, 2500);
                setTimeout(function () {
                    forgSuccess.classList.add("d-none");
                }, 3000);
            }
        }
    };
    xhr.open("POST", "/auth/reset_pass", true);
    xhr.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8"
    );
    xhr.send("email=" + email + "&pass=" + pass + "&rcode=" + resetCode);
}