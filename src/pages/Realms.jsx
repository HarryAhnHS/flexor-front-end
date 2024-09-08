import { useState } from "react";
import RealmsList from "../components/RealmsList";

const Realms = () => {
    const [selectedTab, setSelectedTab] = useState('all');

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            {/* Page Title and Tabs */}
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Realms</h1>
                    {/* Tabs for All, Joined, and Created */}
                    <div className="flex space-x-4">
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
                    </div>
                </div>

                {/* Realms Content */}
                <RealmsList type={selectedTab} />
            </div>
        </div>
    );
};

export default Realms;
