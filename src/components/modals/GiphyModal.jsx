import { useState, useEffect, useRef, useCallback } from 'react';
import giphyClient from '../../services/giphyClient';

// Debounce function to limit API calls while typing
const useDebounce = (callback, delay) => {
  const timer = useRef();

  const debouncedCallback = useCallback((...args) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

const GiphyModal = ({ isOpen, onClose, onGifSelect }) => {
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const modalRef = useRef();

  const debouncedFetchGifs = useDebounce((searchTerm) => fetchGifs(searchTerm), 300);

  useEffect(() => {
    if (gifSearchTerm) {
      debouncedFetchGifs(gifSearchTerm);
    }
  }, [gifSearchTerm, debouncedFetchGifs]);

  const fetchGifs = async (searchTerm) => {
    setIsLoadingGifs(true);
    try {
      const { data } = await giphyClient.search(searchTerm, { limit: 10 });
      setGifs(data);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  const handleGifSearchChange = (e) => {
    setGifSearchTerm(e.target.value);
  };

  const handleGifSelect = (gif) => {
    onGifSelect(gif);
  };

  const handleClose = useCallback(() => {
    // Reset states + close
    setGifSearchTerm('');
    setGifs([]);
    onClose();
  },[onClose]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      setGifSearchTerm('');
      setGifs([]);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, handleClose]);

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80">
        <div
          ref={modalRef}
          className="bg-gray-800 text-gray-200 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden shadow-lg relative"
        >
          <h3 className="text-lg font-bold mb-2">Search Giphy</h3>
          <div className='text-sm mb-4 font-gray-200'>
            <p>Credits to Giphy API</p>
            <p className='text-xs text-indigo-500'>&#40;I&#39;m on the free plan... Don&#39;t spam this&#41;</p>
          </div>
          <input
            type="text"
            value={gifSearchTerm}
            onChange={handleGifSearchChange}
            placeholder="Search for a GIF"
            className="w-full p-2 border border-gray-700 rounded-lg mb-4 bg-gray-900 text-gray-200"
          />
          {isLoadingGifs ? (
              <div className="flex justify-center items-center h-full w-full">
                <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
              </div>
            ) 
            : (
            <div className="gif-grid grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => handleGifSelect(gif)}
                  className="cursor-pointer transform transition hover:scale-105 flex items-center justify-center"
                >
                  <img
                    src={gif.images.fixed_width_small.url}
                    alt={gif.title}
                    className="rounded-lg w-full"
                  />
                </div>
              ))}
            </div>
        )}
          <button
            className="absolute top-0 right-5 mt-4 text-white"
            onClick={handleClose}
          >
            &#10005;
          </button>
        </div>
      </div>
    )
  );
};

export default GiphyModal;
