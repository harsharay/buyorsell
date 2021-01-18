import React, { useState, useEffect } from "react";
import DonutChart from 'react-donut-chart';
import { createStockDocument , firestore } from "../../FirebaseFunctions/firebase.utils";
import publicIp from "public-ip";

import "./StockDetailPage.css"

const StockDetailPage = (props) => {

    const [userIp, setUserIp] = useState("")
    const [userChoiceFromStorage, setUserChoiceFromStorage] = useState({})
    const [buttonClicked, setButtonClicked] = useState(false)
    const [buyValue, setBuyValue] = useState(0)
    const [sellValue, setSellValue] = useState(0)
    const [holdValue, setHoldValue] = useState(0)

    const getClientIp = async () => setUserIp(await publicIp.v4());

    useEffect(() => {
        // sessionStorage.setItem("userChoice","")
        createStockDocument(props.match.params.stockName)
        getClientIp()
    },[])

    useEffect(() => {
        sessionStorage.setItem("userIp", userIp)
    },[userIp])

    const getPercentDetailsFirestore = async () => {
        let reference = await firestore.collection('stockDetails').where('stockName','==',props.match.params.stockName).get()
        reference.forEach(item => {
            setBuyValue(item.data().buyPercent)
            setSellValue(item.data().sellPercent)
            setHoldValue(item.data().holdPercent)
        })
        
    }

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         getPercentDetailsFirestore()
    //     }, 5000);
        
    //     return () => clearInterval(interval)
        
    // },[buyValue, sellValue, holdValue])

    //This is to update the page on the page load
    useEffect(() => {
            getPercentDetailsFirestore()
    },[])

    //This updates the page every 5 seconds to show the latest content
    useEffect(() => {
        const interval = setInterval(() => {
            getPercentDetailsFirestore()
        }, 5000);
        
        return () => clearInterval(interval)
    },[])

    const handleBuySellHoldPercent = async e => {
        console.log(13, e.target.value)
        let buttonValue = e.target.value

        if(buttonValue === "Buy") {
            setButtonClicked(true)
            setBuyValue(buyValue + 1)
            sessionStorage.setItem("userChoice",JSON.stringify({stockName: props.match.params.stockName , action: 'BUY'}))
            await firestore.doc(`/stockDetails/${props.match.params.stockName}`).update({
                buyPercent : buyValue + 1
            })
            setButtonClicked(false)
        } else if(buttonValue === "Sell") {
            setButtonClicked(true)
            setSellValue(sellValue + 1)
            sessionStorage.setItem("userChoice",JSON.stringify({stockName: props.match.params.stockName , action: 'SELL'}))
            await firestore.doc(`/stockDetails/${props.match.params.stockName}`).update({
                sellPercent : sellValue + 1
            })
            setButtonClicked(false)
        } else {
            setButtonClicked(true)
            setHoldValue(holdValue + 1)
            sessionStorage.setItem("userChoice",JSON.stringify({stockName: props.match.params.stockName , action: 'HOLD'}))
            await firestore.doc(`/stockDetails/${props.match.params.stockName}`).update({
                holdPercent : holdValue + 1
            })
            setButtonClicked(false)
        }
    }

    //GETTING USER CHOICE FROM STORAGE
    const getUserChoiceFromStorage = () => {
        let storageData = JSON.parse(sessionStorage.getItem('userChoice'))
        setUserChoiceFromStorage(storageData)  // SETUSERCHOICE IS A STATE CONTAINER; GETUSERCHOICE IS A FUNCTION
    }

    useEffect(() => {
        let storageData = sessionStorage.getItem('userChoice')
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


    return (
        <>
            <h1>{props.match.params.stockName}</h1>
            <div className="stockDetailPage-Content">
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
                        <button onClick={handleBuySellHoldPercent} value="Buy">Buy</button> 
                        <button onClick={handleBuySellHoldPercent} value="Sell">Sell</button>
                        <button onClick={handleBuySellHoldPercent} value="Hold">Hold</button>
                    </div>
                </div>
                <div className="chatBlock">
                    {/* Chat block */}
                    <p>Chat here</p>
                </div>
            </div>
        </>
    )
}

export default StockDetailPage;