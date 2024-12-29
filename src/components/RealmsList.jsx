import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import RealmPreview from "../components/RealmPreview";
import { PuffLoader } from 'react-spinners';
import { useOutletContext } from 'react-router-dom'; // Import useOutletContext for scrollevent to paginate

const RealmsList = ( {type} ) => {
    const [realms, setRealms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // Track the current page
    const [hasMore, setHasMore] = useState(true); // Track if there are more posts to load
    const limit = 10; // Number of posts per page

    const { scrollableRef } = useOutletContext();

    const userId = localStorage.getItem('userId');

    const resetRealms = useCallback(() => {
        // Clear posts when sourceId or type changes
        setRealms([]);
        setPage(1);
        setHasMore(true);
    }, []);

    useEffect(() => {
        resetRealms();
    }, [type, resetRealms]);

    useEffect(() => {
        const fetchRealms = async () => {
            try {
                setLoading(true);
                let response;
                switch (type) {
                    case 'joined':
                        response = await api.get(`users/${userId}/joined`, { params: { page, limit } });
                        break;
                    case 'created':
                        response = await api.get(`users/${userId}/created`, { params: { page, limit } });
                        break;
                    case 'all':
                        response = await api.get('/realms/', { params: { page, limit } });
                        break;
                    default:
                        response = { data: { realms: [] } };
                        break;
                };

                if (response.data.realms.length < limit) {
                    setHasMore(false); // No more users to load
                }

                setRealms((prevRealms) => [...prevRealms, ...response.data.realms]);
            } catch (error) {
                console.error("Error fetching realms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRealms();
    }, [type, page, userId]);

    useEffect(() => {
    const handleScroll = () => {
      if (
        scrollableRef.current &&
        scrollableRef.current.scrollTop + scrollableRef.current.clientHeight >=
          scrollableRef.current.scrollHeight - 100 &&
        hasMore &&
        !loading
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const scrollableElement = scrollableRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollableRef, hasMore, loading]);

    return (
        <>
            <div className="user-list space-y-4">
                {realms.length > 0 
                ?
                realms.map((realm) => (
                    <RealmPreview 
                        realm={realm}
                        realmId={realm.id} 
                        setRealms={setRealms}
                        key={realm.id} 
                    />
                ))
                :
                !loading && <p className="text-gray-600 text-center mt-8">No realms available.</p>
                }
                {loading && 
                    <div className="flex justify-center items-center h-full">
                        <PuffLoader color="#5C6BC0" size={60} />
                    </div>
                }
            </div>
        </>
    );
};

export default RealmsList;