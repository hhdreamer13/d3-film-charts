const Legend = ({ schoolObj }) => {
  return (
    <div className="mt-1">
      {schoolObj.map((school) => (
        <div key={school.name}>
          <span
            className={"mr-1 inline-block h-3 w-3 rounded-xl"}
            style={{
              backgroundColor: school.color,
            }}
          ></span>
          {school.name}
        </div>
      ))}
    </div>
  );
};

export default Legend;
