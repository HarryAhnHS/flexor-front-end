const ImageViewer = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
            <div className="relative">
                <img 
                    src={imageUrl} 
                    className="max-w-full max-h-screen object-contain" 
                />
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-white text-2xl font-bold"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ImageViewer;
