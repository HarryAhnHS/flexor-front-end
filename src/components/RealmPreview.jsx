import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const RealmPreview = ({ realmId }) => {
    const navigate = useNavigate();
    const [realm, setRealm] = useState({});
    const [joined, setJoined] = useState(null);

    const userId = localStorage.getItem('userId');
    const isCreator = realm?.creatorId === userId;

    useEffect(() => {
        async function fetchRealm() {
            try {
                const response = await api.get(`/realms/${realmId}`);
                setRealm(response.data.realm);
            } catch (error) {
                console.error("Error fetching realm", error);
            }
        }

        async function fetchJoinedStatus() {
            try {
                const response = await api.get(`/realms/${realmId}/joiners`);
                const usersJoined = response.data.users.map(user => user.id);
                setJoined(usersJoined.includes(userId));
            } catch (error) {
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
                await api.post(`/realms/${realmId}/join`);
            } else {
                await api.delete(`/realms/${realmId}/join`);
            }
            setJoined(prev => !prev);
        } catch (error) {
            console.error("Error joining realm:", error);
        }
    };

    const redirectToRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/realms/${realmId}`);
    };

    const handleEditRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/submit-realm/${realmId}`);
    };

    return (
        <div
            key={realmId}
            className="bg-white p-4 rounded-lg shadow flex items-center space-x-4 cursor-pointer"
            onClick={(e) => redirectToRealm(e, realmId)}
        >
            <div className="flex-shrink-0">
                {realm?.realmPictureUrl && (
                    <img
                        src={realm?.realmPictureUrl}
                        alt={realm?.name}
                        className="w-32 h-32 object-cover rounded-md"
                    />
                )}
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{realm?.name}</h3>
                <p className="text-gray-600 mb-4">{realm?.description}</p>
                <div className="flex justify-between items-center">
                    <button
                        onClick={(e) => handleJoinRealm(e, realmId)}
                        className={`px-4 py-2 rounded-md text-white ${
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
    );
};

export default RealmPreview;
