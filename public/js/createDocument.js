$(document).ready(() => {
    const toast = $("#toast");
    const bsObject = bootstrap.Toast.getOrCreateInstance(toast);
    
    $("#submit").on("click", async () => {
        const fullname = $("#fullname");
        const name = $("#name");
        const image = $("#image");

        const base64 = await new Promise((res, _rej) => {
            var reader = new FileReader();
            reader.onload = function(e) {
                res(e.target.result);
            }
            reader.readAsDataURL(image.prop("files")[0]);
        });

        $.ajax({
            url: "/create-document",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                student: fullname.val(),
                name: name.val(),
                image: base64,
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