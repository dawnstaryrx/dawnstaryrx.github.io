let input = document.querySelector(".input");
let run = document.querySelector("button");
let output = document.querySelector(".output");

function main() {
    run.addEventListener("click", function () {
        let [a, b] = input.value.split("+");
        a = parseInt(a), b = parseInt(b);
        output.innerHTML = a + b;
    });
}

export {
    main
}