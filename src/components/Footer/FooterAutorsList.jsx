import FooterAutorsListItem from "./FooterAutorsListItem";

const authors = [
  { name: "taishakutenn", link: "https://github.com/taishakutenn" },
  { name: "Cy-Nec", link: "https://github.com/Cy-Nec" },
];

export default function FooterAutorsList() {
  return (
    <div className="footer__autors-container">
      <p className="footer__autors-team">Разработано командой: Protocol 418</p>
      <ul className="footer__autors-list">
        {authors.map((author, index) => (
          <FooterAutorsListItem key={index} name={author.name} link={author.link} />
        ))}
      </ul>
    </div>
  );
}