let localData;
let dolar;
let totalPrice = 0;

const checkPrice = async(url) => {
    console.log("Esperando datos Dolar");
    try{
        const response = await fetch(url);
        console.log("Dolar recibido")
        return response;
    }catch (error){
        console.error(error);
        let dollarValue = document.getElementById("dollarValue");
        dollarValue.innerText = "No disponible"
    }
}

checkPrice('https://s3.amazonaws.com/dolartoday/data.json')
    .then(response => response.json())
    .then(json => dolar=json.USD.dolartoday)
    .then(removeLoading => {
        let dollarValue = document.getElementById("dollarValue");
        dollarValue.innerText = `Bs. ${new Intl.NumberFormat("de-DE").format(Math.round(dolar))}`;
    })
    .catch(dolar = 0)

const regalarteAPI = async(url) =>{
    console.log("Esperando datos RegalArte")
    try{
        const response = await fetch(url);
        console.log("Regalarte recibido")
        return response;
    }catch(error){
        console.error(error);
    }
}

regalarteAPI('./database/data.json')        //iporto la data de la api local data.json
    .then(response => {return response.json()})
    .then(data => {localData = data; //Guardo la data en localData
        fillCakeSelectors();    //invoco la funcion para llenar los selectores
        fillSelectors();})
                                            
                                         



function fillCakeSelectors(){

    /*Recorro cada elemento del objeto cake, creo elelemento "option" del selector,
    le asigno el value de i que es el elemeto actual del recorrido para ser usado
    como clave posteriormente en calculo de precio, al "value" dentro le escribo el
    texto a mostrar y por ultimo lo asigno como hijo del selector - se repite en
    cada selector*/
    for(i in localData.cake.sizes){
        let optionSize = document.createElement("option");       
        optionSize.setAttribute("value", i)
        optionSize.innerText = localData.cake.sizes[i].size;
        let selectorSizeCake = document.getElementById("sizeCake");
        selectorSizeCake.appendChild(optionSize);
    }

    for(i in localData.cake.flavors){
        let optionSize = document.createElement("option");
        optionSize.setAttribute("value", i)
        optionSize.innerText = localData.cake.flavors[i].flavor;
        let selectorSizeCake = document.getElementById("flavorCake");
        selectorSizeCake.appendChild(optionSize);
    }

    for(i in localData.cake.covers){
        let optionSize = document.createElement("option");
        optionSize.setAttribute("value", i)
        optionSize.innerText = localData.cake.covers[i].cover;
        let selectorSizeCake = document.getElementById("decorationCake");
        selectorSizeCake.appendChild(optionSize);
    }

    for(i in localData.cake.fills){
        let optionSize = document.createElement("option");
        optionSize.setAttribute("value", i)
        optionSize.innerText = localData.cake.fills[i].fill;
        let selectorSizeCake = document.getElementById("fillCake");
        selectorSizeCake.appendChild(optionSize);
    }

}


function fillSelectors(){
    for(i in localData.sweet){
        let option = document.createElement("option");
        option.setAttribute("value", i);
        option.innerText = localData.sweet[i].name;
        let selectorSweet = document.getElementById("selectSweet");
        selectorSweet.appendChild(option);
    }
    for(i in localData.salty){
        let option = document.createElement("option");
        option.setAttribute("value", i);
        option.innerText = localData.salty[i].name;
        let selectorSalty = document.getElementById("selectSalty");
        selectorSalty.appendChild(option);
    }

}

/*El "form" es el formulario origen del cambio ("sweet" o "salty")
"input" es el selector que cambia y modifica las opciones del selector "output"*/
function changeSelect(form, input, output){
    let selectorOutput = document.getElementById(`${output}`); //obtenemos el conenedor de salida
    selectorOutput.innerHTML = ""           //limpiamos el contenido para ingresar nuevos datos

    let selectorInput = document.getElementById(`${input}`)  //El input viene como texto del id 
    selectValue = selectorInput[selectorInput.selectedIndex].value;  //se optiene el "value" clave para la busqueda en API

    if(selectValue !=0){ //verificamos que el selector de articulo este en un elemento diferente de "Seleccione..."
        let options = localData[form][selectValue].type //busca los "type" del elemeto seleccionado

    //Agregamos cada elemento
        for(i in options){
            let option = document.createElement("option");
            option.setAttribute("value", options[i].price);
            option.innerText = options[i].name;
            selectorOutput.appendChild(option);
    }
    }else{  //si el selector de articulo este en "Seleccione...", ponemos la variedad tambien el "Seleccione.."
        let option = document.createElement("option");
        option.setAttribute("value", 0);
        option.innerText = "Seleccione...";
        selectorOutput.appendChild(option);
    }
}

function showPrice(form, showPrice){
    let price;
    let showPriceText = document.getElementById(showPrice)
    
    if(form == "cake"){
        price = calcCakePrice();
       
    }else if(form == "sweet"){
        price = document.getElementById("typeSweet").value
    }else if(form == "salty"){
        price = document.getElementById("typeSalty").value
    }
    showPriceText.innerText = `Precio: $${price}`
}

