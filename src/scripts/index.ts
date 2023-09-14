import "../styles/index.css";

var counter = 0;
const button = document.getElementById('this-button');
console.log("this is login");

button.addEventListener('click', (event) => {
    counter++;
    button.textContent = `${counter}`
}, false)
