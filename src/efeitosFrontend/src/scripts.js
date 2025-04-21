function animar(){
    const slime = document.getElementById("slime");
    slime.classList.add("animar");
}
function jump() {
    const slime = document.getElementById("slime");

    // Obtém a posição atual da slime
    const currentX = slime.getBoundingClientRect().left - slime.parentElement.getBoundingClientRect().left;

    // Remove a classe animar e adiciona a classe jump
    slime.style.left = `${currentX}px`; // Mantém a posição `x` atual
    slime.classList.add("jump");
    slime.classList.remove("animar");

    setTimeout(() => {
        // Volta para a animação principal, mantendo a posição atual
        slime.classList.add("animar");
        slime.classList.remove("jump");
    }, 1000);
}