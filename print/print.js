let input = document.querySelector(".input");
let run = document.querySelector("button");
let output = document.querySelector(".output");

function main() {
    run.addEventListener("click", function () {
        let s = input.value;
        output.innerHTML = s + '\n' + s;
    });
}

export {
    main
}