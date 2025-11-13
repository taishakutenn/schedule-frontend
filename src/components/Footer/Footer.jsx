import "./footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-box">
          <div className="footer__autors-container">
            <p className="footer__autors-team">
              Разработано командой: Protocol 418
            </p>
            <ul className="footer__autors-list">
              <li>
                <a href="https://github.com/taishakutenn/OGTIwi">
                  taishakutenn
                </a>
              </li>
              <li>
                <a href="https://github.com/Cy-Nec">Cy-Nec</a>
              </li>
            </ul>
          </div>
          <div></div>
        </div>
      </div>
    </footer>
  );
}
