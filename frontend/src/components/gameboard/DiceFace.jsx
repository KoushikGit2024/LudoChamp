import '../../styles/dice.css'
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
    <div 
      className="dice-grid h-[60%] w-[60%] aspect-square grid place-items-center"
      style={{
        gridTemplateColumns:'repeat(3, 1fr)',
        gridTemplateRows:'repeat(3, 1fr)',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span 
          key={i} 
          className={`pip aspect-square w-[60%] h-[60%] rounded-full ${map[value].includes(i + 1) ? "bg-black" : "bg-blue-4000"}`} 
        />
      ))}
    </div>
  );
};

export default DiceFace;