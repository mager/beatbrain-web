const SaveModal = ({ content, setContent, submitPost, setIsModalOpen }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-content bg-white rounded-lg p-6 shadow-lg w-[300px]">
        <h2 className="text-xl font-bold mb-4">Share your thoughts</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How does it make you feel?"
          className="w-full h-24 border border-gray-300 rounded-md p-2"
        />
        <div className="mt-4 flex justify-end">
          <button
            className="bg-blue-500 text-white rounded-lg px-4 py-2 mr-2"
            onClick={submitPost}
          >
            Post
          </button>
          <button
            className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
