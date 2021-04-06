
/*================================
========LOGICA CARRITO==========*/


const CART_PRODUCTOS = "carritoProductosId";

$(document).ready( function() {
    cargarProductos();
    cargarProductosCard();
});

//Funcion para obtener los productos
function obtenerProductsDb(){
    const url = "../dbProducts.json"  

    //Fetch para extraer los productos.
    return fetch(url).then(response => {
        return response.json(); //Devolver los productos en json.
    })
    .then(result => {
        return result; //Devuelve los productos en objectos
    })
    .catch(error => {
        console.log(error); //Devuelve error 
    });

}

//Funcion para cargar los productos
async function cargarProductos(){       //Funcion asincrona para que pueda esperar la promesa.
    //Llamo a la funcion obtenerProductsDb y le asigno productos
    const productos = await obtenerProductsDb();
    
    let html = '';
    
    //Recorro productos para generar un template de cada producto.
    productos.forEach(producto => {
        html +=  `<div class="col-lg-3 col-sm-6 product-container">
            <div class="card product">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" />

                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">
                        ${producto.extraInfo}
                    </p>
                    <p class="card-text">
                        ${producto.precio} $ / Unidad
                    </p>
                    <button type="button" class="btn btn-danger btn-card" onClick=(añadirProductoCarrito(${producto.id}))>Añadir al carrito</button>
                </div>
            </div>
        </div>`
    });

    //Cargar los productos en el div productos
    $(".products")[0].innerHTML = html;
}

//Añadir el evento al button Carrito
$("#btnAbrirCerrarCarrito").on("click", abriryCerrarCarrito);


//funcion para abrir y cerrar el carrito de compras.
function abriryCerrarCarrito(){
    
    const contenedorCarrito = $(".cart-products")[0];
    
    for (const elem of contenedorCarrito.classList){
        if(elem === "hidden"){
            contenedorCarrito.classList.remove("hidden");
            contenedorCarrito.classList.add("active");
        }

        if(elem === "active"){
            contenedorCarrito.classList.remove("active");
            contenedorCarrito.classList.add("hidden");
        }
    }
    
}


//Funcion para añadir producto al carrito
function añadirProductoCarrito(idProducto){

    let arrayProductosId = []; //Array para almacenar todos los id de los productos que se van a añadir.

    //Guardar Productos localStorage, solo guardare Id del producto. 
    let localStorageIDS = localStorage.getItem(CART_PRODUCTOS);

    //Si no existen productos en el carrito
    if(localStorageIDS === null){
        arrayProductosId.push(idProducto); //Añadir al localStorage
        localStorage.setItem(CART_PRODUCTOS, arrayProductosId)
    }else{
        let productosID = localStorage.getItem(CART_PRODUCTOS);
        //Si existen productos en el carrito
        if(productosID.length > 0){
            //Añadir Producto
            productosID += "," + idProducto;
        }else{ //Si esta vacio 
            productosID = idProducto;
        }

        //Añadir al localStorage
        localStorage.setItem(CART_PRODUCTOS, productosID);
    }

    //LLamo a la funcion cuando se añade un producto al carrito
    cargarProductosCard();
}

//Funcion Cargar productos en el carrito.
async function cargarProductosCard(){   //Funcion asincrona para que pueda esperar la promesa.
    const productos = await obtenerProductsDb(); 

    //Convertir el resultado del localStorage en un array
    const localStorageItems = localStorage.getItem(CART_PRODUCTOS);

    let html = "";
     //Si el carrito de compras esta vacio
     if(!localStorageItems) {
        html = `
            <div class="cart-product empty">
                <p>Carrito Vacio.</p>
            </div>
        `;
    }else{
        const idProductosSplit = localStorageItems.split(","); //Split para agregar coma y separarlos para convertirlos en un array

        //Eliminar Ids Duplicados
        const idProductosCarrito = Array.from(new Set(idProductosSplit)); //Funcion from para eliminar los ids duplicados del array

        //Renderizando los productos seleccionados en el carrito.
        for ( const id of idProductosCarrito ){
            for ( const producto of productos){
                if(id == producto.id){
                    //Llamo a la funcion cantidad y le paso el id y el array
                    const cantidad = contarIdDuplicados(id, idProductosSplit);
                    //Calcular Precio Total
                    const precioTotal = producto.precio * cantidad;
                    //Renderizando el html
                    html += `
                    <div class="cart-product">
                        <img src="${producto.imagen}" alt="${producto.nombre}" />
                        <div class="cart-product-info">
                            <span class="quantity">${cantidad}</span>
                            <p>${producto.nombre}</p>
                            <p>Precio: ${precioTotal.toFixed(2)} $</p>
                            <p>Info: ${producto.extraInfo}</p>
                            <p class="change-quantity">
                                <button id="decrementar" onClick="decrementarCantidadProducto(${producto.id})">-</button>
                                <button id="incrementar" onClick="incrementarCantidadProducto(${producto.id})">+</button>
                            </p>
                            <p class="cart-product-delete">
                                <button onClick=(eliminarProductosCarrito(${producto.id}))>Eliminar</button>
                            </p>
                        </div>    
                    </div>`
                }
            }

        }

        html += `<div class="total">
            <p>TOTAL A PAGAR: $</p>
            <p>
                <button>Comprar</button>
            </p>
        </div>`;

    }

    //Renderizar los productos en cart-products.
    $(".cart-products")[0].innerHTML = html;
    
}

