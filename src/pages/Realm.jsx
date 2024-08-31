import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import PostPreview from "../components/PostPreview";
import Navbar from "../components/Navbar";

const Realm = () => {
    const { realmId } = useParams();
    const [realm, setRealm] = useState(null);
    const [posts, setPosts] = useState([]);

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

        const fetchPosts = async () => {
            try {
                const response = await api.get(`/realms/${realmId}/posts`);
                setPosts(response.data.posts);
            } 
            catch (error) {
                console.error("Error fetching realm posts:", error);
            }
        };

        fetchRealm();
        fetchPosts();
    }, [realmId]);

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-6">
                {realm && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <img
                                src={realm.realmPictureUrl}
                                alt={`${realm.name} picture`}
                                className="w-16 h-16 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{realm.name}</h1>
                                <p className="text-gray-600">{realm.description}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Created by @{realm.creator.username}
                                </p>
                            </div>
                        </div>

                        {/* Realm Meta */}
                        <div className="flex space-x-4 text-gray-600 mt-2">
                            <div>
                                <span className="font-semibold">{realm._count.posts}</span> Posts
                            </div>
                            <div>
                                <span className="font-semibold">{realm._count.joined}</span> Members
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostPreview key={post.id} postId={post.id} />
                        ))
                    ) : (
                        <p className="text-gray-600">No posts available in this realm.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Realm;
