import React, { useState, useEffect } from "react";
import DonutChart from 'react-donut-chart';
import { createStockDocument , firestore } from "../../FirebaseFunctions/firebase.utils";
import { useToasts } from 'react-toast-notifications';

import "./GraphComponent.css"

const GraphComponent = ({ stockName }) => {

    const [userChoiceFromStorage, setUserChoiceFromStorage] = useState({})
    const [buttonClicked, setButtonClicked] = useState(false)
    const [buyValue, setBuyValue] = useState(0)
    const [sellValue, setSellValue] = useState(0)
    const [holdValue, setHoldValue] = useState(0)
    const [userChoice, setUserChoice] = useState([])

    const { addToast } = useToasts()

    useEffect(() => {
        createStockDocument(stockName)
    },[])

    const [sessionId, setSessionId] = useState("")
    //Session ID code block ----- CAN BE REMOVED
        const generateSessionId = () => {
            const now = new Date()

            setSessionId(now.getTime())
        }

        useEffect(() => {
            generateSessionId()
            console.log(19, sessionId)
        },[])

        useEffect(() => {
            const interval = setInterval(() => {
                generateSessionId()
            },[90000])

            return () => clearInterval(interval)
        },[])
    //End of sessionid block

    const getPercentDetailsFirestore = async () => {

            let reference = await firestore.collection('stockDetails').where('stockName','==',stockName).get()
            reference.forEach(item => {
                setBuyValue(item.data().buyPercent)
                setSellValue(item.data().sellPercent)
                setHoldValue(item.data().holdPercent)
            })

            //Retrieving the chart data on every snapshot change
            firestore.collection('stockDetails').where('stockName','==', stockName).onSnapshot(querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    setBuyValue(change.doc.data().buyPercent)
                    setSellValue(change.doc.data().sellPercent)
                    setHoldValue(change.doc.data().holdPercent)
                });
            })        
    }

    //This is to update the page on the page load
    useEffect(() => {
        getPercentDetailsFirestore()
    },[])

    const notify = () => addToast("Duplicate vote!\nTry choosing other options if you change you view about this stock", { appearance : 'error', autoDismiss: true })

    const handleBuySellHoldButtonClick = async e => {
        
        let buttonValue = e.target.value
        console.log(47, e.target.className)
        let buttonClassName = e.target.className
        if(buttonClassName.split(" ").includes("disabled")) {
            notify()
        } else {
            if(buttonValue === "Buy") {
                if(localStorage.getItem(`STOCK-${stockName}`)) {
                    let oldValueInLocalStorage = JSON.parse(localStorage.getItem(`STOCK-${stockName}`))
                    console.log(140, oldValueInLocalStorage)

                    //Checking for the old choice
                    oldValueInLocalStorage.action === "SELL"
                        ?
                    (await firestore.doc(`/stockDetails/${stockName}`).update({
                        sellPercent : sellValue - 1
                    }))
                        :
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        holdPercent : holdValue - 1
                    })
                    //End of check

                    setBuyValue(buyValue + 1)
                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'BUY', sessionId: sessionId , expiry: new Date().getTime() + 90000}))
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        buyPercent : buyValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)
                } else {
                    setBuyValue(buyValue + 1)
                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'BUY', sessionId: sessionId , expiry: new Date().getTime() + 90000}))
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        buyPercent : buyValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)                    
                }
                
            } else if(buttonValue === "Sell") {
                if(localStorage.getItem(`STOCK-${stockName}`)) {
                    let oldValueInLocalStorage = JSON.parse(localStorage.getItem(`STOCK-${stockName}`))
                    console.log(140, oldValueInLocalStorage)


                    //Checking for the old choice
                    oldValueInLocalStorage.action === "BUY"
                        ?
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        buyPercent : buyValue - 1
                    })
                        :
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        holdPercent : holdValue - 1
                    })
                    //End of check

                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'SELL', sessionId: sessionId , expiry: new Date().getTime() + 90000}))
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        sellPercent : sellValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)
                } else {
                    setSellValue(sellValue + 1)
                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'SELL', sessionId: sessionId , expiry: new Date().getTime() + 90000}))
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        sellPercent : sellValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)
                }
                
                
            } else {                
                if(localStorage.getItem(`STOCK-${stockName}`)) {
                    let oldValueInLocalStorage = JSON.parse(localStorage.getItem(`STOCK-${stockName}`))
                    console.log(140, oldValueInLocalStorage)

                    //Checking for the old choice
                    oldValueInLocalStorage.action === "BUY" 
                        ? 
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        buyPercent : buyValue - 1
                    })
                        :
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        sellPercent : sellValue - 1
                    })
                    //End of check

                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'HOLD', sessionId: sessionId , expiry: new Date().getTime() + 90000}))
                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        holdPercent : holdValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)
                } else {
                    // setHoldValue(holdValue + 1)
                    localStorage.setItem(`STOCK-${stockName}`,JSON.stringify({stockName: stockName , action: 'HOLD', sessionId: sessionId , expiry: new Date().getTime() + 90000}))

                    await firestore.doc(`/stockDetails/${stockName}`).update({
                        holdPercent : holdValue + 1
                    })
                    setButtonClicked(true)
                    setButtonClicked(false)
                }
                
            }
        }
        setButtonClicked(false)   
    }

    //Deleting elements from localstorage based on the expiry key
    const deleteFromLocalStorage = () => {
        
        console.log("Starting", 205)
        let stockListFromLocalStorage = []

        for(let i in localStorage){
            if(i.startsWith("STOCK")) {
                stockListFromLocalStorage.push(i)
            }
        }
        if(stockListFromLocalStorage.length > 0) {
            stockListFromLocalStorage.forEach(item => {
                if(JSON.parse(localStorage[item]).expiry < new Date().getTime() ) {
                    localStorage.removeItem(item)
                }
            })
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            deleteFromLocalStorage()
        },60000)

        return () => clearInterval(interval)
    },[])


    //GETTING USER CHOICE FROM LOCAL STORAGE
    const getUserChoiceFromStorage = () => {
        let storageData = JSON.parse(localStorage.getItem(`STOCK-${stockName}`))
        setUserChoiceFromStorage(storageData)  // SETUSERCHOICE IS A STATE CONTAINER; GETUSERCHOICE IS A FUNCTION
    }

    useEffect(() => {
        let storageData = localStorage.getItem(`STOCK-${stockName}`)
        if(!storageData) {
            setUserChoiceFromStorage({})
        } else {
            setUserChoiceFromStorage(JSON.parse(storageData))
        }
    },[])

    useEffect(() => {
        if(buttonClicked) {
            getUserChoiceFromStorage()
        }
    },[buttonClicked])
 
    const totalValue = buyValue + sellValue + holdValue

    const buyPercent = buyValue > 0 ? parseFloat(((buyValue/totalValue)* 100).toFixed(2)) :  0
    const sellPercent = sellValue > 0 ? parseFloat(((sellValue/totalValue)* 100).toFixed(2)) : 0
    const holdPercent = holdValue > 0 ? parseFloat(((holdValue/totalValue)* 100).toFixed(2)) : 0

    let displayBuyButton = 
        (userChoiceFromStorage.stockName !== stockName 
            || 
        ((userChoiceFromStorage.action !== "BUY" ) && (userChoiceFromStorage.stockName === stockName || !userChoiceFromStorage.stockName )))
        ? true : false
    
    let displaySellButton = 
        (userChoiceFromStorage.stockName !== stockName 
            || 
        ((userChoiceFromStorage.action !== "SELL") && (userChoiceFromStorage.stockName === stockName || !userChoiceFromStorage.stockName )))
        ? true : false

    let displayHoldButton = 
        (userChoiceFromStorage.stockName !== stockName 
            || 
        ((userChoiceFromStorage.action !== "HOLD") && (userChoiceFromStorage.stockName === stockName || !userChoiceFromStorage.stockName )))
        ? true : false

    return (
        <div>
                    {/* Donut chart */}
                    <DonutChart 
                        data = {[
                            {
                                label: 'Buy',
                                value: buyPercent
                            },
                            {
                                label: 'Sell',
                                value: sellPercent
                            },
                            {
                                label: 'Hold',
                                value: holdPercent
                            }
                        ]}
                        colors = {['#2a9d8f' , '#e76f51', '#e9c46a']}
                        onMouseEnter = {() => false}
                    />
                    <div className="buttonBlock"> 
                        <button onClick={handleBuySellHoldButtonClick} value="Buy" className={displayBuyButton ? "buyButton" : "buyButton disabled"}>Buy</button>

                        <button onClick={handleBuySellHoldButtonClick} value="Sell" className={displaySellButton ? "sellButton" : "sellButton disabled"}>Sell</button>

                        <button onClick={handleBuySellHoldButtonClick} value="Hold" className={displayHoldButton ? "holdButton" : "holdButton disabled"}>Hold</button>

                    </div>
                </div>
    )
}

export default GraphComponent;