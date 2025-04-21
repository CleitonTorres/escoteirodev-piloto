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

  