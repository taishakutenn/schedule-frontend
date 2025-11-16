import "./footer.css";
import FooterAutorsList from "./FooterAutorsList";

const authorsList = {
};

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-box">
          <FooterAutorsList props={authorsList}/>
          <div></div>
        </div>
      </div>
    </footer>
  );
}
