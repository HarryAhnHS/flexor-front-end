import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import RealmPreview from "../components/RealmPreview";

const Realms = () => {
    const [realms, setRealms] = useState([]);

    useEffect(() => {
        async function getRealms() {
            try {
                const response = await api.get("/realms/");
                setRealms(response.data.realms);
            } 
            catch (error) {
                console.error("Error fetching realms:", error);
            }
        }
        getRealms();
    }, []);
    
    return (
        <>
            <Navbar />
            <div className="p-8 bg-gray-100 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">All Realms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {realms.map((realm) => (
                            <RealmPreview realmId={realm.id} key={realm.id} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Realms;
