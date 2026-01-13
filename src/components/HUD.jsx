import { INITIAL_LIVES } from '../game/constants';

const HUD = ({ score, lives, wave }) => {
  const hearts = [];
  for (let i = 0; i < INITIAL_LIVES; i++) {
    hearts.push(
      <span key={i} className={`heart ${i < lives ? 'active' : 'lost'}`}>
        {i < lives ? '♥' : '♡'}
      </span>
    );
  }

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="score">
          SCORE: {score.toString().padStart(5, '0')}
        </div>
        <div className="wave">
          WAVE {wave}
        </div>
      </div>
      <div className="hud-right">
        <div className="lives">{hearts}</div>
      </div>
    </div>
  );
};

export default HUD;
