const ImageViewer = ({ imageUrl, onClose }) => {
    const handleOutsideClick = (e) => {
        // If the click is on the backdrop (outside the image), trigger onClose
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleOutsideClick} 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"
        >
            <div className="relative">
                <img 
                    src={imageUrl} 
                    className="max-w-full max-h-[90vh] object-contain" 
                    onClick={(e) => e.stopPropagation()} // Prevents click event from closing modal
                />
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevents click event from closing modal
                        onClose();
                    }} 
                    className="absolute top-4 right-4 w-[30px] h-[30px] text-white rounded-full bg-black bg-opacity-40 text-2xl font-bold"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ImageViewer;
