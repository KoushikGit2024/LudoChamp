import '../styles/dice.css'
const DiceFace = ({ value }) => {
  const map = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  return (
    <div className="dice-grid">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`pip ${map[value].includes(i + 1) ? "on" : ""}`} />
      ))}
    </div>
  );
};

export default DiceFace;