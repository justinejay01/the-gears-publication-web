function getCompute() {
    let num1 = parseInt(document.getElementById("num1").value);
    let num2 = parseInt(document.getElementById("num2").value);
    let add = document.getElementById("add");
    let sub = document.getElementById("sub");
    let mult = document.getElementById("mult");
    let div = document.getElementById("div");

    add.innerHTML = num1 + num2;
    sub.innerHTML = num1 - num2;
    mult.innerHTML = num1 * num2;
    div.innerHTML = num1 / num2;
}

function getGrade() {
    var att = parseInt(document.getElementById("att").value);
    var seat = parseInt(document.getElementById("seat").value);
    var quiz = parseInt(document.getElementById("quiz").value);
    var exam = parseInt(document.getElementById("exam").value);
    
    var t = 0;
    var total = document.getElementById("total");
    var grade = document.getElementById("grade");

    att = (att * .10);
    seat = (seat * .20);
    quiz = (quiz * .30);
    exam = (exam * .40);

    t = (att + seat + quiz + exam);
    total.innerHTML = t;

    if(t >= 75) {
        grade.innerHTML = "Pasado ka pi!";
    } else {
        grade.innerHTML = "Bagsak ka, grabe ba!";
    }
}