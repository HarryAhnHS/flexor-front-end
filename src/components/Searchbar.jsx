import { useState, useCallback, useEffect } from 'react';
import api from '../services/api'; // Ensure your API service is correctly set up
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('all'); // Default to 'all'
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    const fetchResults = useCallback(async () => {
        if (query.length < 3) return; // Start searching only if the query is at least 3 characters long

        setLoading(true);

        try {
            const { data } = await api.get('/search', {
                params: {
                    query,
                    type: searchType,
                    page,
                    limit
                }
            });

            console.log(data);

            setResults(prevResults => ([
                ...prevResults || [],
                ...data.results
            ]));

            setHasMore(data.results.length > 0);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setLoading(false);
        }
    }, [query, searchType, page]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleSearchChange = (e) => {
        setQuery(e.target.value);
        setResults([]); // Clear previous results
        setPage(1); // Reset pagination
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setResults([]); // Clear previous results
        setPage(1); // Reset pagination
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleNavigate = (path) => () => {
        navigate(path);
    };

    const renderResult = (result) => {
        if (searchType === 'all') {
            // Differentiating based on the type of result
            if (result.username) {
                // Render user result
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/profile/${result.id}`)}>
                        <img src={result.profilePictureUrl} alt={result.username} className='rounded-full' />
                        <div className="font-bold">{result.username}</div>
                        <div className="text-gray-500">User</div>
                    </div>
                );
            } else if (result.name) {
                // Render realm result
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/realms/${result.id}`)}>
                        <img src={result.realmPictureUrl} alt={result.name} className='rounded-full' />
                        <div className="font-bold">{result.name}</div>
                        <div className="text-gray-500">Realm</div>
                    </div>
                );
            } else if (result.title) {
                // Render post result
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/posts/${result.id}`)}>
                        {result.images && <img src={result.images[0]?.url} alt={result.title} className='' />}
                        <div className="font-bold">{result.title}</div>
                        <div className="text-gray-500">Post</div>
                        <div className='flex'>
                            <div>Posted by {result.user?.username}</div>
                            <img src={result.user?.profilePictureUrl} alt={result.user?.username} className='rounded-full' />
                        </div>
                    </div>
                );
            }
        } else {
            // Handle specific search types
            if (searchType === 'users' && result.username) {
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/profile/${result.id}`)}>
                        <img src={result.profilePictureUrl} alt={result.username} className='rounded-full' />
                        <div className="font-bold">{result.username}</div>
                        <div className="text-gray-500">User</div>
                    </div>
                );
            }
            if (searchType === 'realms' && result.name) {
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/realms/${result.id}`)}>
                        <img src={result.realmPictureUrl} alt={result.name} className='rounded-full' />
                        <div className="font-bold">{result.name}</div>
                        <div className="text-gray-500">Realm</div>
                    </div>
                );
            }
            if (searchType === 'posts' && result.title) {
                return (
                    <div key={result.id} className="p-2 border-b cursor-pointer" onClick={handleNavigate(`/posts/${result.id}`)}>
                        {result.images && <img src={result.images[0]} alt={result.title} className='' />}
                        <div className="font-bold">{result.title}</div>
                        <div className="text-gray-500">Post</div>
                        <div className='flex'>
                            <div>Posted by {result.user?.username}</div>
                            <img src={result.user?.profilePictureUrl} alt={result.user?.username} className='rounded-full' />
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="relative text-black">
            <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="border p-2 rounded"
            />
            <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="border p-2 rounded ml-2"
            >
                <option value="all">All</option>
                <option value="users">Users</option>
                <option value="realms">Realms</option>
                <option value="posts">Posts</option>
            </select>
            {query.length > 0 && (
                <div className="absolute z-10 bg-white border rounded mt-1 w-full">
                    {loading && <div className="p-2">Loading...</div>}
                    {!loading && (
                        <>
                            {results.length > 0 ? (
                                <>
                                    <div>
                                        {results.map(renderResult)}
                                    </div>
                                    {hasMore && (
                                        <button
                                            onClick={handleLoadMore}
                                            className="p-2 w-full text-blue-500"
                                        >
                                            Load More
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="p-2">No results found</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
