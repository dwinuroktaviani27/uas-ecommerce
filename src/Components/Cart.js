import React, { useState, useEffect } from "react";
import StripeCheckout from 'react-stripe-checkout';
import { Navbar } from './Navbar'
import { auth, fs } from '../Config/Config'
import { CartProducts } from './CartProducts'
import axios from "axios";
import { useHistory } from "react-router-dom";

// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// toast.configure();

export const Cart = () => {
    // getting current user function
    function GetCurrentUser() {
        const [user, setUser] = useState(null);
        useEffect(() => {
            auth.onAuthStateChanged(user => {
                if (user) {
                    fs.collection('users').doc(user.uid).get().then(snapshot => {
                        setUser(snapshot.data().Fullname);
                    })
                } else {
                    setUser(null);
                }
            })

        }, [])
        return user;
    }

    const user = GetCurrentUser();
    // console.log(user);

    //state of cart products
    const [cartProducts, setCartProducts] = useState([]);

    //getting cart products from firestore collection and updating the state
    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (user) {
                fs.collection('Cart' + user.uid).onSnapshot(snapshot => {
                    const newCartProduct = snapshot.docs.map((doc) => ({
                        ID: doc.id,
                        ...doc.data(),
                    }));
                    setCartProducts(newCartProduct);
                })
            }
            else {
                console.log('user is not signed in to retrieve cart');
            }
        })
    }, [])

    // console.log(cartProducts);

    //getting the qty from acrtProducts in a separate array
    const qty = cartProducts.map(cartProduct=>{
        return cartProduct.qty;
    })

    // reducing the wty in a single value
    const reducerOfQty = (accumulator, currentValue)=> accumulator+currentValue;

    const totalQty = qty.reduce(reducerOfQty, 0);
    // console.log(totalQty);

    // getting the Total Product Price from CartProduct in a separate array
    const price = cartProducts.map((cartProduct)=>{
        return cartProduct.TotalProductPrice;
    })

    //reducing the price in a single value
    const reducerOfPrice = (accumulator, currentValue)=> accumulator+currentValue;
    const totalPrice = price.reduce(reducerOfPrice, 0);

    //global variable
    let Product;

    //cart product increase function
    const cartProductIncrease = (cartProduct) => {
        // console.log(cartProduct);
        Product = cartProduct;
        Product.qty = Product.qty + 1;
        Product.TotalProductPrice = Product.qty * Product.price;

        //updating in database
        auth.onAuthStateChanged(user => {
            if (user) {
                fs.collection('Cart' + user.uid).doc(cartProduct.ID).update(Product).then(() => {
                    console.log('increment added');
                });
            }
            else {
                console.log('user is not logged in to increment');
            }
        })
    }

    //cart product decrease functionality
    const cartProductDecrease = (cartProduct) => {
        Product = cartProduct;
        if (Product.qty > 1) {
            Product.qty = Product.qty - 1;
            Product.TotalProductPrice = Product.qty * Product.price;

            //updating in database
            auth.onAuthStateChanged(user => {
                if (user) {
                    fs.collection('Cart' + user.uid).doc(cartProduct.ID).update(Product).then(() => {
                        console.log('decrement');
                    });
                }
                else {
                    console.log('user is not logged in to decrement');
                }
            })
        }


    }

    //state of TotalProducts
    const [totalProducts, setTotalProducts]= useState(0);
    // getting cart products
    useEffect(()=>{
        auth.onAuthStateChanged(user=>{
            if (user) {
                fs.collection('Cart' + user.uid).onSnapshot(snapshot=>{
                    const qty = snapshot.docs.length;
                    setTotalProducts(qty);
                })
            }
        })
    },[])

    const history = useHistory();
    const handleToken = async(token)=>{
        // console.log(token);
        const cart = {name: 'All Products', totalPrice}
        const response = await axios.post('http://localhost:8080/checkout',{
            token,
            cart
        })
        console.log(response);
        let {status}= response.data;
        if(status==='success'){
            history.push('/');
            // toast.success('Your order has been placed successfully', {
            //     position: 'top-right',
            //     autoClose: 5000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: false,
            //     draggable: false,
            //     progress: undefined,
            // });
        }
        else{
            alert('Something went wrong in checkout');
        }
    }

    return (
        <>
            <Navbar user={user} totalProducts={totalProducts}/>
            <br></br>
            {cartProducts.length > 0 && (
                <div className="container-fluid">
                    <h1 className="text-center">Cart</h1>
                    <div className="products-box">
                        <CartProducts cartProducts={cartProducts}
                            cartProductIncrease={cartProductIncrease}
                            cartProductDecrease={cartProductDecrease} />
                    </div>
                    <div className="summary-box">
                        <h5> Cart Summary</h5>
                        <br></br>
                        <div>
                            Total No of Products : <span>{totalQty}</span>
                        </div>
                        <div>
                            Total Price to Pay: <span>{totalPrice}</span>
                        </div>
                        <br></br>
                        <StripeCheckout
                        stripeKey="pk_test_51L9on3KZ3QDrGtIgztA2e1roXbCnEO8zFYnBk3jPxaKyEwQgjsQxbkEFVCmygrp8iFQex0Fv2h8JDaTZwkRslHY000hLLW71fi"
                        token={handleToken}
                        billingAddress
                        shippingAddress
                        name="All Products"
                        amount={totalPrice * 100}>
                        </StripeCheckout>
                    </div>

                </div>
            )}
            {cartProducts.length < 1 && (
                <div className="container-fluid">No products to show</div>
            )}
        </>
    )
}