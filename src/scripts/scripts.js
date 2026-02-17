console.log('Olá do meu Portfólio!'); 
const saudacaoBotao = document.getElementById('saudacaoBtn'); 
const saudacaoMensagem = document.getElementById('saudacaoMensagem'); 
if (saudacaoBotao) { 
    //Verifica se o botão existe na página 
    saudacaoBotao.addEventListener('click', function() { 
    saudacaoMensagem.textContent = 
        saudacaoMensagem.textContent === '' ? 'Bem-vindo(a) ao meu portfólio! Espero que goste.' 
        : ''; //usamos um operador ternário para alternar a mensagem exibindo e ocultando;
    // Você pode adicionar mais lógica aqui, como mudar a cor do texto, etc. 
    });	
} 

document.addEventListener("DOMContentLoaded", function() {
    const menuMobile = document.querySelector("#menu-mobile");
    const menuNavegacao = document.querySelector("#nav");
 
    menuMobile.addEventListener("click", function() {
        menuNavegacao.classList.toggle("ativo");
    });
});



const addClass = (className, id)=>{
    const element = document.getElementById(id);
    console.log(className, id, element)
    
    if(element){
        element.classList.add(className);
    }
}
const removeClass = (className, id)=>{
    const element = document.getElementById(id);
    console.log(className, id, element)
    
    if(element){
        element.classList.remove(className);
    }
}



  