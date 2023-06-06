document.getElementById("formCreateForum").onsubmit = function () {
    var title = document.getElementById("topicTitle").value;
    var content = document.getElementById("topicContent").value;
    fetch("/create_forum", {
        method: 'POST',
        body: JSON.stringify({
            title: title,
            cont: content,
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then((res) => res.text())
        .then((text) => {
            if (text == "1") {
                alert("New topic created!");
                window.location.replace("/forums");
            }
        })
        .catch(err => console.error("Error: ", err));
}