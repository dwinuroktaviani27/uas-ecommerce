import React, { useState, useEffect } from 'react'
import { Navbar } from './Navbar'
import { Products } from './Products'
import { auth, fs } from '../Config/Config'

export const Home=(props) => {
    //get current user id
    function GetUserUid() {
        const [uid, setUid] = useState(null);
        useEffect(() => {
            auth.onAuthStateChanged(user => {
                if (user) {
                    setUid(user.uid);
                }
            })
        }, [])
        return uid;
    }

    const uid = GetUserUid();

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

    // state of products
    const [products, setProducts] = useState([]);

    // getting products function
    const getProducts = async () => {
        const products = await fs.collection('Products').get();
        const ProductsArray = [];
        for (var snap of products.docs) {
            var data = snap.data();
            data.ID = snap.id;
            ProductsArray.push({
                ...data
            })
            if (ProductsArray.length === products.docs.length) {
                setProducts(ProductsArray);
            }
        }
    }

    useEffect(() => {
        getProducts();
    }, [])

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

    let Product;
    const addToCart = (product) => {
        if (uid!==null) {
            // console.log(product);
            Product = product;
            Product['qty']=1;
            Product['TotalProductPrice']= Product.qty*Product.price;
            fs.collection('Cart' + uid).doc(product.ID).set(Product).then(()=>{
                console.log('successfully added to cart')
            })
        } else {
            props.history.push('/login');
        }
    }

    return (
        <>
            <Navbar user={user} totalProducts={totalProducts}/>
            <br></br>
            {Products.length > 0 && (
                <div className='container-fluid'>
                    <h1 className='text-center'>Products</h1>
                    <div className='products-box'>
                        <Products products={products} addToCart={addToCart} />
                    </div>
                </div>
            )}
            {products.length < 1 && (
                <div className='container-fluid'>Please wait....</div>
            )}
        </>
    )
}
