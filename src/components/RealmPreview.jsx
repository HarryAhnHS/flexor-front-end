import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightToBracket, faCheck, faEllipsis, faPenToSquare, faTrashCan, faUsers } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { faMicroblog } from "@fortawesome/free-brands-svg-icons";
import { PuffLoader } from 'react-spinners';

const RealmPreview = ({ realm, realmId, setRealms }) => {
    const navigate = useNavigate();
    const [joined, setJoined] = useState(null);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('userId');
    const isCreator = realm?.creatorId === userId;

    useEffect(() => {
        setLoading(true);

        async function fetchJoinedStatus() {
            try {
                const response = await api.get(`/realms/${realmId}/joiners`);
                const usersJoined = response.data.users.map(user => user.id);
                setJoined(usersJoined.includes(userId));
            } catch (error) {
                console.error("Error fetching realm", error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchJoinedStatus();
    }, [realmId, userId]);

    const handleJoinRealm = async (e) => {
        e.stopPropagation();
        try {
            if (!joined) {
                await api.post(`/realms/${realmId}/join`);
                setRealms(prevRealms =>
                    prevRealms.map((r) => 
                    r.id == realmId 
                    ? {
                        ...r,
                        _count: { ...r._count, joined: r._count.joined + 1}
                    }
                    : 
                        r
                    )
                );    
            } else {
                await api.delete(`/realms/${realmId}/join`);
                setRealms(prevRealms =>
                    prevRealms.map((r) => 
                    r.id == realmId 
                    ? {
                        ...r,
                        _count: { ...r._count, joined: r._count.joined - 1}
                    }
                    : 
                        r
                    )
                );
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

    const handleDeleteRealm = async (e, realmId) => {
        e.stopPropagation();
        try {
            await api.delete(`/realms/${realmId}`);
            
            setRealms((prev) => (prev).filter((realm) => realm.id !== realmId));
        } catch (error) {
            console.error("Error deleting realm:", error);
        }
    };

    return (
        <div
            key={realmId}
            className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-6 cursor-pointer transition-colors"
            onClick={(e) => redirectToRealm(e, realmId)}
        >
            {loading 
            ? 
                <div className="flex justify-center items-center h-[120px] w-full">
                    <PuffLoader color="#5C6BC0" size={60} />
                </div>
            :
            <>
                {/* Realm Image */}
                <div className="flex-shrink-0">
                    {realm?.realmPictureUrl && (
                        <img
                            src={realm?.realmPictureUrl}
                            alt={realm?.name}
                            className="w-24 h-24 object-cover rounded-md"
                        />
                    )}
                </div>

                {/* Realm Details */}
                <div className="flex-1">
                    <div className="mb-2 flex justify-between">
                        <span className="font-semibold text-2xl overflow-wrap-break-word break-all line-clamp-1">{realm?.name}</span>
                        {/* Edit Button */}
                            <div className="flex items-center px-3 text-gray-400">
                                <Menu as="div" className="relative">
                                    <MenuButton onClick={(e) => e.stopPropagation()}>
                                        <FontAwesomeIcon icon={faEllipsis} className="hover:text-gray-300"/>
                                    </MenuButton>
                                    <MenuItems 
                                        className="absolute right-0 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md w-40"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isCreator && 
                                            <>
                                            <MenuItem>
                                                    <button
                                                        onClick={(e) => handleEditRealm(e, realmId)}
                                                        className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                    >
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                        <span>Edit</span>
                                                    </button>
                                            </MenuItem>
                                            <MenuItem>
                                                    <button
                                                        onClick={(e) => handleDeleteRealm(e, realmId)}
                                                        className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                                    >
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                        <span>Delete</span>
                                                    </button>
                                            </MenuItem>
                                            </>
                                        }
                                        <MenuItem>
                                            <button
                                                onClick={() => navigate(`/realms/${realmId}/joined`)}
                                                className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-600'
                                            >
                                                <FontAwesomeIcon icon={faUsers} />
                                                <span>Joined Users</span>
                                            </button>
                                        </MenuItem>

                                    </MenuItems>
                                </Menu>
                            </div>
                    </div>
                    <p className="text-gray-400 mt-2 overflow-hidden text-ellipsis overflow-wrap-break-word break-all line-clamp-2">
                        {realm?.description}
                    </p>

                    <div className="flex justify-between items-center">
                        <div className="flex space-x-4 text-base">
                            <div className="text-gray-400 space-x-2" onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/realms/${realmId}/joined`)
                            }}>
                                <FontAwesomeIcon icon={faUsers} />
                                <span className="text-sm">{realm._count?.joined} Joined</span>
                            </div>
                            <div className="text-gray-400 space-x-2">
                                <FontAwesomeIcon icon={faMicroblog} />
                                <span className="text-sm">{realm._count?.posts} Posts</span>
                            </div>
                        </div>
                        {/* Join Button */}
                        <button
                            onClick={(e) => handleJoinRealm(e)}
                            className={`px-4 py-2 rounded-lg text-white transition-colors ${
                                joined ? 'bg-gray-600 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {joined ? 
                            <div className="space-x-2 text-sm">
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Joined</span>
                            </div>
                            : 
                            <div className="space-x-2 text-sm">
                                <FontAwesomeIcon icon={faArrowRightToBracket}/>
                                <span>Join</span>
                            </div>
                            }
                        </button>
                    </div>
                </div>
            </>
            }
        </div>
    );
};

export default RealmPreview;
