import "./infoBlock.css";

function InfoBlockText({ text }) {
  return <p className="InfoBlockText">{text}</p>;
}

function InfoBlockTitle({ title }) {
  return <h1 className="InfoBlockTitle">{title}</h1>;
}

export default function InfoBlock({ items }) {
  return (
    <div className="InfoBlock">
      {items.map((item, index) => (
        <>
          <InfoBlockTitle key={`title-${index}`} title={item.title} />
          {item.text.map((text, i) => (
            <InfoBlockText key={`${index}-${i}`} text={text} />
          ))}
        </>
      ))}
    </div>
  );
}
