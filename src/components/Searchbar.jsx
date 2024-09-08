import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [dropdownDisplay, setDropdownDisplay] = useState(false);
    const dropdownRef = useRef(null);
    const limit = 10;

    const fetchResults = useCallback(async () => {
        if (query.length < 3) return;

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

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownDisplay(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [dropdownDisplay]);

    const handleSearchChange = (e) => {
        setQuery(e.target.value);
        setResults([]);
        setPage(1);
        setDropdownDisplay(true);
    };

    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
        setResults([]);
        setPage(1);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleNavigate = (path) => () => {
        navigate(path);
        setDropdownDisplay(false);
    };

    const renderResult = (result) => {
        return (
            <div 
                key={result.id} 
                className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
                onClick={handleNavigate(result.username ? `/profile/${result.id}` : result.name ? `/realms/${result.id}` : `/posts/${result.id}`)}
            >
                {!result.images || result.images?.[0] != null ?
                    <img 
                        src={result.profilePictureUrl || result.realmPictureUrl || result.images?.[0]?.url} 
                        alt={result.username || result.name || result.title} 
                        className="w-12 h-12 rounded-full object-cover mr-3" 
                    />
                :
                    <div className="w-12 h-12 truncate mr-3 text-sm text-gray-500 italic flex items-center">
                        {result.title}
                    </div>  
                }
                
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{result.username || result.name || result.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                        {result.username ? 'User' : result.name ? 'Realm' : 'Post'}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='w-full relative' ref={dropdownRef}>
            <div className={`flex items-center bg-gray-800 rounded-lg transition-all duration-300 p-3 overflow-hidden`}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="cursor-pointer"/>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Search for users, realms, posts..."
                    className="bg-transparent flex-1 outline-none px-2 text-sm"
                    autoFocus
                />
                <div className='text-sm'>
                    <span className=''>
                        By:
                    </span>
                    <select
                        value={searchType}
                        onChange={handleSearchTypeChange}
                        className="bg-transparent text-sm ml-2 outline-none"
                    >
                        <option value="all">All</option>
                        <option value="users">Users</option>
                        <option value="realms">Realms</option>
                        <option value="posts">Posts</option>
                    </select>
                </div>
                
            </div>
            {query.length > 0 && (
                <div className={`absolute left-0 right-0 mt-2 bg-gray-800 border-gray-800 rounded-lg shadow-lg max-h-80 overflow-y-auto z-[99999] ${dropdownDisplay ? '' : 'hidden'}`}>
                    {loading && <div className="p-4 text-center text-gray-200">Loading...</div>}
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
                                            className="block p-2 text-center text-sm text-gray-200 w-full hover:bg-gray-700"
                                        >
                                            Load More
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 text-center text-gray-200">No results found</div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;

