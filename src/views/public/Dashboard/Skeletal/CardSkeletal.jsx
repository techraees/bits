import React from 'react'
import CardSkeletalCard from './CardSkeletalCard'
import './css/index.css'

const CardSkeletal = () => {
    return (
        <div className='skeletal_parent'>
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
            <CardSkeletalCard />
        </div>
    )
}

export default CardSkeletal