import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import PostsList from "../components/PostsList";
import { faArrowRightToBracket, faCakeCandles, faCheck, faEllipsis, faPenToSquare, faTrashCan, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicroblog } from "@fortawesome/free-brands-svg-icons";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { formatDate } from "../utils/formatters";

const Realm = () => {
    const navigate = useNavigate();
    const { realmId } = useParams();
    const [realm, setRealm] = useState(null);
    const [realmMembers, setRealmMembers] = useState(0);
    const [joined, setJoined] = useState(null);

    const userId = localStorage.getItem('userId');
    const isCreator = realm?.creatorId === userId;

    useEffect(() => {
        const fetchRealm = async () => {
            try {
                const response = await api.get(`/realms/${realmId}`);
                setRealm(response.data.realm);
                setRealmMembers(response.data.realm._count.joined);
            } catch (error) {
                console.error("Error fetching realm details:", error);
            }
        };

        const fetchJoinedStatus = async () => {
            try {
                const response = await api.get(`/realms/${realmId}/joiners`);
                const usersJoined = response.data.users.map((user) => user.id);
                setJoined(usersJoined.includes(userId));
            } catch (error) {
                console.error("Error fetching realm", error);
            }
        };

        fetchRealm();
        fetchJoinedStatus();
    }, [realmId, userId]);

    const handleJoinRealm = async (e, realmId) => {
        e.stopPropagation();
        try {
            if (!joined) {
                await api.post(`realms/${realmId}/join`);
                setRealmMembers(prev => prev+1);
            } else {
                await api.delete(`realms/${realmId}/join`);
                setRealmMembers(prev => prev-1);
            }
            setJoined((prev) => !prev);
        } catch (error) {
            console.error("Error joining realm:", error);
        }
    };

    const handleEditRealm = (e, realmId) => {
        e.stopPropagation();
        navigate(`/submit-realm/${realmId}`);
    };

    const handleDeleteRealm = async (e, realmId) => {
        e.stopPropagation();
        try {
            await api.delete(`/realms/${realmId}`);
        } catch (error) {
            console.error("Error deleting realm:", error);
        }
    };

    console.log(realm);

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            {realm && (
                <div className="container mx-auto flex rounded-lg mb-8">
                    {/* Realm Image */}
                    <div className="flex-shrink-0 w-1/3 md:w-1/4">
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
                            <div className="mb-2 flex justify-between items-start">
                                <div className="flex flex-col justify-center">
                                    <div className="text-gray-400 text-base flex items-center space-x-2">
                                        <span className="text-sm text-gray-200">Created by</span>
                                        <div className="flex space-x-2 items-center">
                                            <img 
                                                src={realm.creator?.profilePictureUrl} 
                                                alt={`${realm.creator?.username}'s profile`} 
                                                className="w-6 h-6 rounded-full object-cover cursor-pointer" 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    navigate(`/profile/${realm.creatorId}`); 
                                                }}
                                            />
                                            <span 
                                                className="text-sm font-semibold text-blue-400 cursor-pointer hover:underline"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    navigate(`/profile/${realm.creatorId}`); 
                                                }}>
                                                @{realm.creator?.username}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-2xl">{realm?.name}</span>
                                </div>
                                {/* Edit Button */}
                                {isCreator && (
                                    <div className="flex items-center px-3 text-gray-400">
                                        <Menu as="div" className="relative">
                                            <MenuButton onClick={(e) => e.stopPropagation()}>
                                                <FontAwesomeIcon icon={faEllipsis} className="hover:text-gray-300"/>
                                            </MenuButton>
                                            <MenuItems className="absolute right-0 mt-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md w-40">
                                                <MenuItem>
                                                        <button
                                                            onClick={(e) => handleEditRealm(e, realmId)}
                                                            className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-700'
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                            <span>Edit</span>
                                                        </button>
                                                </MenuItem>
                                                <MenuItem>
                                                        <button
                                                            onClick={(e) => handleDeleteRealm(e, realmId)}
                                                            className='pl-6 text-left space-x-3 w-full py-2 text-sm hover:bg-gray-700'
                                                        >
                                                            <FontAwesomeIcon icon={faTrashCan} />
                                                            <span>Delete</span>
                                                        </button>
                                                </MenuItem>
                                            </MenuItems>
                                        </Menu>
                                    </div>
                                )}
                            </div>
                                <div className="text-gray-400 mb-2">{realm.description}</div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex space-x-4 text-sm text-gray-200">
                                    <div className="space-x-2 cursor-pointer" onClick={() => navigate(`/realms/${realm.id}/joined`)}>
                                        <FontAwesomeIcon icon={faUsers} />
                                        <span>{realmMembers} Joined</span>
                                    </div>
                                    <div className="space-x-2">
                                        <FontAwesomeIcon icon={faMicroblog} />
                                        <span>{realm._count?.posts} Posts</span>
                                    </div>
                                    <div className="space-x-2">
                                    <FontAwesomeIcon icon={faCakeCandles} />
                                        <span>{formatDate(realm.createdAt)}</span>
                                    </div>
                                </div>
                                {/* Join Button */}
                                <button
                                    onClick={(e) => handleJoinRealm(e, realmId)}
                                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                                        joined ? 'bg-gray-600 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {joined ? 
                                    <div className="space-x-2 text-sm">
                                        <span>Joined</span>
                                        <FontAwesomeIcon icon={faCheck} />
                                    </div>
                                    : 
                                    <div className="space-x-2 text-sm">
                                        <span>Join</span>
                                        <FontAwesomeIcon icon={faArrowRightToBracket}/>
                                    </div>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Section */}
            <PostsList sourceId={realmId} type="realm_posts" />
        </div>
    );
};

export default Realm;
