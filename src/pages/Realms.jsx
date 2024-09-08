import { useState } from "react";
import RealmsList from "../components/RealmsList";

const Realms = () => {
    const [selectedTab, setSelectedTab] = useState('all');

    return (
        <>
            <div className="p-8 bg-gray-100 min-h-screen">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6">All Realms</h2>
                    <div className="mb-6 flex justify-center space-x-4">
                        <button
                            onClick={() => setSelectedTab('all')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedTab('joined')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'joined' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            Joined
                        </button>
                        <button
                            onClick={() => setSelectedTab('created')}
                            className={`px-4 py-2 rounded-md ${selectedTab === 'created' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-500 hover:text-white`}
                        >
                            Created
                        </button>
                    </div>
                    <section>
                        <RealmsList type={selectedTab}/>
                    </section>
                </div>
            </div>
        </>
    );
};

export default Realms;