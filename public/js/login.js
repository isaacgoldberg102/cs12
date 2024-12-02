$(document).ready(() => {
    const toast = $("#toast");
    const bsObject = bootstrap.Toast.getOrCreateInstance(toast);
    
    $("#submit").on("click", () => {
        const userInput = $("#username");
        const passInput = $("#password");

        $.ajax({
            url: "/authorize",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                username: userInput.val(),
                password: passInput.val(),
            })
        }).always((res) => {
            if (res.status != 200) {
                bsObject.show();
            } else {
                window.location.replace("/dashboard");
            }
        });
    })
})