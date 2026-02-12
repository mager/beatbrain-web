const SaveModal = ({ content, setContent, submitPost, setIsModalOpen }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-terminal-surface border border-terminal-border rounded p-6 w-[340px]">
        <h2 className="font-display text-lg text-white mb-4">Share your thoughts</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How does it make you feel?"
          className="w-full h-24 bg-terminal-bg border border-terminal-border rounded text-phosphor font-mono text-sm p-3 placeholder:text-phosphor-dim focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="border border-terminal-border text-phosphor-dim hover:text-phosphor font-mono text-xs rounded px-4 py-2 transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="border border-accent bg-accent/10 text-accent hover:bg-accent/20 font-mono text-xs rounded px-4 py-2 transition-colors"
            onClick={submitPost}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
