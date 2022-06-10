import React from "react";
import { IndividualProduct } from "./IndividualProduct";

export const CartProducts = ({cartProducts}) =>{
    return cartProducts.map((cartProduct)=>(
        <IndividualProduct key={cartProduct.ID} cartProduct={cartProduct}/>
    ))
        
    
}