function updatePrice(){
    const totalPriceText = document.querySelector(".totalPrice");
    let priceInBs;
    if(dolar == 0){
        priceInBs = "Conversión no disponible"
        totalPriceText.innerHTML = `<h2>$ ${totalPrice}</h2><h3> ${priceInBs}</h3>`;
    }else{
        priceInBs = new Intl.NumberFormat("de-DE").format(Math.round(dolar*totalPrice))
        totalPriceText.innerHTML = `<h2>$ ${totalPrice}</h2><h3>Bs ${priceInBs}</h3>`;
    }
    
}

function deleteItem(id, value){
    let element = document.getElementById(id);
    element.remove();
    totalPrice -= value;
    updatePrice();
}

function calcCakePrice(){
     //Selecciona el "selected" para posteriormente extraer el ".value" y el ".text"
     let selectedSize = document.cake.sizeCake.options[sizeCake.selectedIndex]; 
     let selectedFlavor = document.cake.flavorCake.options[flavorCake.selectedIndex];
     let selectedCover = document.cake.decorationCake[decorationCake.selectedIndex];
     let seletedFill = document.cake.fillCake[fillCake.selectedIndex];
 
     if(selectedSize.value != 0 && selectedFlavor.value != 0 && selectedCover.value != 0 && seletedFill.value != 0){
         //se busca el value del "selected" y se usa como clave para buscar en la API
         //Encuentra el exponente en la API para subir el precio dependiendo de la seleccion
         let sizePrice = localData.cake.sizes[selectedSize.value].price;  
         let flavorExp = localData.cake.flavors[selectedFlavor.value].exp;
         let coverExp = localData.cake.covers[selectedCover.value].exp;
         let fillExp = localData.cake.fills[seletedFill.value].exp;
 
         //Calcula el precio de la cake multiplicando sus exponentes
         let cakeValue = Math.ceil((((sizePrice*flavorExp)*coverExp)*fillExp));
         return cakeValue;
    }else{
        return 0;
    }
}

function addCake(){

    //Selecciona el "selected" para posteriormente extraer el ".value" y el ".text"
    let selectedSize = document.cake.sizeCake.options[sizeCake.selectedIndex]; 
    let selectedFlavor = document.cake.flavorCake.options[flavorCake.selectedIndex];
    let selectedCover = document.cake.decorationCake[decorationCake.selectedIndex];
    let seletedFill = document.cake.fillCake[fillCake.selectedIndex];

    if(selectedSize.value != 0 && selectedFlavor.value != 0 && selectedCover.value != 0 && seletedFill.value != 0){
        //se busca el value del "selected" y se usa como clave para buscar en la API
        //Encuentra el exponente en la API para subir el precio dependiendo de la seleccion
        let sizePrice = localData.cake.sizes[selectedSize.value].price;  
        let flavorExp = localData.cake.flavors[selectedFlavor.value].exp;
        let coverExp = localData.cake.covers[selectedCover.value].exp;
        let fillExp = localData.cake.fills[seletedFill.value].exp;

        //Calcula el precio de la cake multiplicando sus exponentes
        let cakeValue = Math.ceil((((sizePrice*flavorExp)*coverExp)*fillExp));

        //Selecciona el contenedor del sumario para agregar el articulo 
        const sumaryItemsContainer = document.querySelector(".sumary_container");

        //Creamos un un contendor "article" para agregar el texto descrtivo y un boton para eliminar
        const newItem = document.createElement('ARTICLE');
        //Creamos un id aleatorio para asignarlo igual al "article" y al boton para vincularlo
        let id = Math.round(Math.random()*1000);
        newItem.setAttribute("id", id);
        newItem.setAttribute("class", "sumary_item");

        newItem.innerHTML = `<p><b>Torta ${selectedSize.text}</b> > <b>Sabor:</b> ${selectedFlavor.text} > <b>Decoración:</b> ${selectedCover.text} > <b>Relleno:</b> ${seletedFill.text}</p><div><p class="price_p">$${cakeValue}</p>
        <button onclick="deleteItem(${id} , ${cakeValue})">X</button></div>`

        sumaryItemsContainer.appendChild(newItem);

        totalPrice += cakeValue;
        updatePrice();
    }else{
        alert("Por favor seleccione todas caracteristicas de la torta")
    }

}

function addItem(item , type){
    let selectedItem = document.getElementById(`${item}`);
    let selectedItemText = selectedItem[selectedItem.selectedIndex].text;
    let selectedItemValue = selectedItem[selectedItem.selectedIndex].value;

    if(selectedItemValue != 0){
        let selectedType = document.getElementById(`${type}`);
        let selectedTypeText = selectedType[selectedType.selectedIndex].text;
        let selectedTypeValue = selectedType[selectedType.selectedIndex].value;
        selectedTypeValue = parseInt(selectedTypeValue);

        const sumaryItemsContainer = document.querySelector(".sumary_container");

        const newItem = document.createElement('ARTICLE');

        let id = Math.round(Math.random()*1000);
        newItem.setAttribute("id", id);
        newItem.setAttribute("class", "sumary_item");

        newItem.innerHTML = `<p><b>${selectedItemText}</b> > <b>Variedad:</b> ${selectedTypeText }</p><div><p class="price_p">$${selectedTypeValue}</p>
        <button onclick="deleteItem(${id} , ${selectedTypeValue})">X</button></div>`

        sumaryItemsContainer.appendChild(newItem);

        totalPrice += selectedTypeValue;
        updatePrice();
    }else{
        alert("Por favor seleccione un artículo");
    }
}