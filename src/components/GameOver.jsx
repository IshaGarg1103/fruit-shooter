const GameOver = ({ score, highScore, isNewHighScore, onRestart, onHome }) => {
  const playClickSound = () => {
    const audio = new Audio('./click.mp3');
    audio.volume = 0.5;
    audio.play();
  };

  const handleRestart = () => {
    playClickSound();
    onRestart();
  };

  const handleHome = () => {
    playClickSound();
    onHome();
  };

  return (
    <div className="screen game-over-screen">
      <video 
        className="game-over-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="./Untitled.mp4" type="video/mp4" />
      </video>
      <button className="home-button" onClick={handleHome}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V10M19 10L21 12M9 22V16C9 15.4696 9.21071 14.9609 9.58579 14.5858C9.96086 14.2107 10.4696 14 11 14H13C13.5304 14 14.0391 14.2107 14.4142 14.5858C14.7893 14.9609 15 15.4696 15 16V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isNewHighScore && (
        <div className="new-high-score">
          NEW HIGH SCORE! 
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
        PLAY AGAIN
      </button>
    </div>
  );
};

export default GameOver;
