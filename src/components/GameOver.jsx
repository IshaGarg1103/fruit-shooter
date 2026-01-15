const GameOver = ({ score, highScore, isNewHighScore, onRestart }) => {
  const playClickSound = () => {
    const audio = new Audio('./click.mp3');
    audio.volume = 0.5;
    audio.play();
  };

  const handleRestart = () => {
    playClickSound();
    onRestart();
  };

  return (
    <div className="screen game-over-screen">
      <h1 className="game-over-title">GAME OVER</h1>

      {isNewHighScore && (
        <div className="new-high-score">
          ★ NEW HIGH SCORE! ★
        </div>
      )}

      <div className="final-score">
        <div className="score-label">FINAL SCORE</div>
        <div className="score-value">{score.toString().padStart(6, '0')}</div>
      </div>

      <div className="high-score-display">
        BEST: {highScore.toString().padStart(6, '0')}
      </div>

      <button className="restart-button" onClick={handleRestart}>
        ↻ PLAY AGAIN
      </button>

      <div className="fruits-fallen">
        🍎 🍊 🍇 🍌 🍉 🍓
      </div>
    </div>
  );
};

export default GameOver;