//Funcion para eliminar productos en el carrito
function eliminarProductosCarrito(idProducto){
    
    //Traer del localStorage todos los id de los productos
    const idProductosCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductosCart = idProductosCart.split(","); //Split para agregar coma y separarlos para convertirlos en un array
    const resultadoIdBorrado = eliminarTodosIds(idProducto, arrayIdProductosCart);
    
    if(resultadoIdBorrado){
        let contador = 0; //Inicializa en 0 
        let idsString = "";

        for ( const id of resultadoIdBorrado){
            contador++;
            if(contador < resultadoIdBorrado.length){
                idsString += id + ",";
            }else{
                idsString += id;
            }
        }
        localStorage.setItem(CART_PRODUCTOS, idsString);
    }

    //Eliminar todos los ids de local al estar vacio
    const idsLocalStorage = localStorage.getItem(CART_PRODUCTOS);
    if(!idsLocalStorage){
        localStorage.removeItem(CART_PRODUCTOS);
    }

    //Llamo a la funcion
    cargarProductosCard();
}

//Funcion para incrementar la cantidad en el carrito
function incrementarCantidadProducto (idProducto){
    const idProductosCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductosCart = idProductosCart.split(",");
    arrayIdProductosCart.push(idProducto);

    let contador = 0;
    let idsString = "";

    for(const id of arrayIdProductosCart){
        contador++;
        if(contador < arrayIdProductosCart.length){
            idsString += id + ",";
        }else{
            idsString += id;
        }
    }
    localStorage.setItem(CART_PRODUCTOS, idsString);

     //Llamo a la funcion
    cargarProductosCard()
}

//Funcion para decrementar la cantidad en el carrito
function decrementarCantidadProducto (idProducto){
    const idProductosCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductosCart = idProductosCart.split(",");

    const eliminarItem = idProducto.toString();
    let index = arrayIdProductosCart.indexOf(eliminarItem);
    if(index > -1) {
        arrayIdProductosCart.splice(index, 1);
    }
    
    let contador = 0;
    let idsString = "";

    for (const id of arrayIdProductosCart){
        contador++;
        if(contador < arrayIdProductosCart.length){
            idsString += id + ",";
        }else{
            idsString += id;
        }
    }

    localStorage.setItem(CART_PRODUCTOS, idsString);

    //Llamo a la funcion
    cargarProductosCard();
}

//Funcion para calcular la cantidad de ids duplicados
function contarIdDuplicados(value, arrayIds){

    //Contador
    let contador = 0;

    for ( const id of arrayIds){
        if(value == id){
            contador++;
        }
    }
    return contador;
}

//Funcion para quitar elementos de un array
function eliminarTodosIds (id, arrayIds){
    return arrayIds.filter( itemId => {
        return itemId != id;
    });
}

/*================================
========Animacion Footer==========*/

const btnFlotante = document.querySelector(".btn-flotante");
const footer = document.querySelector(".footer");

$(".btn-flotante").on("click",mostrarOcultarFooter);

//Funcion Mostrar y ocultar footer
function mostrarOcultarFooter(){
    if(footer.classList.contains('activo') ) {
        footer.classList.remove("activo");
        btnFlotante.classList.remove("activo");
        btnFlotante.textContent = "Contacto";
    }else{
        footer.classList.add("activo");
        btnFlotante.classList.add("activo");
        btnFlotante.textContent = "X Cerrar";
    }
}

