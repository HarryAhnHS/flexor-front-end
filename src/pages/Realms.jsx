import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const Realms = () => {
    const [realms, setRealms] = useState([]);
    const [joinedRealms, setJoinedRealms] = useState(new Set()); // To keep track of joined realms

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        async function getRealms() {
            try {
                const response = await api.get("/realms/");
                setRealms(response.data.realms);
                // Assuming you have some way to fetch the joined realms
                const joinedResponse = await api.get(`/users/${userId}/joined`);
                setJoinedRealms(new Set(joinedResponse.data.realms.map(realm => realm.id)));
            } catch (error) {
                console.error("Error fetching realms:", error);
            }
        }
        getRealms();
    }, []);

    const handleJoinRealm = async (realmId) => {
        try {
            if (!joinedRealms.has(realmId)) {
                await api.post(`realms/${realmId}/join`);
                setJoinedRealms(prev => new Set(prev.add(realmId)));
            }
            else {
                await api.delete(`realms/${realmId}/join`);
                setJoinedRealms(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(realmId);
                    return newSet;
                });
            }
            
        } catch (error) {
            console.error("Error joining realm:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="p-8 bg-gray-100 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">All Realms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {realms.map((realm) => (
                            <div key={realm.id} className="bg-white p-4 rounded-lg shadow">
                                {realm.realmPictureUrl && (
                                    <img
                                        src={realm.realmPictureUrl}
                                        alt={realm.name}
                                        className="w-full h-40 object-cover rounded-md mb-4"
                                    />
                                )}
                                <h3 className="text-xl font-semibold mb-2">{realm.name}</h3>
                                <p className="text-gray-600 mb-4">{realm.description}</p>
                                <button
                                    onClick={() => handleJoinRealm(realm.id)}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        joinedRealms.has(realm.id) ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {joinedRealms.has(realm.id) ? 'Joined' : 'Join'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Realms;
