"use client"

import { AiOutlineWifi } from "react-icons/ai"

export const Header = () => {
    return <header>
        <nav>
            <div className="navbrand">
                <h1 className="flex items-center">
                    Ultra-Share.
                    <AiOutlineWifi className="blue"/>
                </h1>
            </div>

            <div className="nav-links">
                
            </div>
        </nav>
    </header>
}