import "./infoBlock.css";

function InfoBlockText({ text }) {
  return <p className="InfoBlockText">{text}</p>;
}

function InfoBlockTitle({ title, level = 1 }) {
  const HeadingTag = `h${level}`;
  return (
    <HeadingTag className="InfoBlockTitle" data-level={level}>
      {title}
    </HeadingTag>
  );
}

export default function InfoBlock({ items }) {
  return (
    <div className="InfoBlock">
      {items.map((item, index) => (
        <div key={index}>
          <InfoBlockTitle
            key={`title-${index}`}
            title={item.title}
            level={item.level}
          />
          {item.text.map((text, i) => (
            <InfoBlockText key={`${index}-${i}`} text={text} />
          ))}
        </div>
      ))}
    </div>
  );
}
