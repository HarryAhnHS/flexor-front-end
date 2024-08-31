import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const RealmPreview = ({realmId}) => {
    const navigate = useNavigate();
    const [realm, setRealm] = useState({});
    const [joined, setJoined] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        console.log("realm preview use effect running")
        async function fetchRealm() {
            try {
                const response = await api.get(`/realms/${realmId}`);
                console.log(response);
                setRealm(response.data.realm);
            }
            catch(error) {
                console.error("Error fetching realm", error);
            }
        }

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
            }
            else {
                await api.delete(`realms/${realmId}/join`);
            }
            setJoined(prev => !prev);
        } catch (error) {
            console.error("Error joining realm:", error);
        }
    };

    const redirectToRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/realms/${realmId}`);
    }

    console.log(realmId);
    console.log(realm); 
    return (
        <div key={realmId} className="bg-white p-4 rounded-lg shadow cursor-pointer" 
            onClick={(e) => redirectToRealm(e, realmId)}>
            {realm?.realmPictureUrl && (
                <img
                    src={realm?.realmPictureUrl}
                    alt={realm?.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                />
            )}
            <h3 className="text-xl font-semibold mb-2">{realm?.name}</h3>
            <p className="text-gray-600 mb-4">{realm?.description}</p>
            <button
                onClick={(e) => handleJoinRealm(e, realmId)}
                className={`px-4 py-2 rounded-md text-white ${
                    joined ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                {joined ? 'Joined' : 'Join'}
            </button>
        </div>

    )
}

export default RealmPreview;