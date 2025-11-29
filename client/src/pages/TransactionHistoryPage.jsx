import React from 'react';
import Navbar from '../components/Navbar';
import TransactionHistory from '../components/TransactionHistory';

export default function HomePage() {
    return (
        <div className='pt-20'>
            <Navbar />
            <TransactionHistory />
        </div>
    );
}
