export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bubble-received px-4 py-3 flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
