import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import RealmPreview from "../components/RealmPreview";
import { CircularProgress } from "@mui/material";

const Realms = () => {
    const [realms, setRealms] = useState([]);
    const [selectedTab, setSelectedTab] = useState('All');
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchRealms = async () => {
            setLoading(true);
            try {
                let response;
                switch (selectedTab) {
                    case 'Joined':
                        response = await api.get(`users/${userId}/joined`);
                        break;
                    case 'Created':
                        response = await api.get(`users/${userId}/created`);
                        break;
                    case 'All':
                    default:
                        response = await api.get('/realms/');
                        break;
                }
                setRealms(response.data.realms);
            } catch (error) {
                console.error("Error fetching realms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRealms();
    }, [selectedTab, userId]);

    return (
        <>
            <Navbar />
            <div className="p-8 bg-gray-100 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">All Realms</h2>
                    <div className="mb-6 flex justify-center space-x-4">
                        <button
                            onClick={() => setSelectedTab('All')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedTab('Joined')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'Joined' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            Joined
                        </button>
                        <button
                            onClick={() => setSelectedTab('Created')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'Created' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            Created
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {realms.map((realm) => (
                                <RealmPreview realmId={realm.id} key={realm.id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Realms;