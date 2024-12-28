import { useState } from "react";
import RealmsList from "../components/RealmsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Realms = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('all');

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            {/* Page Title and Tabs */}
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">Realms</h1>
                    {/* Tabs for All, Joined, and Created */}
                    <div className="flex space-x-4 text-xs sm:text-base">
                        <button
                            onClick={() => setSelectedTab('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedTab('joined')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'joined' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                        >
                            Joined
                        </button>
                        <button
                            onClick={() => setSelectedTab('created')}
                            className={`px-4 py-2 rounded-lg transition-colors ${selectedTab === 'created' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'} hover:bg-indigo-700`}
                        >
                            Created
                        </button>
                        <div className="border-l border-gray-700 mx-4 my-2"></div>
                        <button onClick={() => navigate('/submit-realm')}
                            className={`px-4 py-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500`}
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2"/>
                            New Realm
                        </button>
                    </div>
                </div>

                {/* Realms Content */}
                <RealmsList type={selectedTab} />
            </div>
        </div>
    );
};

export default Realms;
