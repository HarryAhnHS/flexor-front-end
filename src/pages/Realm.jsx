import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import PostsList from "../components/PostsList";

const Realm = () => {
    const navigate = useNavigate();
    const { realmId } = useParams();
    const [realm, setRealm] = useState(null);
    const [joined, setJoined] = useState(null);

    const userId = localStorage.getItem('userId');
    const isCreator = realm?.creatorId === userId;

    useEffect(() => {
        const fetchRealm = async () => {
            try {
                const response = await api.get(`/realms/${realmId}`);
                setRealm(response.data.realm);
            } 
            catch (error) {
                console.error("Error fetching realm details:", error);
            }
        };

        async function fetchJoinedStatus() {
            try {
                const response = await api.get(`/realms/${realmId}/joiners`);
                const usersJoined = response.data.users.map(user => user.id);
                setJoined(usersJoined.includes(userId));
            }
            catch(error) {
                console.error("Error fetching realm", error);
            }
        }

        fetchRealm();
        fetchJoinedStatus();
    }, [realmId, userId]);

    const handleJoinRealm = async (e, realmId) => {
        e.stopPropagation();
        try {
            if (!joined) {
                await api.post(`realms/${realmId}/join`);
            } else {
                await api.delete(`realms/${realmId}/join`);
            }
            setJoined(prev => !prev);
        } catch (error) {
            console.error("Error joining realm:", error);
        }
    };

    const handleEditRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/submit-realm/${realmId}`);
    };

    return (
        <>
            <div className="bg-gray-100 min-h-screen p-6">
                {realm && (
                    <div className="container mx-auto flex bg-white shadow-md rounded-lg p-6">
                        {/* Realm Image */}
                        <div className="w-1/3 md:w-1/4">
                            <img
                                src={realm.realmPictureUrl}
                                alt={`${realm.name} picture`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                        
                        {/* Realm Info */}
                        <div className="w-2/3 md:w-3/4 ml-6">
                            <div className="flex flex-col justify-between h-full">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{realm.name}</h1>
                                    <p className="text-gray-600">{realm.description}</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Created by @{realm.creator.username}
                                    </p>
                                </div>
                                <div className="flex space-x-4 text-gray-600 mt-4">
                                    <div>
                                        <span className="font-semibold">{realm._count.posts}</span> Posts
                                    </div>
                                    <div className="cursor-pointer" onClick={() => navigate(`/realms/${realm.id}/joined`)}>
                                        <span className="font-semibold">{realm._count.joined}</span> Members
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleJoinRealm(e, realmId)}
                                    className={`mt-4 px-4 py-2 rounded-md text-white ${
                                        joined ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {joined ? 'Joined' : 'Join'}
                                </button>
                                {isCreator && (
                                    <button
                                        onClick={(e) => handleEditRealm(e, realmId)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Section */}
                <section>
                    <PostsList 
                        sourceId={realmId}
                        type="realm_posts" 
                    />
                </section>
            </div>
        </>
    );
};

export default Realm;
