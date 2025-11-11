import InfoBlockTitle from "./infoBlockTitle";
import InfoBlockText from "./InfoBlockText";

import "./infoBlock.css";

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
